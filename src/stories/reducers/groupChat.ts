import { IAction } from '../actions';
import { DOMAIN_SOCKET } from '../../config/Constants';
import { IRoomChatGroup } from '../../models/chat';
import { groupchat } from '../types';

interface IState {
  [room_id: string]: IRoomChatGroup;
}

let initialState: IState = {};

const reducer = (state = initialState, { type, payload }: IAction) => {
  switch (type) {
    case groupchat.CREATE_ROOM: {
      // payload:{room_id:string}
      let room_id = payload.room_id;
      if (state[room_id]) {
        /**
         * case exist infoRoom
         */
        if (state[room_id].isSocketClosed) {
          console.log('case exist room chat and open new socket ');
          console.log(`${DOMAIN_SOCKET}/chat-group/${room_id}/update-message`);
          /**
           * case connect new socket
           */
          // room chat socket
          state[room_id].ws = new WebSocket(
            `${DOMAIN_SOCKET}/chat-group/${room_id}`,
          );

          // status socket
          state[room_id].wsStatus = new WebSocket(`${DOMAIN_SOCKET}/chat-group/${room_id}/update-message`);

          //set flag socket is running
          state[room_id].isSocketClosed = false;

          //remove interval time check
          state[room_id].timerCheck = null;
        } else {
          console.log(
            'case exist room chat and continue connect current socket ',
          );
          /**
           * case continue connect current socket
           */
          // room chat socket

          //set flag socket is running
          state[room_id].isSocketClosed = false;
        }
      } else {
        /**
         * case create new room chat
         */
        console.log('case create new room chat 1');
        console.log(`${DOMAIN_SOCKET}/chat-group/${room_id}/update-message`);
        console.log(`${DOMAIN_SOCKET}/chat-group/${room_id}`);
        let newRoom: IRoomChatGroup = {
          ws: new WebSocket(`${DOMAIN_SOCKET}/chat-group/${room_id}`),
          wsStatus: new WebSocket(`${DOMAIN_SOCKET}/chat-group/${room_id}/update-message`),
          isSocketClosed: false,
          timerCheck: null,
        };
        state[room_id] = newRoom;
      }

      return { ...state };
    }
    case groupchat.CLOSE_SOCKET: {
      // payload:{room_id:string}
      let room_id = payload.room_id;
      if (state[room_id]) {
        state[room_id].isSocketClosed = true;
        state[room_id].ws.close();
        state[room_id].wsStatus.close();
        console.log('close socket chatgroup ', room_id);
      }
      return { ...state };
    }
    case groupchat.SET_TIMER_INTERVAL: {
      // payload:{room_id:string,timerCheck:NodeJS.Timeout}
      let room_id = payload.room_id;
      state[room_id].timerCheck = payload.timerCheck;
      console.log('case set interval chatgroup ', room_id);
      return { ...state };
    }
    case groupchat.CLEAR_TIMER_INVERVAL: {
      // payload:{room_id:string}
      let room_id = payload.room_id;
      if (state[room_id].timerCheck) {
        clearInterval(state[room_id].timerCheck as NodeJS.Timeout);
        console.log('case clear interval chatgroup ', room_id);
      }
      return { ...state };
    }
    default: {
      return state;
    }
  }
};
export default reducer;
