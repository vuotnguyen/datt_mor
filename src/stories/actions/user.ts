import { AppDispatch } from '../';
import { DOMAIN_SOCKET } from '../../config/Constants';
import { getUserInfo, getUserInfoPaging } from '../../services/user';
import { createAction } from '../actions';
import { chat, user } from '../types';
import { connectDB } from '../../database';
import { ProfileSchemaOp } from '../../database/modules/ProfileScreen';
import { ProfileSchemaType } from '../../database/modules/ProfileScreen/profileSchema';
import { LastEvaluatedKeyImage } from '../../models/chat';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../models/user';
const storeData = async (userid: string, role: string) => {
  try {
    await AsyncStorage.setItem('@userRole', role);
    await AsyncStorage.setItem('@userid', userid);

  } catch (e) {
    // saving error
  }
};
export const GetUserInfo = (
  SuccessCallBack: Function,
  ErrorCallback: Function,
  FinallyCallback: Function,
) => {
  return async (dispatch: AppDispatch) => {
    let idUser = '';
    
    const getUserID = async () => {
      try {
        const value = await AsyncStorage.getItem('@userid');
        if (value !== null) {
          // value previously stored
          idUser = value;
        }
      } catch (e) {
        // error reading value
      }
    };
    await getUserID();
    await getUserInfoPaging('')
          .then(res => {
            const userInfo = JSON.parse(JSON.stringify(res.data));
            storeData(userInfo.user_id, userInfo.user_role);
            // const LastEvaluatedKey: LastEvaluatedKeyImage =
            //   userInfo.album_files.LastEvaluatedKey;

            // const lastKey =
            //   LastEvaluatedKey.id &&
            //     LastEvaluatedKey.gsi &&
            //     LastEvaluatedKey.create_at
            //     ? `${LastEvaluatedKey.id}%26${LastEvaluatedKey.gsi}%26${(LastEvaluatedKey.create_at).replace(/:/g, "%3A")}`
            //     : '';


            const data: User = {
              PK: userInfo.PK,
              SK: userInfo.SK,
              company_id: userInfo.company_id,
              user_id: userInfo.user_id,
              email: userInfo.email,
              fullname: userInfo.full_name,
              username: userInfo.username,
              address: userInfo.address,
              create_at: userInfo.create_at,
              special_message: userInfo.special_message,
              is_join: userInfo.is_join,
              user_role: userInfo.user_role,
              album_files: userInfo.album_files,
              avatar: userInfo.avatar
              //lastKey: lastKey
            }
            dispatch(createAction(user.USER_INFO, data));
            SuccessCallBack();
          })
          .catch(err => {
            console.log('getUserInfo error', err);
            ErrorCallback();
          })
          .finally(() => {
            FinallyCallback();
          });
  };
};

export const fetchProfileLocalStorages = (data: Object) => (dispatch: AppDispatch) => {
  dispatch(createAction(user.USER_INFO, data));
}