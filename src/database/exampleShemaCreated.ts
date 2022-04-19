import {connectDB} from './index'; // my method connectDB to realm
// basic define Schema name : AbcSchema
// link : https://docs.mongodb.com/realm/sdk/react-native/examples/define-a-realm-object-model
export const NAME_SCHEMA = 'AbcSchema';
export const NameSchema = {
  name: NAME_SCHEMA,
  properties: {
    //property in schema
    id: 'int',
    data1: 'string',
    date: 'date',
    todos: {type: 'list', objectType: 'NameSchema'},
  },
  primaryKey: 'id', // primary key of schema
};

/**
 *  after define a realm object Schema!
 *  return database/index.ts
 *  and add your new schema name in arr : schema of object databaseOptions!
 */

// get all example method
export const getAllSchema = () =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          // let allLists = realm.objects(ChatRoomSchema.name);
          // // resolve(allLists.slice(0, 2));
          // resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });

// insert data example method
export const insertSchema = data =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          // like
          // realm.create(ChatRoomSchema.name, data);
          // resolve();
        });
      })
      .catch(error => reject(error));
  });

// update data example method
export const updateSchema = data =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          //   let updatingEmployee = realm.objectForPrimaryKey(
          //     EmployeeSchema.name,
          //     data.id,
          //   );
          //   updatingEmployee.name = data.name;
          //   updatingEmployee.dep = data.dep;
          //   resolve();
        });
      })
      .catch(error => reject(error));
  });

//  delete example method
export const deleteSchema = id =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          //   let chatroom = realm.objectForPrimaryKey(
          //     ChatRoomSchema.name,
          //     chatroomId,
          //   );
          //   realm.delete(chatroom);
          //   resolve();
        });
      })
      .catch(error => reject(error));
  });

//   pagination example method
export const getPagingSchema = (limit, page) =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          //   let allLists = realm.objects(ChatRoomSchema.name);
          //   if (page === 1)
          //       resolve(allLists.slice(0, limit)); // paging limit record
          //   else
          //       resolve(allLists.slice(0, limit * page));
          // resolve(allLists.slice(0, 2));
          //resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });

//search example method
export const searchSchema = text =>
  new Promise((resolve, reject) => {
    connectDB()
      .then(realm => {
        realm.write(() => {
          //   let allLists = realm.objects(ChatRoomSchema.name).filtered(`message ==[c] "${text}" LIMIT(2)`); //limit search
          //   resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });
