import {Router, Request, Response} from 'express';
import {db} from '../db';
import {interactionSchema} from './interaction_schema';
import {RxCollection, RxDocument} from 'rxdb';
import uuid from 'uuid/v4';

export interface Interaction {
  id: string;
  user_id: string;
  partner_id: string;
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

  interactionCollection.preInsert((interaction) => {
    interaction.id = uuid();
  }, true);
}

export const interactionRouter = Router();

interactionRouter.post('/:user_id/:partner_id', async (req: Request, res: Response) => {
  const {good, date, description} = req.body;

  if(typeof good !== 'boolean') {
    return res.status(400).send({success: false, result: {message: 'Invalid good/bad'}});
  } else if(!date) {
    return res.status(400).send({success: false, result: {message: 'Date required'}});
  } else if(!description) {
    return res.status(400).send({success: false, result: {message: 'Description required'}});
  }

  const doc = await interactionCollection.insert({user_id: req.params.user_id, partner_id: req.params.partner_id, good, date, description});

  res.status(201).send({success: true, result: doc});
});

interactionRouter.get('/:user_id/:partner_id', async (req: Request, res: Response) => {
  const {start, end} = req.query;

  const doc = await interactionCollection.find({user_id: req.params.user_id, partner_id: req.params.partner_id}).exec();

  console.log(doc);

  res.status(201).send({success: true, result: doc});
});
