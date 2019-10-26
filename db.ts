import RxDB, {RxDatabase} from 'rxdb';
import pouchDbAdapterLevelDb from 'pouchdb-adapter-leveldb';
import leveldown from 'leveldown';
import {UserCollection} from './routes/user';

RxDB.plugin(pouchDbAdapterLevelDb); // leveldown adapters need the leveldb plugin to work

type MyDatabaseCollections = {
  users: UserCollection
}
export type Database = RxDatabase<MyDatabaseCollections>

export let db: Database;

export async function createDb() {
  db = await RxDB.create<MyDatabaseCollections>({
    name: process.env.NODE_ENV === 'production' ? 'rrdb' : 'rrdb_dev',
    adapter: leveldown,
    multiInstance: false,
    queryChangeDetection: true,
  });
}
