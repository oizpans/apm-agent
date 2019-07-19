const uuid = require('uuidv4');

const Transaction = require('./transaction');

const Utils = require('./utils');

const pendingTransactions = {};

module.exports = class ApmAgent {
  constructor({
    name = 'unknown',
    serverUrl,
    serviceVersion,
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
      serverUrl: `${serverUrl}/intake/v2/rum/events`,
      transactionsPerRequest,
      transactionSampleRate,
      _id,
      serviceVersion,
      pendingTransactions,
    };

    this.context = {
      user: {},
      tags: {},
      custom: {},
    };

    this.meta = Utils.createMetaData({ name, version: serviceVersion });
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
    return new Transaction(name, type, this.meta, this.helpers, this.context);
  }
}