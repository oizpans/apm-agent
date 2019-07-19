const APM = require('./src/index');

const apmAgent = new APM({
  name: 'testing',
  serverUrl: 'https://dev-apm.rometic.com',
  serviceVersion: 'v-testing',
});

apmAgent.setUserContext({ id: 'kasi123', username: 'kasi_husay', email: 'kasi@mailtester3.com' });
apmAgent.setTagContext({ name: 'site1', value: 'any value' });

const pageLoadTransaction = apmAgent.startTransaction('1236', 'request');

const delays = [1,2,3,4,5];

let t = setTimeout(() => {
  pageLoadTransaction.setCustomContext({ query: { $client: { pagination: 1 } } });
  pageLoadTransaction.end();
}, 60);

