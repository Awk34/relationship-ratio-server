import {RxJsonSchema} from 'rxdb';
import {User} from './user';

export const userSchema: RxJsonSchema<User> = {
  "title": "User schema",
  "version": 0,
  "description": "describes a user",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "final": true
    },
    "email": {
      "type": "string"
    },
    "partner": {
      "type": "string"
    },
    "password": {
      "type": "string"
    },
    "salt": {
      "type": "string"
    },
    "love_language": {
      "type": "string"
    }
  },
  "required": ["email", "partner", "password", "salt", "love_language"]
};
