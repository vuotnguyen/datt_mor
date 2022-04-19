import {connect} from '../index';
export const NAME_SCHEMA = 'common/FileSchema';
export const fileSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: 'string?',
    path_file_thumb: 'string?',
    create_at: 'string?',
    file_name: 'string?',
    path_file: 'string?',
    userId: 'string?',
  },
  // primaryKey: 'id',
};

// get all
export const getAllSchema = () =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(fileSchema.name);
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
        const file = realm
          .objects(fileSchema.name)
          .filtered(`id ==[c] "${data.id}"`);
        if (file.length === 0) {
          realm.write(() => {
            // like
            realm.create(fileSchema.name, data);
          });
          resolve(data);
        }
        resolve(null);
      })
      .catch(error => reject(error));
  });

//update data
export const updateSchema = (data: any) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const file = realm
            .objects(fileSchema.name)
            .filtered(`id ==[c] "${data.id}"`);
          if (file.length > 0) {
            let updatingFile: any = realm.objectForPrimaryKey(
              fileSchema.name,
              data.id,
            );
            updatingFile['path_file_thumb'] = data.path_file_thumb;
            updatingFile['file_name'] = data.file_name;
            updatingFile['path_file'] = data.path_file;
            resolve(data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//get by id file
export const getFileByIDSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        //let findAvatar = avatar.f
        realm.write(() => {
          let findFile = realm
            .objects(fileSchema.name)
            .filtered(`id ==[c] "${id}"`);
          resolve(findFile);
        });
      })
      .catch(error => reject(error));
  });

//delete file
export const deleteSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const findFile = realm
            .objects(fileSchema.name)
            .filtered(`id ==[c] "${id}"`);
          if (findFile.length > 0) {
            let file = realm.objectForPrimaryKey(fileSchema.name, id);
            realm.delete(file);
            resolve(id);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

export const getPagingSchema = (limit: number, page: number) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(fileSchema.name);
          if (page === 1) resolve(allLists.slice(0, limit));
          // paging limit record
          else resolve(allLists.slice(limit * page - limit, limit * page));
        });
      })
      .catch(error => reject(error));
  });

export const searchByIDUserSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let findFile = realm
            .objects(fileSchema.name)
            .filtered(`userId ==[c] "${id}"`); //limit search
          resolve(findFile);
        });
      })
      .catch(error => reject(error));
  });
