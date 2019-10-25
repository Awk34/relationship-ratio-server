# relationship-ratio-server

## Data Structures

```javascript
const Language = {
  TIME: 'Quality time',
  TOUCH: 'Physical touch',
  GIFTS: 'Receiving gifts',
  SERVICE: 'Acts of service',
  AFFIRMATIONS: 'Words of affirmation',
};

const user_info = {
  'id': '123456789',
  'partner': 'partner@domain.com',
  'password': 'hashedpassword',
  'love-language': Language.TIME,
};

const user = {
  'user@domain.com': user_info,
};

const users = { ...user };
const interaction = {
  'good': true,
  'date': new Date(),
  'description': 'good action/behavior that made me happy',
};

// contained in user@domain.com's file named 123456789.json
// this file is basically a stack or interactions from other users submitted
const interactions = {
  'partner@domain.com': [interaction]
};
```
