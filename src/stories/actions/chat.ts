import { createAction } from '.';
import { AppDispatch } from '../';
import { IChat, IChatRes, IchatRes, IGroupInfo } from '../../models/chat';
import {
  apiGetListChats,
  apiGetChatDetail,
  apiGetInfoGroups,
  getInfoGroup,
} from '../../services/chat';
import { ListChatModule } from '../../database/modules';
import realm from '../../database';
import { chat, infoAllGroup } from '../types';
import { set } from 'react-native-reanimated';

export const getListChats = (
  SuccessCallBack: Function,
  ErrorCallback: Function,
  FinallyCallback: Function,
) => {
  return async (dispatch: AppDispatch) => {
    await apiGetInfoGroups()
      .then(res => {
        const infoGroups: Array<IGroupInfo> = JSON.parse(
          JSON.stringify(res.data),
        );
        if (infoGroups && infoGroups.length > 0) {
          dispatch(createAction(infoAllGroup.FETCH_ALL_INFO_GROUP, infoGroups));
        }
        apiGetListChats()
          .then(res => {
            const resDataConvert: Array<IChatRes> = JSON.parse(
              JSON.stringify(res.data),
            );
            const resData: IChat[] = resDataConvert.map(item => {
              let result: IChat = {
                ...item,
                admin_id: '',
                participants: [],
                avatar_group: '',
                group_name: '',
              };
              if (item.is_group) {
                let info: IGroupInfo | undefined = infoGroups.find(
                  gp => gp.room_id == item.room_id,
                );
                if (info) {
                  result.admin_id = info.admin_id;
                  result.participants = info.participants_id;
                  result.avatar_group = info.avatar_group;
                  result.group_name = info.group_name;
                }
              }

              return result;
            });
            // ListChatModule.roomChatSchemaOp.insertSchemaAll(resDataConvert);
            dispatch(createAction(chat.FETCH_LIST_CHATBOXS, resData));
            SuccessCallBack();
          })
          .catch(err => {
            console.log('getListChats error', err);
            ErrorCallback();
          });
      })
      .catch(err => {
        console.log('apiGetInfoGroups error', err);
        ErrorCallback();
      });

    FinallyCallback();
  };
};
export type TYPE_DISPATCH =
  | 'ADD_NEW_GROUP'
  | 'UPDATE_NEW_MESSAGES'
  | 'UPDATE_INFO_GROUP_CHAT'
  | 'UPDATE_IS_JOIN';
export const getChatDetail = (
  roomId: string,
  isGroup: boolean,
  type: TYPE_DISPATCH,
  unRead_chatroom?: number,
  endMessage?: string,
) => async (dispatch: AppDispatch) => {
  const fetchData = (resData: IChat) => {
    if (type === 'ADD_NEW_GROUP') {
      dispatch(createAction(chat.ADD_NEW_CHAT_BOX, resData));
    } else if (type === 'UPDATE_NEW_MESSAGES') {
      dispatch(
        createAction(chat.UPDATE_NEW_MESSAGES_BOX, {
          data: resData,
          unRead_chatroom,
          isGroup,
          endMessage,
        }),
      );
    } else if (type === 'UPDATE_INFO_GROUP_CHAT') {
      dispatch(
        createAction(chat.UPDATE_CHAT_GROUP, {
          dataUpdating: {
            room_id: resData.room_id,
            avatar: resData.avatar_group,
            group_name: resData.group_name,
          },
        }),
      );
    } else if (type === 'UPDATE_IS_JOIN') {
      dispatch(
        createAction(chat.UPDATE_IS_JOIN, {
          data: resData,
        }),
      );
    }
  }
  if (isGroup) {
    await getInfoGroup(roomId).then((res) => {
      const infoGroup: IGroupInfo = JSON.parse(JSON.stringify(res.data));

      apiGetChatDetail(roomId, isGroup)
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
            };
            fetchData(groupData);
          }


        })
        .catch(error => console.log('apiGetChatDetail error', error));

    }).catch((err) => {
      console.log('getInfoGroup error', err);
    })
  } else {
    apiGetChatDetail(roomId, isGroup)
      .then(res => {
        const resData: IChat = JSON.parse(JSON.stringify(res.data));
        fetchData(resData);
      })
      .catch(error => console.log('apiGetChatDetail error', error));
  }


};
