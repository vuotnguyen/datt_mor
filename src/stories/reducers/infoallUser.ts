import {InfoUser, InfoUserTmp} from '../../models/user';
import {IAction} from '../actions';
import {get, set} from 'lodash';
import {common, infoalluser} from '../types';
type InfoUserState = {[key: string]: InfoUser};
interface IState {
  AllUserInfo: InfoUserState;
}

const initialState: IState = {
  AllUserInfo: {},
};
const reducer = (state = initialState, action: IAction) => {
  switch (action.type) {
    case infoalluser.ALL_USER_INFO: {
      // clone list payload type of InfoUser[]
      let userInfo: Array<InfoUser> = get(action, 'payload', []);
      let infoUsersObject: InfoUserState = {};
      userInfo.forEach(item => {
        if (item.user_id) {
          set(infoUsersObject, [item.user_id], item);
        }
      });
      state.AllUserInfo = infoUsersObject;
      return {...state};
    }

    case common.CLEAR_DATA: {
      state.AllUserInfo = {};
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
