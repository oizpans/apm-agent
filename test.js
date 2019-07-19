const APM = require('./src/index');

const apmAgent = new APM({
  name: 'testing',
  serverUrl: 'https://dev-apm.rometic.com',
  serviceVersion: 'v-testing',
});

const pageLoadTransaction = apmAgent.startTransaction('123', 'agay');

const delays = [1,2,3,4,5];

let t = setTimeout(() => {
  pageLoadTransaction.end();
}, 40);

