import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Schema from './model/schema';
import Message from './model/Message';
import Room from './model/Room';
const adapter = new SQLiteAdapter({
  dbName: 'chat',
  schema: Schema,
});

export const database = new Database({
  adapter,
  modelClasses: [Message, Room],
});
