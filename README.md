## Installation
SSH:
```
npm install git+ssh://git@gitlab.snapzio.com:van/apm-agent#33a076fa784ca621effb088337144fd1d47e22fc
```
HTTP:
```
npm install git+http://gitlab.snapzio.com/van/apm-agent#33a076fa784ca621effb088337144fd1d47e22fc
```

## Usage
Initialize apm-agent instance:
```
const APM = require('apm-agent');

const { APM_SERVER_URL, APM_TRANSACTIONS_COUNT_PER_REQUEST, VERSION } = process.env;

const apm = new APM({
  name: 'sme/admin-web',
  serverUrl: APM_SERVER_URL,
  transactionsPerRequest: APM_TRANSACTIONS_COUNT_PER_REQUEST, // default: 1
});
```

Set user context:
```
apm.setUserContext({ userId: '1a2b3c4d5e6f' }); // NOTE: Always set this on login and on logout.
```
Set tag context:
```
apm.setTagContext({ versionNumber: VERSION.number });
```

Set custom context:
```
apm.setCustomContext({ repo: 'sme/admin-web' });
```

#### Instrumentation
Initial Page Load:
```
const pageLoadTransaction = apm.startTransaction('initial', 'page-load');

window.addEventListener('load', () => {
  pageLoadTransaction.end();
});
```

With Feathers Hooks:
```
app.hooks({
  before: {
    all(context) {
      context.params.transaction = apm.startTransaction(context.path, context.method);
    },
  },

  after: {
    all(context) {
      context.params.transaction.end();
    },
  },
});
```


#### Note
The parameters for the ``transaction.end()`` are both optional. You can pass the result of the transaction on the first parameter (string), and the error logger (function) on the second.
```
transaction.end('loaded', reportError);
```
