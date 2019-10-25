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
{
  'interactions': {
    'partner@domain.com': [interaction]
  },
  'blocked': [
    'blocked@domain.com'
  ]
}
```

## API

```javascript

POST '/create'
request = {
  email: 'email@domain.com',
  password: 'password'
}

response = {
  success: !!user_id,
  result: (user_id && {
    user_id: 'id',
    token: '<JWT>',
    partner: 'partner@domain.com'
  }) || {
    message: 'error message'
  }
}

POST '/update'
request = {
  token: '<JWT>',
  partner: 'partner@domain.com',
  'love-language': null || '<Language>'
}

response = {
  success: !!user_id,
  result: (user_id && {
    user_id: 'id',
    token: '<JWT>',
    partner: 'partner@domain.com'
  }) || {
    message: 'error message'
  }
}

POST '/login'
request = {
  email: 'email@domain.com',
  password: 'password'
}

response = {
  success: !!user_id,
  result: (user_id && {
    user_id: 'id',
    token: '<JWT>',
    partner: 'partner@domain.com'
  }) || {
    message: 'error message'
  }
}

GET '/:email'
request = { }

response = {
  success: true,
  result: '<Language>'
}

GET '/:user_id/:partner'
request = { }

response = {
  success: true,
  result: interactions[0]
}

GET '/:user_id/:partner?start=<date>&end=<date>'
request = { }

response = {
  success: true,
  result: interactions
}

POST '/:user_id/:partner'
request = {
  token: '<JWT>',
  good: true || false,
  description: 'action/behavior',
}

response = {
  success: true,
  result: {
    message: 'action was sent!'
  }
}
```
