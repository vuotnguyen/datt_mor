import { DOMAIN_SOCKET } from '../../config/Constants';
import {
  IChat, IRoomChat
} from '../../models/chat';
import { IAction } from '../actions';
import { individualChat } from '../types';

interface IState {
  // listRoom: Array<IRoomChat>;
  // room_chat_current: {

  // };
  [room_id: string]: IRoomChat;
}

let initialState: IState = {
  // listRoom: [],
};

const reducer = (state = initialState, {type, payload}: IAction) => {
  switch (type) {
    case individualChat.CREATE_ROOM: {
      // payload: {info_room }
      let info_room: IChat = payload.info_room;
      // add new room
      const socketRoomID = info_room.room_id
        .toString()
        .replace('CR#SINGLE#', '');
      const socketUserID = info_room.user_login.toString().replace('USER#', '');

      if (state[info_room.room_id]) {
        if (state[info_room.room_id].isSocketClosed) {
          console.log('case update amd open new socket ', socketRoomID);

          state[info_room.room_id].ws = new WebSocket(
            `${DOMAIN_SOCKET}/chat/${socketRoomID}`,
          );

          state[info_room.room_id].wsStatus = new WebSocket(
            `${DOMAIN_SOCKET}/message/chat/${socketRoomID}/update-message?user_id=${socketUserID}`,
          );

          state[info_room.room_id].info_room = info_room;
          state[info_room.room_id].isSocketClosed = false;
          state[info_room.room_id].timerCheck = null;
        } else {
          console.log('old socket', socketRoomID);
          state[info_room.room_id].info_room = info_room;
          state[info_room.room_id].isSocketClosed = false;
        }
      } else {
        console.log('case create room new socket ', socketRoomID);

        let newRoom: IRoomChat = {
          ws: new WebSocket(`${DOMAIN_SOCKET}/chat/${socketRoomID}`),
          // wsStatus: null,
          wsStatus: new WebSocket(
            `${DOMAIN_SOCKET}/message/chat/${socketRoomID}/update-message?user_id=${socketUserID}`,
          ),
          info_room: info_room,
          count_cache: 0,
          isSocketClosed: false,
          timerCheck: null,
        };

        state[newRoom.info_room.room_id] = newRoom;
      }

      return {...state};
    }
    case individualChat.CLOSE_SOCKET: {
      //payload {room_id:string}

      state[payload.room_id].ws.close();
      // state[payload.room_id].wsStatus.close();
      state[payload.room_id].isSocketClosed = true;

      console.log('close socket', payload.room_id);
      return {...state};
    }
    case individualChat.SET_VAL_IS_CLOSE_SOCKET: {
      //payload {room_id ,value}
      state[payload.room_id].isSocketClosed = payload.value;
      return {...state};
    }
    case individualChat.SET_TIMER_INTERVAL: {
      //payload {room_id ,timerCheck}
      state[payload.room_id].timerCheck = payload.timerCheck;
      console.log('case set interval ', payload.room_id);
      return {...state};
    }
    case individualChat.CLEAR_TIMER_INVERVAL: {
      //payload {room_id}
      if (state[payload.room_id].timerCheck) {
        clearInterval(state[payload.room_id].timerCheck as NodeJS.Timeout);
        console.log('case clear interval ', payload.room_id);
      }
      return {...state};
    }
    default: {
      return state;
    }
  }
};

export default reducer;
