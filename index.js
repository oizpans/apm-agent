import axios from 'axios';
import uuid from 'uuidv4';

const pendingTransactions = {};

class Transaction {
  constructor(name, type, app, __helpers, context) {
    this.name = name;
    this.type = type;
    this.app = app;
    this.__helpers = __helpers;

    this.context = Object.assign({}, context, {
      custom: Object.assign({
        url: window.location.href,
        userAgent: window.navigator && window.navigator.userAgent,
      }, context.custom),
    });

    this.id = uuid();
    this.__start = new Date();
  }

  end(result, reportError) {
    this.result = result || this.name;
    this.timestamp = (new Date()).toISOString();

    this.duration = new Date() - this.__start;
    const { __id, __serverUrl, __transactionsPerRequest } = this.__helpers;

    delete this.__start;
    delete this.__helpers;

    pendingTransactions[__id].push(this);

    if (pendingTransactions[__id].length < __transactionsPerRequest) {
      return;
    }

    const data = {
      app: this.app,
      transactions: pendingTransactions[__id].map((t) => { delete t.app; return t; }),
    };

    pendingTransactions[__id].length = 0;

    axios.post(__serverUrl, data, { headers: { 'Content-Type': 'application/json' } })
      .catch((err) => {
        pendingTransactions[__id] = [...data.transactions, ...pendingTransactions[__id]];
        if (reportError) {
          const newError = new Error(`Could not send transaction(s) to APM server. ${err.message}`);
          newError.debug = [...pendingTransactions];
          reportError(newError);
        }
      });
  }
}

export default class ApmAgent {
/**
 * Represents an apm-agent.
 * @constructor
 * @param {string} name - The name of the client that will appear to the APM server
 * @param {string} __serverUrl - The url to which the logs will be sent.
 * @param {number} __transactionsPerRequest - The number of transactions collected before sending to server (default: 1).
 */
  constructor({
    name = 'unknown', serverUrl: __serverUrl, transactionsPerRequest: __transactionsPerRequest = 1,
  }) {
    if (!__serverUrl) throw new Error("'__serverUrl' is required.");
    if (!Number(__transactionsPerRequest)) throw new Error(`'__transactionsPerRequest' must be a a number, instead got a(n) ${typeof __transactionsPerRequest} (value: ${__transactionsPerRequest}).`);

    const __id = uuid();
    pendingTransactions[__id] = [];

    this.__helpers = {
      __transactionsPerRequest,
      __serverUrl: `${__serverUrl}/v1/client-side/transactions`,
      __id,
    };

    this.app = {
      name,
      version: '0.0.1',
      language: {
        name: 'javascript',
      },
      agent: {
        name: 'custom',
        version: '0.0.1',
      },
    };

    this.context = {
      user: {},
      tags: {},
      custom: {},
    };
  }

  setUserContext(userContext) {
    this.context.user = Object.assign({}, this.context.user, userContext);
  }

  setTagContext(tagsContext) {
    this.context.tags = Object.assign({}, this.context.tags, tagsContext);
  }

  setCustomContext(customContext) {
    this.context.custom = Object.assign({}, this.context.custom, customContext);
  }

  startTransaction(name, type) {
    return new Transaction(name, type, this.app, this.__helpers, this.context);
  }
}
