import {RxJsonSchema} from 'rxdb';
import {Interaction} from './interaction';

export const interactionSchema: RxJsonSchema<Interaction> = {
  "title": "Interaction schema",
  "version": 0,
  "description": "describes an interaction",
  "type": "object",
  "properties": {
    "description": {
      "type": "string",
      "primary": true
    },
    "good": {
      "type": "boolean"
    },
    "date": {
      "type": "date"
    }
  },
  "required": ["good", "description", "date"]
};
