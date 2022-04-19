import {IChat, IchatRes, User, UserTmp} from '../../../models/chat';
import {connect} from '../../index';
import * as userChatSchemaOp from './userChatSchema';
export const NAME_SCHEMA = 'listChat/RoomChatSchema';
export type roomChatType = {
  room_id: string;
  id_message: string; //message_id  current show
  message: string;
  message_status: number;
  user_login_id: string;
  user_friend_id: string;
  user_sender_id: string;
  create_at: string;
  message_stack: number;
};
export const roomChatSchema = {
  name: NAME_SCHEMA,
  properties: {
    room_id: 'string',
    id_message: 'string', //message_id  current show
    message: 'string',
    message_status: 'int',
    user_login_id: 'string',
    user_friend_id: 'string',
    user_sender_id: 'string',
    create_at: 'string',
    message_stack: 'int',
  },
  primaryKey: 'room_id',
};

// get all
const getChat = async (chatRoomSchema: roomChatType) => {
  try {
    let user_login: User | null = await userChatSchemaOp.getUserChatByIDSchema(
      chatRoomSchema.user_login_id,
    );
    let user_friend: User | null = await userChatSchemaOp.getUserChatByIDSchema(
      chatRoomSchema.user_friend_id,
    );
    let user_sender: User | null = await userChatSchemaOp.getUserChatByIDSchema(
      chatRoomSchema.user_sender_id,
    );
    let result: IChat = {
      create_at: chatRoomSchema.create_at,
      id_message: chatRoomSchema.id_message,
      message: chatRoomSchema.message,
      message_stack: chatRoomSchema.message_stack,
      message_status: chatRoomSchema.message_status,
      room_id: chatRoomSchema.room_id,
      user_friend: user_friend ? user_friend : UserTmp,
      user_sender: user_sender ? user_sender : UserTmp,
      user_login: user_login ? user_login : UserTmp,
    };
    return result;
  } catch (error) {}
  return null;
};
export const getAllSchema = () =>
  new Promise((resolve: (value: Array<IChat>) => void, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const allLists = realm.objects<roomChatType>(roomChatSchema.name);
          let respon: Array<IChat> = [];
          console.log('call get list here');

          allLists.map((chatRoomItem: roomChatType) => {
            getChat(chatRoomItem).then(res => {
              if (res) {
                console.log('res', res);

                respon.push(res);
              }
            });
          });
          console.log('allLists,allLists', allLists.length);
          console.log('respon', respon.length);

          resolve(respon);
          // resolve([]);
        });
      })
      .catch(error => reject(error));
  });

// insert data
export const insertSchema = (chatRoom: IChat) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const {
            create_at,
            id_message,
            message,
            message_stack,
            message_status,
            room_id,
            user_friend,
            user_login,
            user_sender,
          } = chatRoom;
          let updatingRoomChat:
            | roomChatType
            | undefined = realm.objectForPrimaryKey(
            roomChatSchema.name,
            chatRoom.room_id,
          );
          if (user_friend) userChatSchemaOp.insertSchema(user_friend);
          if (user_login) userChatSchemaOp.insertSchema(user_login);
          if (user_sender) userChatSchemaOp.insertSchema(user_sender);
          if (updatingRoomChat) {
            // update roomChat
            updatingRoomChat.create_at = create_at ? create_at : '';
            updatingRoomChat.id_message = id_message ? id_message : '';
            updatingRoomChat.message = message ? message : '';
            updatingRoomChat.message_stack = message_stack ? message_stack : 0;
            updatingRoomChat.message_status = message_status
              ? message_status
              : 0;
            updatingRoomChat.user_friend_id = user_sender ? user_friend.id : '';
            updatingRoomChat.user_login_id = user_login ? user_login.id : '';
            updatingRoomChat.user_sender_id = user_sender ? user_sender.id : '';
          } else {
            // create roomchat
            let data: roomChatType = {
              create_at: create_at ? create_at : '',
              id_message: id_message ? id_message : '',
              message_status: message_status ? message_status : 0,
              room_id: room_id ? room_id : '',
              message: message ? message : '',
              message_stack: message_stack ? message_stack : 0,
              user_friend_id: user_friend ? user_friend.id : '',
              user_login_id: user_login ? user_login.id : '',
              user_sender_id: user_sender ? user_sender.id : '',
            };
            if (data.room_id) {
              realm.create(roomChatSchema.name, data);
            }
          }
          resolve('');
        });
      })
      .catch(error => reject(error));
  });

// insert data All
export const insertSchemaAll = (data: IchatRes) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          if (data && data.chat_rooms && data.chat_rooms.length) {
            data.chat_rooms.map(chatRoom => {
              insertSchema(chatRoom);
            });
          }
        });
        resolve(' ');
      })
      .catch(error => reject(error));
  });

//update data
export const updateSchema = (data: any) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          const roomChat = realm
            .objects(roomChatSchema.name)
            .filtered(`room_id ==[c] "${data.id}"`);
          if (roomChat.length > 0) {
            let updatingRoomChat: any = realm.objectForPrimaryKey(
              roomChatSchema.name,
              data.id,
            );
            updatingRoomChat['message'] = data.message;
            updatingRoomChat['message_status'] = data.message_status;
            updatingRoomChat['user_login_id'] = data.user_login_id;
            updatingRoomChat['user_friend_id'] = data.user_friend_id;
            updatingRoomChat['user_sender_id'] = data.user_sender_id;
            updatingRoomChat['message_stack'] = data.message_stack;

            resolve(data);
          }
          resolve(null);
        });
      })
      .catch(error => reject(error));
  });

//get by id user
export const getRoomChatByIDSchema = (id: string) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let findRoomChat = realm
            .objects(roomChatSchema.name)
            .filtered(`room_id ==[c] "${id}"`);
          resolve(findRoomChat);
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
          const findRoomChat = realm
            .objects(roomChatSchema.name)
            .filtered(`room_id ==[c] "${id}"`);
          if (findRoomChat.length > 0) {
            let roomchat = realm.objectForPrimaryKey(roomChatSchema.name, id);
            realm.delete(roomchat);
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
//           let user = realm.objects(roomChatSchema.name).filtered(`username LIKE "${text}*"`); //limit search
//           resolve(user);
//         });
//       })
//       .catch(error => reject(error));
//   });

export const getPagingSchema = (limit: number, page: number) =>
  new Promise((resolve, reject) => {
    connect()
      .then(realm => {
        realm.write(() => {
          let allLists = realm.objects(roomChatSchema.name);
          if (page === 1) resolve(allLists.slice(0, limit));
          // paging limit record
          else resolve(allLists.slice(limit * page - limit, limit * page));
        });
      })
      .catch(error => reject(error));
  });
