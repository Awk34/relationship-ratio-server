import {Router, Request, Response} from 'express';
import {db} from '../db';
import {interactionSchema} from './interaction_schema';
import {RxCollection, RxDocument} from 'rxdb';

export interface Interaction {
  good: boolean;
  date: number;
  description: string;
}

export type UserDocument = RxDocument<Interaction>;
export type UserCollection = RxCollection<Interaction>;

export let interactionCollection: RxCollection;

export async function init() {
  interactionCollection = await db.collection({
    name: 'interactions',
    schema: interactionSchema,
  });
}

export const interactionRouter = Router();

interactionRouter.post('/interaction', async (req: Request, res: Response) => {
  const {good, date, description} = req.body;

  if(typeof good !== 'boolean') {
    return res.status(400).send('Invalid good/bad');
  } else if(!date) {
    return res.status(400).send('Date required');
  } else if(!description) {
    return res.status(400).send('Description required');
  }

  const doc = await interactionCollection.insert({good, date, description});

  console.log(doc);

  res.status(201).send(doc);
});
