// import realm
import Realm from 'realm';
// common Schema
import {commonSchemaArr} from './common';

// another Schema with modules
import {modulesArr} from './modules';

const databaseOptions = {
  path: 'GEMBASTAR_REALM',
  schema: [...commonSchemaArr, ...modulesArr], //add new schema here [a,AbcSchema]
  schemaVersion: 13,
};
export const connectDB = () => Realm.open(databaseOptions);
export const closeDB = () => Realm.exists(databaseOptions);
export default new Realm(databaseOptions);
