import {Avatar} from '../../models/image';
import {connect} from '../index';
export const NAME_SCHEMA = 'common/AvatarSchema';
export type avatarType = {
  id: string;
  path_file_thumb: string;
  create_at: string;
  file_name: string;
  path_file: string;
  userId: string;
};
export const avatarSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: 'string',
    path_file_thumb: 'string?',
    create_at: 'string?',
    file_name: 'string?',
    path_file: 'string?',
    userId: 'string?',
  },
  primaryKey: 'id',
};

// get all
export const getAllSchema = () =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(avatarSchema.name);
          resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });

// insert data
export const insertSchema = (data: avatarType) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          // const avatar = realm
          //   .objects(avatarSchema.name)

          //   .filtered(`id ==[c] "${data.id}"`);

          let updating: avatarType | undefined = realm.objectForPrimaryKey(
            avatarSchema.name,
            data.id,
          );
          if (updating) {
            updating.create_at = data.create_at ?? '';
            updating.file_name = data.file_name ?? '';
            updating.path_file = data.path_file ?? '';
            updating.path_file_thumb = data.path_file_thumb ?? '';
            updating.userId = data.userId ?? '';
          } else {
            realm.create(avatarSchema.name, data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//update avatar
export const updateSchema = (data: any) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const avatar = realm
            .objects(avatarSchema.name)
            .filtered(`id ==[c] "${data.id}"`);
          if (avatar.length > 0) {
            let updatingAvatar: any = realm.objectForPrimaryKey(
              avatarSchema.name,
              data.id,
            );
            updatingAvatar['path_file_thumb'] = data.path_file_thumb;
            updatingAvatar['file_name'] = data.file_name;
            updatingAvatar['path_file'] = data.path_file;
            resolve(data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//get avatar by id
export const getAvatarByIDSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        //let findAvatar = avatar.f
        realm.write(() => {
          let findAvatar = realm
            .objects(avatarSchema.name)
            .filtered(`id ==[c] "${id}"`);
          resolve(findAvatar);
        });
      })
      .catch(error => reject(error));
  });

//get avatar by id
export const getAvatarByUserIDSchema = (id: string) =>
  new Promise((resolve: (value: Avatar | null) => void, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let findAvatar = realm
            .objects<avatarType>(avatarSchema.name)
            .find(item => item.userId == id);
          if (findAvatar) {
            let Ava: avatarType = findAvatar;
            let respon: Avatar = {
              id: Ava.id ?? '',
              create_at: Ava.create_at ?? '',
              file_name: Ava.file_name ?? '',
              path_file: Ava.path_file ?? '',
              path_file_thumb: Ava.path_file_thumb ?? '',
            };
            if (id) {
              resolve(respon);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      })
      .catch(error => reject(error));
  });

//delete avatar
export const deleteSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const findAvatar = realm
            .objects(avatarSchema.name)
            .filtered(`id ==[c] "${id}"`);
          if (findAvatar.length > 0) {
            let avatar = realm.objectForPrimaryKey(avatarSchema.name, id);
            realm.delete(avatar);
            resolve(id);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

// export const getPagingSchema = (limit: number, page: number) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//             let allLists = realm.objects(avatarSchema.name);
//             if (page === 1)
//                 resolve(allLists.slice(0, limit)); // paging limit record
//             else
//                 resolve(allLists.slice(0, limit * page));
//           resolve(allLists.slice(0, 2));
//         });
//       })
//       .catch(error => reject(error));
//   });

// export const searchSchema = (text: string) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           //   let allLists = realm.objects(ChatRoomSchema.name).filtered(`message ==[c] "${text}" LIMIT(2)`); //limit search
//           //   resolve(allLists);
//         });
//       })
//       .catch(error => reject(error));
//   });
