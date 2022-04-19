import { createAction } from '.';
import { AppDispatch } from '../';
import {
  apiGetChatDetail,
  apiGetInfoGroups,
  getInfoGroup,
} from '../../services/chat';
import { chat, infoAllGroup } from '../types';
import { IChat, IChatRes, IGroupInfo } from '../../models/chat';
import { getChatDetail, TYPE_DISPATCH } from './chat';
import { get, set } from 'lodash';
type IActionFunc = {
  SuccessCallBack?: Function;
  ErrorCallback?: Function;
  FinallyCallback?: Function;
};
export const getAllGroupInfo = ({
  SuccessCallBack = () => undefined,
  ErrorCallback = () => undefined,
  FinallyCallback = () => undefined,
}: IActionFunc) => {
  return (dispatch: AppDispatch) => {
    apiGetInfoGroups()
      .then(res => {
        const infoGroups: Array<IGroupInfo> = JSON.parse(
          JSON.stringify(res.data),
        );
        if (infoGroups && infoGroups.length > 0) {
          dispatch(createAction(infoAllGroup.FETCH_ALL_INFO_GROUP, infoGroups));
        }
        SuccessCallBack();
      })
      .catch(err => {
        console.log('apiGetInfoGroups error', err);
        ErrorCallback();
      })
      .finally(() => {
        FinallyCallback();
      });
  };
};

export const syncDataInfoGroup = (
  roomId: string,
  type: TYPE_DISPATCH,
  callBack?: (a: IChat) => void,
) => {
  return async (dispatch: AppDispatch) => {
    await getInfoGroup(roomId)
      .then(res => {
        const infoGroup: IGroupInfo = JSON.parse(JSON.stringify(res.data));
        dispatch(
          createAction(infoAllGroup.SYNC_DATA_GROUP, { roomId, infoGroup }),
        );
        apiGetChatDetail(roomId, true)
          .then(res => {
            const resData: IChatRes = JSON.parse(JSON.stringify(res.data));
            if (resData) {
              const groupData: IChat = {
                ...resData,
                room_id: roomId,
                avatar_group: infoGroup.avatar_group,
                group_name: infoGroup.group_name,
                participants: infoGroup.participants_id,
                admin_id: infoGroup.admin_id,
                // // FIXME
                // is_group: 1,
              };
              switch (type) {
                case 'ADD_NEW_GROUP': {
                  dispatch(
                    createAction(chat.ADD_NEW_CHAT_BOX, { groupData, roomId }),
                  );
                  if (callBack) callBack(groupData);
                  break;
                }
                case 'UPDATE_INFO_GROUP_CHAT':
                  dispatch(
                    createAction(chat.UPDATE_CHAT_GROUP, {
                      dataUpdating: {
                        room_id: roomId,
                        avatar: groupData.avatar_group,
                        group_name: groupData.group_name,
                      },
                    }),
                  );
                  break;
                default:
                  break;
              }
            }
          })
          .catch(err => {
            console.log('error apiGetChatDetail', err);
          });
      })
      .catch(err => {
        console.log('error getInfoGroup', err);
      });
  };
};
