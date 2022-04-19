import {IGroupInfo} from '../../models/chat';
import {IAction} from '../actions';
import {get, set} from 'lodash';
import {common, infoAllGroup} from '../types';
import {useS3} from '../../hooks/aws';
type InfoUserState = {[RoomId: string]: IGroupInfo};
interface IState {
  AllGroupInfo: InfoUserState;
}

const initialState: IState = {
  AllGroupInfo: {},
};
const reducer = (state = initialState, action: IAction) => {
  switch (action.type) {
    case infoAllGroup.FETCH_ALL_INFO_GROUP: {
      // clone list payload type of InfoUser[]
      let infoGroups: Array<IGroupInfo> = get(action, 'payload', []);
      let infoGroupsObject: InfoUserState = {};
      infoGroups.forEach(item => {
        if (item.room_id) {
          set(infoGroupsObject, [item.room_id], item);
        }
      });
      state.AllGroupInfo = infoGroupsObject;
      return {...state};
    }
    case infoAllGroup.SYNC_DATA_GROUP: {
      // payload {roomId:string, infoGroup:IGroupInfo }
      let roomId: string = get(action, 'payload.roomId', null);
      let infoGroup: Array<IGroupInfo> = get(action, 'payload.infoGroup', null);
      if (!roomId || !infoGroup) return state;

      let infoGroupsObject: InfoUserState = {...state.AllGroupInfo};
      set(infoGroupsObject, [roomId], infoGroup);
      state.AllGroupInfo = infoGroupsObject;

      return {...state};
    }
    case common.CLEAR_DATA: {
      state.AllGroupInfo = {};
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
