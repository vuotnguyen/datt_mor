import {AppDispatch} from '../';
import {InfoUser} from '../../models/user';
import {getAllUsers} from '../../services/user';
import {createAction} from '../actions';
import {infoalluser} from '../types';

export const GetAllUserInfo = (
  SuccessCallBack: Function,
  ErrorCallback: Function,
  FinallyCallback: Function,
) => {
  return (dispatch: AppDispatch) => {
    getAllUsers('')
      .then(res => {
        const userInfo: Array<InfoUser> = JSON.parse(JSON.stringify(res.data));
        if (userInfo && userInfo.length > 0) {
          dispatch(createAction(infoalluser.ALL_USER_INFO, userInfo));
        }
        SuccessCallBack();
      })
      .catch(err => {
        console.log('getAllUsers error', err);
        ErrorCallback();
      })
      .finally(() => {
        FinallyCallback();
      });
  };
};
