import 'react-native-gesture-handler';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../stories';
import {createAction} from '../../stories/actions';
import {chat, dataCache} from '../../stories/types';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import LoadingCircle from '../../components/common/LoadingCircle';
import ModalPhoto from '../../components/organisms/ModalPhoto';
import DropdownAlert from '../../components/common/DropdownAlert';
import {DOMAIN_SOCKET} from '../../config/Constants';
import {getChatDetail, TYPE_DISPATCH} from '../../stories/actions/chat';
import NetInfo from '@react-native-community/netinfo';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiGetMessageStack} from '../../services/chat';
import {debounce} from 'lodash';
import Navigation from '../../navigations';
import {syncDataInfoGroup} from '../../stories/actions/infoAllGroup';

type OpRespone = {
  isEnabled: boolean;
  room_id?: string;
  is_group?: boolean;
};
type TypeSocketNoticesRespone = {
  AddNewChatGroup: OpRespone;
  NoticeMessage: {
    isEnabled: boolean;
    detail_message?: {
      is_group: boolean;
      new_message: string;
      room_id: string;
      unread_chatroom: string;
    };
  };
  AdminRemoveUsersChatGroup: {
    isEnabled: boolean;
    room_id?: string;
    is_group?: boolean;
  };
  UpdateChatGroup: {
    isEnabled: boolean;
    room_id?: string;
    is_group?: boolean;
  };
  RemoveGroup: OpRespone;
};
const myNavigation: React.FC = ({}) => {
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();
  const [reconnect, setReconnect] = useState<boolean>(false);
  const showMedia = useAppSelector(state => state.dataImage.captureImage.show);
  const userAuth = useAppSelector(state => state.dataUser.UserInfo);
  let ws = useMemo(() => {
    if (userAuth.user_id) {
      const id = userAuth.user_id.replace(/USER#/g, '');
      console.log('userAuth.id', id);
      return new WebSocket(`${DOMAIN_SOCKET}/user/${id}`);
    }
    return null;
  }, [userAuth.user_id, reconnect]);
  const unsubscribe = useCallback(
    () =>
      NetInfo.addEventListener(state => {
        dispatch(
          createAction(dataCache.FETCH_NETWORK_STATUS, {
            connect: state.isConnected,
          }),
        );
        if (!state.isConnected) {
          console.log('Nooooooooooooooooooooooooooooooooo Internet');
        } else {
          console.log('connect Internet');
        }
      }),
    [],
  );

  const handler = useCallback(
    debounce(
      (
        roomId: string,
        isGroup: boolean,
        type: TYPE_DISPATCH,
        endMessage?: string,
      ) => {
        console.log(
          '---------------------------call API get info room chat update list chat--------------------------',
        );

        handlerNoticeMessage(roomId, isGroup, type, endMessage);
      },
      500,
    ),
    [userAuth.user_id, reconnect],
  );

  const handlerSyncDataInfoGroup = useCallback(
    debounce((roomId: string, type: TYPE_DISPATCH) => {
      dispatchThunk(syncDataInfoGroup(roomId, type));
    }, 500),
    [],
  );

  // const handlerNoticeMessage = async (roomId: string,
  //   isGroup: boolean,
  //   type: TYPE_DISPATCH,
  //   endMessage?: string) => {
  //   const getMoutedChatDetail = await getMouted();
  //   if (getMoutedChatDetail !== "mouted") {
  //     console.log("roomId", roomId, "userAuth.id", userAuth.id, "getMoutedChatDetail", getMoutedChatDetail)
  //     apiGetMessageStack(roomId, userAuth.id)
  //       .then(res => {
  //         const messageStack: number = JSON.parse(JSON.stringify(res.data));
  //         if (messageStack) {
  //           dispatchThunk(
  //             getChatDetail(roomId, isGroup, type, messageStack, endMessage),
  //           );
  //         }
  //       })
  //       .catch(error => console.log('apiGetMessageStack error', error));

  //   }
  // }

  const handlerNoticeMessage = useCallback(
    async (
      roomId: string,
      isGroup: boolean,
      type: TYPE_DISPATCH,
      endMessage?: string,
    ) => {
      const getMoutedChatDetail = await getMouted();
      if (getMoutedChatDetail !== 'mouted') {
        console.log(
          'roomId',
          roomId,
          'userAuth.id',
          userAuth.user_id,
          'getMoutedChatDetail',
          getMoutedChatDetail,
        );
        const room_id = roomId.replace(/#/g, '%23');
        const userID = userAuth.user_id.replace(/#/g, '%23');
        apiGetMessageStack(room_id, userID)
          .then(res => {
            const messageStack: number = JSON.parse(JSON.stringify(res.data));
            if (messageStack) {
              dispatchThunk(
                getChatDetail(roomId, isGroup, type, messageStack, endMessage),
              );
            }
          })
          .catch(error => console.log('apiGetMessageStack error', error));
      }
    },
    [userAuth.user_id, reconnect],
  );

  const getMouted = async () => {
    let mouted = '';
    try {
      const value = await AsyncStorage.getItem('@moutedChatDetail');
      if (value !== null) {
        // value previously stored
        mouted = value;
      }
    } catch (e) {
      // error reading value
    }
    return mouted;
  };

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        console.log('ws.onopen userAuth');
      };
      ws.onclose = () => {
        console.log('ws.onclose userAuth');
        setTimeout(() => {
          setReconnect(!reconnect);
        }, 2000);
      };
    }
    if (ws) {
      ws.onmessage = e => {
        let resData: TypeSocketNoticesRespone = JSON.parse(e.data);
        console.log('resData', resData);
        if (resData.AddNewChatGroup.isEnabled) {
          if (
            resData.AddNewChatGroup.room_id &&
            resData.AddNewChatGroup.is_group !== undefined
          ) {
            console.log('case Add new group');
            handlerSyncDataInfoGroup(
              resData.AddNewChatGroup.room_id,
              'ADD_NEW_GROUP',
            );
          }
        }
        if (resData.NoticeMessage.isEnabled) {
          if (
            resData.NoticeMessage.detail_message &&
            resData.NoticeMessage.detail_message.is_group !== undefined &&
            resData.NoticeMessage.detail_message.room_id
          ) {
            console.log('UPDATE_NEW_MESSAGES');

            // if(resData.AdminRemoveUsersChatGroup.isEnabled && resData.NoticeMessage.detail_message.new_message.includes(userAuth.id)){
            //   console.log("AdminRemoveUsersChatGroup")
            //   dispatch(
            //     createAction(chat.DELETE_CHAT_GROUP, {
            //       room_id: resData.RemoveGroup.room_id,
            //     }),
            //   );
            // }
            // else{
            //   handler(
            //     resData.NoticeMessage.detail_message.room_id,
            //     resData.NoticeMessage.detail_message.is_group,
            //     'UPDATE_NEW_MESSAGES',
            //     resData.NoticeMessage.detail_message.new_message
            //   )
            // }
            handler(
              resData.NoticeMessage.detail_message.room_id,
              resData.NoticeMessage.detail_message.is_group,
              'UPDATE_NEW_MESSAGES',
              resData.NoticeMessage.detail_message.new_message,
            );
          }
        }
        if (resData.UpdateChatGroup.isEnabled) {
          if (
            resData.UpdateChatGroup.room_id &&
            resData.UpdateChatGroup.is_group !== undefined
          ) {
            console.log('case  Update info group chat work');
            handlerSyncDataInfoGroup(
              resData.UpdateChatGroup.room_id,
              'UPDATE_INFO_GROUP_CHAT',
            );
            // dispatchThunk(
            //   getChatDetail(
            //     resData.UpdateChatGroup.room_id,
            //     resData.UpdateChatGroup.is_group,
            //     'UPDATE_INFO_GROUP_CHAT',
            //   ),
            // );
          }
        }
        if (resData.RemoveGroup.isEnabled) {
          console.log('case RemoveGroup');
          dispatch(
            createAction(chat.DELETE_CHAT_GROUP, {
              room_id: resData.RemoveGroup.room_id,
            }),
          );
        }
      };
    }
  }, [ws]);

  useEffect(() => {
    dispatch(createAction(dataCache.GET_DIMENSIONS_DEVICE, null));
    unsubscribe();
    return () => {
      ws?.close();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Navigation />
        <LoadingCircle />
        {showMedia ? (
          <View style={styles.modal}>{/* <PhotoMedia  /> */}</View>
        ) : null}

        <ModalPhoto />
        <DropdownAlert />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  modal: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
  },
});

export default myNavigation;
