import {RxJsonSchema} from 'rxdb';
import {Interaction} from './interaction';

export const interactionSchema: RxJsonSchema<Interaction> = {
  "title": "Interaction schema",
  "version": 0,
  "description": "describes an interaction",
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "primary": true
    },
    "description": {
      "type": "string"
    },
    "good": {
      "type": "boolean"
    },
    "date": {
      "type": "number"
    },
    "user_id": {
      "type": "string",
      "index": true
    },
    "partner_id": {
      "type": "string",
      "index": true
    }
  },
  "required": ["good", "description", "date"]
};
