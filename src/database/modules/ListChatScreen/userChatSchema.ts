import {IChat, User} from '../../../models/chat';
import {connect} from '../../index';
import {AvatarSchemaOp} from '../../common';
import {Avatar, AvatarTmp} from '../../../models/image';
export const NAME_SCHEMA = 'listChat/UserChatSchema';
export type userChatType = {
  id: string;
  email: string;
  fullname: string;
  username: string;
  address: string;
  create_at: string;
};
export const userChatSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: 'string',
    email: 'string',
    fullname: 'string',
    username: 'string',
    address: 'string',
    create_at: 'string',
  },
  primaryKey: 'id',
};

// get all
export const getAllSchema = () =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(userChatSchema.name);
          resolve(allLists);
        });
      })
      .catch(error => reject(error));
  });

// insert data
export const insertSchema = (data: User) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          // const userChat = realm
          //   .objects(userChatSchema.name)
          //   .filtered(`id ==[c] "${data.id}"`);
          let avatarData: AvatarSchemaOp.avatarType = {
            id: data.avatar.id ?? '',
            create_at: data.avatar.create_at ?? '',
            file_name: data.avatar.file_name ?? '',
            path_file: data.avatar.path_file ?? '',
            path_file_thumb: data.avatar.path_file_thumb ?? '',
            userId: data.id ?? '',
          };
          AvatarSchemaOp.insertSchema(avatarData);
          let userCheck: userChatType | undefined = realm.objectForPrimaryKey(
            userChatSchema.name,
            data.id,
          );
          if (userCheck) {
            userCheck['email'] = data.email ?? userCheck.email;
            userCheck['fullname'] = data.fullname ?? userCheck.fullname;
            userCheck['username'] = data.username ?? userCheck.username;
            userCheck['address'] = data.address ?? userCheck.address;
            userCheck['create_at'] = data.create_at ?? userCheck.create_at;
          } else {
            let dataInserting: userChatType = {
              email: data.email ?? '',
              fullname: data.fullname ?? '',
              address: data.address ?? '',
              create_at: data.create_at ?? '',
              id: data.id ?? '',
              username: data.username ?? '',
            };
            if (dataInserting.id) {
              realm.create(userChatSchema.name, dataInserting);
            }
          }
          resolve('');
        });
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
          const userChat = realm
            .objects(userChatSchema.name)
            .filtered(`id ==[c] "${data.id}"`);
          if (userChat.length > 0) {
            let updatingUserChat: any = realm.objectForPrimaryKey(
              userChatSchema.name,
              data.id,
            );
            updatingUserChat['email'] = data.email;
            updatingUserChat['fullname'] = data.fullname;
            updatingUserChat['username'] = data.username;
            updatingUserChat['address'] = data.address;

            resolve(data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//get by id user
export const getUserChatByIDSchema = (id: string) =>
  new Promise((resolve: (value: User | null) => void, reject) => {
    connect()
      .then(realm => {
        realm.write(async () => {
          // let findUserChat:User = realm
          //   .objects(userChatSchema.name)
          //   .filtered(`id ==[c] "${id}"`);
          let findUserChat:
            | userChatType
            | undefined = realm.objectForPrimaryKey(userChatSchema.name, id);
          if (findUserChat) {
            let avatar: Avatar | null = await AvatarSchemaOp.getAvatarByUserIDSchema(
              id,
            );
            let dataResults: User = {
              id: findUserChat.id,
              address: findUserChat.address,
              create_at: findUserChat.create_at,
              email: findUserChat.email,
              fullname: findUserChat.fullname,
              username: findUserChat.username,
              avatar: avatar ?? AvatarTmp,
            };
            resolve(dataResults);
          } else {
            resolve(null);
          }
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
          const findUserChat = realm
            .objects(userChatSchema.name)
            .filtered(`id ==[c] "${id}"`);
          if (findUserChat.length > 0) {
            let userchat = realm.objectForPrimaryKey(userChatSchema.name, id);
            realm.delete(userchat);
            resolve(id);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//search user by name
// export const searchSchema = (text: string) =>
//   new Promise((resolve, reject) => {
//     connect()
//       .then(realm => {
//         realm.write(() => {
//           let user = realm.objects(userChatSchema.name).filtered(`username LIKE "${text}*"`); //limit search
//           resolve(user);
//         });
//       })
//       .catch(error => reject(error));
//   });
