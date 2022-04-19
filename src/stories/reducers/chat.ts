import { chat, common } from '../types';
import { get } from 'lodash';
import { IAction } from '../actions';
import { IChat } from '../../models/chat';
import { Avatar } from '../../models/image';
import { connectDB } from '../../database';
interface IState {
  unread_chatroom: number;
  chat_rooms: Array<IChat>;
}
const initialState: IState = {
  unread_chatroom: 0,
  chat_rooms: [],
};

const reducer = (state = initialState, { type, payload }: IAction) => {
  switch (type) {
    case chat.FETCH_LIST_CHATBOXS: {
      // state.unread_chatroom = payload;
      let chats: Array<IChat> = payload;
      if (chats.length > 0) {
        let unread = 0;
        chats.forEach(item => {
          unread += get(item, ['unread_message_stack'], 0);
        });
        state.unread_chatroom = unread;
        state.chat_rooms = chats;
      } else {
        state.chat_rooms = [];
      }
      return { ...state };
    }
    case chat.UPDATE_UNREAD_CHATS: {
      state.unread_chatroom = payload;
      return { ...state };
    }
    case chat.UPDATE_CHAT_GROUP: {
      /**
       *  payload:
       *  dataUpdating: {
       *   room_id:string,
       *   avatar:string,
       *   group_name:string
       * }
       *
       *  */

      let roomId: string = payload.dataUpdating.room_id;
      let avatar: string = payload.dataUpdating.avatar;
      let group_name: string = payload.dataUpdating.group_name;
      let chats = [...state.chat_rooms];
      let idx = state.chat_rooms.findIndex(c => c.room_id == roomId);
      if (idx !== -1) {
        chats[idx].avatar_group = avatar;
        chats[idx].group_name = group_name;
      }

      state.chat_rooms = chats;
      return { ...state };
    }

    case chat.DELETE_CHAT_GROUP: {
      //payload room_id :string
      let idx = state.chat_rooms.findIndex(c => c.room_id == payload.room_id);
      if (idx !== -1) {
        console.log('run DELETE_CHAT_GROUP', payload.room_id);
        let chats = [...state.chat_rooms];
        chats.splice(idx, 1);
        state.chat_rooms = chats;
      }
      return { ...state };
    }
    case chat.ADD_NEW_CHAT_BOX: {
      /**
       * payload : IChat
       */
      const data: IChat = payload.groupData;
      const roomId: string = payload.roomId;
      let idx = state.chat_rooms.findIndex(c => c.room_id == roomId);
      if (idx == -1) {
        console.log('run ADD_NEW_CHAT_BOX', payload.groupData);
        let chats = [...state.chat_rooms];
        chats.push(data);
        state.chat_rooms = [...chats];
      }
      let idx2 = state.chat_rooms.find(c => c.room_id == roomId);
      console.log('data ', idx2);

      return { ...state };
    }
    case chat.UPDATE_NEW_MESSAGES_BOX: {
      /**
       * payload :{
       *   data: IChat,
       *   unRead_chatroom:number
       * }
       */
      let data: IChat = payload.data;
      let isGroup = payload.isGroup;
      let endMessage = payload.endMessage;
      let unRead_chatroom = payload.unRead_chatroom;
      if (isGroup !== undefined) {
        state.unread_chatroom = state.unread_chatroom + 1;
      }
      let idx = state.chat_rooms.findIndex(c => c.room_id == data.room_id);

      let chats = [...state.chat_rooms];
      if (idx !== -1) {
        if (isGroup) {
          const dataUpdate: IChat = {
            ...data,
            id_message: chats[idx].id_message,
            message: endMessage,
            message_status: chats[idx].message_status,
            room_id: chats[idx].room_id,
            user_login: chats[idx].user_login,
            user_friend: chats[idx].user_friend,
            user_sender: chats[idx].user_sender,
            create_at: data.create_at,
            unread_message_stack: unRead_chatroom,
            // message_stack: unRead_chatroom,
            admin_id: data.admin_id,
            group_name: data.group_name,
            participants: data.participants,
            avatar_group: data.avatar_group,
            is_group: data.is_group,
          };
          chats[idx] = dataUpdate;
        } else {
          data.unread_message_stack = unRead_chatroom;
          chats[idx] = data;
        }
      }
      state.chat_rooms = chats;
      return { ...state };
    }
    case chat.GET_INFO_ROOM_CHAT: {
      return { ...state };
    }
    case chat.UPDATE_IS_JOIN: {
      let data: IChat = payload.data;
      let idx = state.chat_rooms.findIndex(c => c.room_id == data.room_id);
      let chats = [...state.chat_rooms];
      if (idx !== -1) {
        console.log('run UPDATE_NEW_MESSAGES_BOX', data.room_id);
        chats[idx] = data;
      }
      state.chat_rooms = chats;
      return { ...state };
    }
    case common.CLEAR_DATA: {
      state.unread_chatroom = 0;
      state.chat_rooms = [];
      return { ...state };
    }
    default:
      return state;
  }
};

export default reducer;
