const axios = require('axios');
const uuid = require('uuidv4');

const Utils = require('./utils');

const { NDJSON } = Utils;

module.exports = class Transaction {
  constructor(name, type, meta, helpers, context) {
    this.name = name;
    this.type = type;
    this.meta = meta;
    this.helpers = helpers;

    this.context = Object.assign({}, context);

    this.id = uuid();
    this.traceId = uuid();
    this.start = new Date();
  }

  _createTransaction(result) {
    return {
      "transaction": {
        "id": this.id,
        "name": this.name,
        "trace_id": this.traceId,
        "span_count": {
          "started": 10 // test
        },
        "duration": new Date() - this.start,
        "result": result || this.name,
        "type": this.type
      }
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

  end(result, reportError) {
    const trans = this._createTransaction(result);
    const ndjsonTrans = NDJSON.stringify(trans);
    const ndjsonMeta = NDJSON.stringify(this.meta);

    const { serverUrl } = this.helpers;

    const payload = `${ndjsonMeta}${ndjsonTrans}`;

    console.log(payload);

    axios.post(serverUrl, payload, { headers: { 'Content-Type': 'application/x-ndjson' } })
      .catch((error) => {
        console.log(error);
        if (reportError) {
          const newError = new Error(`Could not send transaction(s) to APM server. ${err.message}`);
          newError.debug = payload;
          reportError(newError);
        }
      });

  }
};