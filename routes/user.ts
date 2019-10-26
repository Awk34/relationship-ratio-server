import * as e from 'express';
import {Router} from 'express';
import nodeCrypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';
import uuid from 'uuid/v4';
import {db} from '../db';
import {RxCollection, RxDocument} from 'rxdb';
import {userSchema} from './user_schema';

const scrypt = util.promisify(nodeCrypto.scrypt);

const SIGNING_KEY = process.env.KEY || process.env.NODE_ENV !== 'production' ? 'test_key' : '';
const EMAIL_REGEX = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

if(!SIGNING_KEY) {
  console.error('No KEY specified');
  process.exit(2);
}

enum LoveLanguage {
  UNSPECIFIED = 'unspecified',
  TIME = 'Quality time',
  TOUCH = 'Physical touch',
  GIFTS = 'Receiving gifts',
  SERVICE = 'Acts of service',
  AFFIRMATIONS = 'Words of affirmation',
}

export interface User {
  id: string;
  email: string;
  partner: string;
  password: string;
  salt: string;
  love_language: LoveLanguage;
}

export type UserDocument = RxDocument<User>;
export type UserCollection = RxCollection<User>;

export let userCollection: UserCollection;

export async function init() {
  userCollection = await db.collection({
    name: 'users',
    schema: userSchema,
  });

  userCollection.preInsert((user) => {
    user.id = uuid();
  }, true);
}

export const userRouter = Router();

function hashPassword(password: string, salt: string|Buffer): Promise<Buffer> {
  return scrypt(password, salt, 64) as Promise<Buffer>;
}

userRouter.post('/login', async (req: e.Request, res: e.Response) => {
  const {email, password} = req.body;

  if(!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).send({success: false, result: {message: 'Invalid email'}});
  } else if(!password) {
    return res.status(400).send({success: false, result: {message: 'Invalid password'}});
  } else if(password.length < 8) {
    return res.status(400).send({success: false, result: {message: 'Password must be 8+ characters'}});
  }

  const user = await userCollection.findOne({email}).exec();

  if(!user) {
    return res.status(400).send('User not found');
  }

  const hashedPassword = (await hashPassword(password, user.salt)).toString('utf8');

  if(hashedPassword !== user.password) {
    return res.status(400).send({success: false, result: {message: 'Incorrect password'}});
  }

  const token = jwt.sign({id: user.id, email: user.email, love_language: user.love_language, partner: user.partner}, SIGNING_KEY);

  return res.status(200).send({success: true, result: {id: user.id, partner: user.partner, token}});
});

userRouter.post('/signup', async (req: e.Request, res: e.Response) => {
  const {email, password, love_language, partner} = req.body;

  if(!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).send({success: false, result: {message: 'Invalid email'}});
  } else if(!password) {
    return res.status(400).send({success: false, result: {message: 'Invalid password'}});
  } else if(password.length < 8) {
    return res.status(400).send({success: false, result: {message: 'Password must be 8+ characters'}});
  } else if(await userCollection.findOne({email}).exec()) {
    return res.status(400).send({success: false, result: {message: 'Email address already registered'}});
  }

  const salt = nodeCrypto.randomBytes(16).toString('utf8');
  const hashedPassword = await hashPassword(password, salt);

  const userDoc = await userCollection.insert({
    id: '',
    email,
    password: hashedPassword.toString('utf8'),
    salt: salt,
    love_language: love_language || LoveLanguage.UNSPECIFIED,
    partner: partner || '',
  });

  const token = jwt.sign({id: userDoc.id, email, love_language, partner}, SIGNING_KEY);

  res.status(201).send({success: true, result: {id: userDoc.id, partner: userDoc.partner, token}});
});
