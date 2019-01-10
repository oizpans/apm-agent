const axios = require('axios');
const uuid = require('uuidv4');

const pendingTransactions = {};

class Transaction {
  constructor(name, type, app, helpers, context) {
    this.name = name;
    this.type = type;
    this.app = app;
    this.helpers = helpers;

    this.context = Object.assign({}, context);

    this.id = uuid();
    this.start = new Date();
  }

  /*
    todo : Fix duplicate methods setUserContext, setTagContext, setCustomContext
    possible new class? interface? ....
   */

  setUserContext(userContext) {
    this.context.user = Object.assign({}, this.context.user, userContext);
  }

  setTagContext(tagsContext) {
    this.context.tags = Object.assign({}, this.context.tags, tagsContext);
  }

  setCustomContext(customContext) {
    this.context.custom = Object.assign({}, this.context.custom, customContext);
  }

  end(result, reportError) {
    this.result = result || this.name;
    this.timestamp = (new Date()).toISOString();

    this.duration = new Date() - this.start;
    const { _id, serverUrl, transactionsPerRequest, transactionSampleRate } = this.helpers;

    if (Math.random() > transactionSampleRate) {
      return;
    }

    delete this.start;
    delete this.helpers;

    pendingTransactions[_id].push(this);

    if (pendingTransactions[_id].length < transactionsPerRequest) {
      return;
    }

    const data = {
      service: this.app,
      transactions: pendingTransactions[_id].map((t) => { delete t.app; return t; }),
    };

    pendingTransactions[_id].length = 0;

    axios.post(serverUrl, data, { headers: { 'Content-Type': 'application/json' } })
      .catch((err) => {
        pendingTransactions[_id] = [...data.transactions, ...pendingTransactions[_id]];
        if (reportError) {
          const newError = new Error(`Could not send transaction(s) to APM server. ${err.message}`);
          newError.debug = [...pendingTransactions[_id]];
          reportError(newError);
        }
      });
  }
}

module.exports = class ApmAgent {
  constructor({
    name = 'unknown',
    serverUrl,
    transactionsPerRequest = 1,
    transactionSampleRate = 1.0,
  }) {
    if (!serverUrl) {
      throw new Error("'serverUrl' is required.");
    }

    if (isNaN(transactionsPerRequest)) {
      throw new Error(`'transactionsPerRequest' must be a a number, instead got a(n) ${typeof transactionsPerRequest} (value: ${transactionsPerRequest}).`);
    }

    if (isNaN(transactionSampleRate)) {
      throw new Error(`'transactionSampleRate' must be a a number, instead got a(n) ${typeof transactionSampleRate} (value: ${transactionSampleRate}).`);
    }

    if (transactionsPerRequest < 0) {
      throw new Error("'transactionsPerRequest' must be greater than zero.");
    }


    const _id = uuid();
    pendingTransactions[_id] = [];

    this.helpers = {
      serverUrl: `${serverUrl}/v1/client-side/transactions`,
      transactionsPerRequest,
      transactionSampleRate,
      _id,
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

  /*
    todo : Fix duplicate methods setUserContext, setTagContext, setCustomContext
    possible new class? interface? ....
  */

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
    return new Transaction(name, type, this.app, this.helpers, this.context);
  }
}
