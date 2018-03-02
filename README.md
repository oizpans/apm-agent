## Installation
SSH:
```
npm install git+ssh://git@gitlab.snapzio.com:van/apm-agent.git
```
HTTP:
```
npm install git+http://gitlab.snapzio.com/van/apm-agent.git
```

## Usage
Initialize apm-agent instance:
```
import APM from 'apm-agent';

const { APM_SERVER_URL, APM_TRANSACTIONS_COUNT_PER_REQUEST, VERSION } = process.env;

const apm = new APM({
  name: 'sme/admin-web',
  serverUrl: APM_SERVER_URL,
  transactionsPerRequest: APM_TRANSACTIONS_COUNT_PER_REQUEST, // default: 1
});
```

Set user context:
```
apm.setUserContext({ userId: app.get('userId') }); // NOTE: Always set this on login and on logout.
```
Set tag context:
```
apm.setTagContext({ versionNumber: VERSION.number });
```

Set custom context:
```
apm.setCustomContext({ repo: 'sme/admin-web' });
```


With Feathers Hooks:
```

```
