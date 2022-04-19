import {auth, common, message} from '../types';
import {IAction} from '../actions';
import {IMessageReceiver, LastEvaluatedKey} from '../../models/chat';
import {IRoomMessages} from '../../models/Messages';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface IState {
  listRoom: Array<IRoomMessages>;
  // [room_id: string]: {
  //   messages: IMessageReceiver[];
  //   lastKey: LastEvaluatedKey;
  // };
  currentRoom: IRoomMessages | null;
}

const initialState: IState = {
  listRoom: [],
  currentRoom: null,
};
export const persistMessagesConfig = {
  key: 'root_GenBaStar',
  storage: AsyncStorage,
  whitelist: ['listRoom'],
};
const reducer = (state = initialState, {type, payload}: IAction) => {
  switch (type) {
    case message.FETCH_DATA_ROOM_MESSAGE: {
      const {messages, room_id, lastKey} = payload;
      // state.lisRoom = {messages,room_id, lastKey};
      let idx = state.listRoom.findIndex(item => item.room_id === room_id);
      let arr: Array<IRoomMessages> = [];
      state.listRoom.map(item => arr.push(item));

      if (idx !== -1) {
        arr[idx].lastKey = lastKey;
        messages.map((item: IMessageReceiver) => arr[idx].messages.push(item));
        state.currentRoom = arr[idx];
      } else {
        arr.push(payload);
        state.currentRoom = payload;
      }

      state.listRoom = [...arr];

      return {...state};
    }
    case message.ADD_MESSAGE_ROOM: {
      return {...state};
    }
    case message.UPDATE_MESSAGE_ROOM: {
      return {...state};
    }
    case message.GET_MESSAGE_ROOM: {
      let idx = state.listRoom.findIndex(item => item.room_id === payload);
      if (idx !== -1) {
        state.currentRoom = state.listRoom[idx];
      } else {
        state.currentRoom = null;
      }
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
