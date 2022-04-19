import {connect} from '../index';
export const NAME_SCHEMA = 'common/UserSchema';
export const userSchema = {
  name: NAME_SCHEMA,

  properties: {
    id: 'string',
    username: 'string',
    fullname: 'string',
    address: {type: 'string', optional: true},
    email: {type: 'string', optional: true},
    avatarId: {type: 'string', optional: true},
  },
  // primaryKey: 'id',
};

// get all
export const getAllSchema = () =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(userSchema.name);
          resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });

// insert data
export const insertSchema = (data: any) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        const user = realm
          .objects(userSchema.name)
          .filtered(`id ==[c] "${data.id}"`);
        if (user.length === 0) {
          realm.write(() => {
            realm.create(userSchema.name, data);
          });
          resolve(data);
        }
        resolve(data);
      })
      .catch(error => {
        console.log('error', error);
      });
  });

//update data
export const updateSchema = (data: any) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const user = realm
            .objects(userSchema.name)
            .filtered(`id ==[c] "${data.id}"`);
          if (user.length > 0) {
            let updatingUser: any = realm.objectForPrimaryKey(
              userSchema.name,
              data.id,
            );
            updatingUser['username'] = data.username;
            updatingUser['fullname'] = data.fullname;
            updatingUser['avatarId'] = data.avatarId;
            updatingUser['address'] = data.address;
            updatingUser['email'] = data.email;
            resolve(data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//get by id user
export const getUserByIDSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let findUser = realm
            .objects(userSchema.name)
            .filtered(`id ==[c] "${id}"`);
          resolve(findUser);
        });
      })
      .catch(error => reject(error));
  });

//delete user
export const deleteSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const findUser = realm
            .objects(userSchema.name)
            .filtered(`id ==[c] "${id}"`);
          if (findUser.length > 0) {
            let user = realm.objectForPrimaryKey(userSchema.name, id);
            realm.delete(user);
            resolve(id);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//search user by name
export const searchSchema = (text: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let user = realm
            .objects(userSchema.name)
            .filtered(`username LIKE "${text}*"`); //limit search
          resolve(user);
        });
      })
      .catch(error => reject(error));
  });

export const getPagingSchema = (limit: number, page: number) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(userSchema.name);
          if (page === 1) resolve(allLists.slice(0, limit));
          // paging limit record
          else resolve(allLists.slice(limit * page - limit, limit * page));
        });
      })
      .catch(error => reject(error));
  });
