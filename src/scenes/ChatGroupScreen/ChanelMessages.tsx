import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { ScrollView } from '@stream-io/flat-list-mvcp';
import { AxiosResponse } from 'axios';
import { get } from 'lodash';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ButtonIcon } from '../../components/buttons';
import InputAction from '../../components/common/InputAction/inputChatGroup';
import FooterSearch from '../../components/common/SearchMessage/FooterSearch';
import Messages from '../../config/Messages';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import { RoomChatIndOp } from '../../database/modules/IndividualChatGroupScreen';
import { ChannelContext } from '../../hooks/chat';
import {
  File,
  IChat,
  IChatResutlMessageSearch,
  ImessageChatGroup,
  IMessageGroupChatReceiver, IMessageUpdateStatusChatGroup,
  Participant
} from '../../models/chat';
import { IToast, TypeToash } from '../../models/common';
import { IImage } from '../../models/image';
import {
  apiDeleteMessage, apiGetChatGroupByRoomID
} from '../../services/chat';
import { apiUploadImage, CATEGORY_TYPE } from '../../services/image';
import { useAppDispatch } from '../../stories';
import { createAction } from '../../stories/actions';
import { groupchat, modal } from '../../stories/types';
import MessagesCurrentChatGroup from './MessagesCurrentChatGroup';
import MessagesLocalChatGroup from './MessagesLocalChatGroup';
import MessagesUnsendChatGroup from './MessagesUnsendChatGroup';
const { height, width } = Dimensions.get('screen');

const condition_get_message_old_or_new_addToStart = 'load_to_old_date';
const condition_get_message_old_or_new_addToEnd = 'load_to_new_date';
const limitPaging = 20;
const last_message = 'last_message';
const prefixGroup = 'CR%23GROUP%23';
const prefixGroupAPI = 'CR#GROUP#';
const table_Message = 'messages';

type Props = {
  ws: WebSocket;
  wsStatus: WebSocket;
  navigation: any;
  infoRoom: IChat;
  keywork: string;
  keyworkFullwidth: string;
  keyworkHalfwidth: string;
  idMessageSearch: string;
  createMessageSearch: string;
  indexItemSelected: number;
  isGotoDataSearch: boolean;
  dataMessageSearch: Array<IChatResutlMessageSearch>;
  isOpentSearchMessage: boolean;
};
const ChanelMessages: React.FC<Props> = memo(
  ({
    ws,
    wsStatus,
    navigation,
    infoRoom,
    keywork,
    keyworkFullwidth,
    keyworkHalfwidth,
    idMessageSearch,
    isGotoDataSearch,
    createMessageSearch,
    dataMessageSearch,
    indexItemSelected,
    isOpentSearchMessage,
  }) => {
    if (!infoRoom) return null;

    const [messages, setMessages] = React.useState<
      Array<IMessageGroupChatReceiver>
    >([]);

    const [messagesCurrent, setMessagesCurrent] = React.useState<
      Array<IMessageGroupChatReceiver>
    >([]);
    const [messagesUnSend, setMessagesUnSend] = React.useState<
      Array<IMessageGroupChatReceiver>
    >([]);

    const [
      cacheMessages,
      setMessagesCache,
    ] = React.useState<IMessageGroupChatReceiver | null>(null);

    const [connection, setConnection] = React.useState<{
      type: NetInfoStateType;
      isConnected: boolean | null;
    }>({
      type: NetInfoStateType.none,
      isConnected: true,
    });

    const scrollRef = useRef<ScrollView | any>();
    const fadeAnim = new Animated.Value(0);

    const [lastketAddtoStart, setLastketAddtoStart] = React.useState<
      Array<string>
    >([]);

    const [lastketAddtoEnd, setLastketAddtoEnd] = React.useState<Array<string>>(
      [],
    );

    const [loadmore, setLoadmore] = useState<boolean>(false);
    const [loadmoreAddToEnd, setLoadmoreAddToEnd] = useState<boolean>(false);
    const [loadingAddToStart, setLoadingAddToStart] = useState<boolean>(false);
    const [loadingEndToStart, setLoadingEndToStart] = useState<boolean>(false);
    const [isFirstGotoDataSearch, setIsFirstGotoDataSearch] = useState<boolean>(
      false,
    );
    const [idMessgaeFooter, setIdMessgaeFooter] = useState<string>(
      idMessageSearch,
    );
    const [indexMessgaeFooter, setIndexMessgaeFooter] = useState<number>(
      indexItemSelected,
    );
    const [idMessageFirstData, setIdMessageFirstData] = useState<string>('');

    const [messagesSendReaded, setMessagesSendReaded] = useState<
      Array<IMessageUpdateStatusChatGroup>
    >([]);

    const mounted = useRef(false);
    const [
      messagesAddNewUser,
      setMessagesAddNewUser,
    ] = useState<IMessageGroupChatReceiver | null>(null);
    let date = '';

    const dispatch = useAppDispatch();

    //handle load more when sroll to bottom
    const addToEnd = useCallback(() => {
      setLoadmoreAddToEnd(true);
    }, [loadmoreAddToEnd]);

    //handle load more when sroll to bottom
    useEffect(() => {
      async function fetchPagingFromAPI() {
        console.log('load data to bottom api');
        try {
          const roomID = `${prefixGroup}${infoRoom.room_id}`;
          const respone = await apiGetChatGroupByRoomID(
            roomID,
            condition_get_message_old_or_new_addToEnd,
            lastketAddtoEnd[lastketAddtoEnd.length - 1],
          );
          const resConvert: Array<IMessageGroupChatReceiver> = JSON.parse(
            JSON.stringify(respone.data.data),
          );

          if (resConvert && resConvert.length > 0) {
            if (
              !lastketAddtoEnd.includes(
                `${roomID}%26${resConvert[resConvert.length - 1].create_at}%26${resConvert[resConvert.length - 1].id_message
                }`,
              )
            ) {
              lastketAddtoEnd.push(
                `${roomID}%26${resConvert[resConvert.length - 1].create_at}%26${resConvert[resConvert.length - 1].id_message
                }`,
              );
              let tmp = [...lastketAddtoEnd];
              setLastketAddtoEnd(tmp);
              setMessages(prev => {
                return prev.concat(resConvert);
              });
            }
          } else {
            if (lastketAddtoEnd[lastketAddtoEnd.length - 1] !== '') {
              setMessagesCurrent([]);
              setLoadingEndToStart(false);
            }
          }

          if (resConvert && resConvert.length < limitPaging) {
            setMessagesCurrent([]);
            setLoadingEndToStart(false);
          }
        } catch (error) {
          console.log('error 22', error);
        }
      }

      async function fetchPagingFromLocal(
        roomLocal: RoomChatIndOp.RoomChatSchemaType & Realm.Object,
        indexLastkey: number,
      ) {
        console.log('load data to bottom dblocal');
        const listMessUnRead: Array<string> = [];
        const fromIndex =
          indexLastkey + 1 < roomLocal.message_local.length
            ? indexLastkey + 1
            : roomLocal.message_local.length;
        const toIndex =
          fromIndex + limitPaging + 1 < roomLocal.message_local.length
            ? fromIndex + limitPaging + 1
            : roomLocal.message_local.length;
        if (
          indexLastkey < roomLocal.message_local.length &&
          fromIndex !== roomLocal.message_local.length
        ) {
          const resConvert: Array<IMessageGroupChatReceiver> = roomLocal.message_local.slice(
            fromIndex,
            toIndex,
          );
          if (resConvert && resConvert.length > 0) {
            if (
              !lastketAddtoEnd.includes(
                `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
                }%26${resConvert[resConvert.length - 1].id_message}`,
              )
            ) {
              lastketAddtoEnd.push(
                `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
                }%26${resConvert[resConvert.length - 1].id_message}`,
              );
              let tmp = [...lastketAddtoEnd];
              setLastketAddtoEnd(tmp);
              const tmpresConvert = [...resConvert];
              tmpresConvert.map(m => {
                //update status message
                // if (m.user_sender !== infoRoom.user_login.id) {
                //   m.participants.map(pa => {
                //     if (
                //       pa.code_status !== 2 &&
                //       !listMessUnRead.includes(m.id_message) &&
                //       pa.id_user === infoRoom.user_login.id
                //       //&& !m.message.includes("SpecialMessage:")
                //     ) {
                //       listMessUnRead.push(m.id_message);
                //     }
                //   });
                // }
                //SignedUrl message
                // if (m.files && m.files.length > 0) {
                //   m.files.map(f => {
                //     f.path_file = getSignedUrl(f.path_file);
                //     f.path_file_thumb = getSignedUrl(f.path_file_thumb);
                //   });
                // }
              });
              // if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
              //   wsStatus.send(
              //     JSON.stringify({
              //       ids_message: listMessUnRead,
              //       id_user_login: infoRoom.user_login.id,
              //       code_status: 2,
              //     }),
              //   );
              // }
              setMessages(prev => {
                return prev.concat(tmpresConvert);
              });
            }
          } else {
            if (lastketAddtoEnd[lastketAddtoEnd.length - 1] !== '') {
              setLoadingEndToStart(false);
            }
          }
        }
      }

      if (lastketAddtoEnd && lastketAddtoEnd.length > 0 && loadingEndToStart) {
        async function fetchPaging() {
          if (loadmoreAddToEnd) {
            //await fetchPagingFromAPI();
            console.log('load to end');
            // const realmOpen = await connectDB();
            // realmOpen.write(async () => {
            //   const roomLocal = realmOpen.objectForPrimaryKey<RoomChatSchemaType>(
            //     RoomChatIndOp.NAME_SCHEMA,
            //     infoRoom.room_id,
            //   );
            //   //check lastkey in db local
            //   //yes: load data from dblocal
            //   if (roomLocal && roomLocal.message_local.length > 0) {
            //     let indexLastkey = roomLocal.message_local.findIndex(m => lastketAddtoEnd[lastketAddtoEnd.length - 1].includes(m.id_message));
            //     if (indexLastkey !== -1) {
            //       const checkDBLocal = indexLastkey + 1;
            //       if (roomLocal.message_local[checkDBLocal]) {
            //         if (roomLocal.message_local[indexLastkey].id_message_request) {
            //           if (roomLocal.message_local[indexLastkey].id_message_request === roomLocal.message_local[checkDBLocal].id_message) {
            //             //load from local
            //             fetchPagingFromLocal(roomLocal, indexLastkey)
            //           }
            //           else {
            //             await fetchPagingFromAPI(realmOpen);
            //           }
            //         }
            //         else {
            //           //load data from local
            //           if (roomLocal.message_local[checkDBLocal].id_message_request && roomLocal.message_local[checkDBLocal].id_message_request === roomLocal.message_local[indexLastkey].id_message) {
            //             //load from local
            //             fetchPagingFromLocal(roomLocal, indexLastkey)
            //           }
            //           else if (!roomLocal.message_local[checkDBLocal].id_message_request) {
            //             //load from local
            //             fetchPagingFromLocal(roomLocal, indexLastkey)
            //           }
            //           else {
            //             await fetchPagingFromAPI(realmOpen);
            //           }
            //         }
            //       }
            //       else {
            //         await fetchPagingFromAPI(realmOpen);
            //       }
            //     }
            //     else {
            //       await fetchPagingFromAPI(realmOpen);
            //     }
            //   }
            //   //no: load data from api
            //   else {
            //     await fetchPagingFromAPI(realmOpen);
            //   }
            // });
            await fetchPagingFromAPI();
          }
        }
        fetchPaging();
      }
    }, [loadmoreAddToEnd]);

    //handle load more when sroll to top
    const addToStart = useCallback(() => {
      setLoadmore(true);
    }, [loadmore]);

    //handle load more when sroll to top
    useEffect(() => {
      const roomID = `${prefixGroup}${infoRoom.room_id}`;

      async function fetchPagingFromAPI() {
        console.log(
          'load data to api',
          lastketAddtoStart[lastketAddtoStart.length - 1],
        );
        const listMessUnRead: Array<string> = [];
        const respone = await apiGetChatGroupByRoomID(
          roomID,
          condition_get_message_old_or_new_addToStart,
          lastketAddtoStart[lastketAddtoStart.length - 1],
        );

        const resConvert: Array<IMessageGroupChatReceiver> = JSON.parse(
          JSON.stringify(respone.data.data),
        );

        const listInsertToLocal: any = [];
        for (const m of resConvert) {
          const messCheck = await ChatDBHelperInstance.getMessageLocalByIdMessage(
            m.id_message,
          );
          if (messCheck && messCheck.length === 0) {
            if (m.files === null) {
              m.files = [];
            }
            const newMessage = {
              participants: m.participants,
              message: m.message,
              status: m.status,
              sk: m.SK,
              pk: m.PK,
              attachments: m.files,
              _createAt: m.create_at,
              createAtFormat: m.create_at,
              room_id: m.room_id,
              userReceiver: m.user_receiver,
              userSender: m.user_sender,
              isUnsend: false,
              isLocal: true,
              isCache: false,
              id_local: '',
              id_message: m.id_message,
              filesLocal: [],
              flagRequest: m.flag_request,
              idMessageRequest: m.id_message_request,
              is_group: true,
            };
            listInsertToLocal.push(newMessage);
          }
        }
        console.log("listInsertToLocal", listInsertToLocal.length)
        const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(
          listInsertToLocal,
        );
        await ChatDBHelperInstance.batchAction(newMessageRecord).then(record =>
          console.log('add new message with sroll to bottom', record),
        );

        if (resConvert && resConvert.length > 0) {
          if (
            !lastketAddtoStart.includes(
              `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].PK}`,
            )
          ) {
            lastketAddtoStart.push(
              `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].PK}`,
            );
            let tmp = [...lastketAddtoStart];
            setLastketAddtoStart(tmp);
            resConvert.map(m => {
              //update status message
              if (m.user_sender !== infoRoom.user_login) {
                m.participants.map(pa => {
                  if (
                    pa.code_status !== 2 &&
                    !listMessUnRead.includes(m.id_message) &&
                    pa.user_id === infoRoom.user_login
                    //&& !m.message.includes("SpecialMessage:")
                  ) {
                    listMessUnRead.push(m.id_message);
                  }
                });
              }

              //SignedUrl message
              // if (m.files && m.files.length > 0) {
              //   m.files.map(f => {
              //     f.path_file = getSignedUrl(f.path_file);
              //     f.path_file_thumb = getSignedUrl(f.path_file_thumb);
              //   });
              // }
            });
            if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
              wsStatus.send(
                JSON.stringify({
                  ids_message: listMessUnRead,
                  id_user_login: infoRoom.user_login,
                  code_status: 2,
                  room_id: `${prefixGroupAPI}${infoRoom.room_id}`,
                }),
              );
            }
            console.log('resConvert', resConvert.length);
            setMessages(prev => {
              return resConvert.concat(prev);
            });
          }
        } else {
          if (lastketAddtoStart[lastketAddtoStart.length - 1] !== '') {
            setLoadingAddToStart(true);
          }
        }

        if (resConvert && resConvert.length < limitPaging) {
          setLoadingAddToStart(true);
        }
      }

      async function fetchPagingFromLocal(indexLastkey: number) {
        console.log('load data to dblocal');
        const fromIndex = indexLastkey;
        const toIndex =
          fromIndex - limitPaging > 0 ? fromIndex - limitPaging : 0;
        if (indexLastkey < roomLocal.message_local.length && fromIndex !== 0) {
          const resConvert: Array<IMessageGroupChatReceiver> = roomLocal.message_local.slice(
            toIndex,
            fromIndex,
          );
          if (
            !lastketAddtoStart.includes(
              `${resConvert[0].room_id}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`,
            )
          ) {
            lastketAddtoStart.push(
              `${resConvert[0].room_id}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`,
            );
            let tmp = [...lastketAddtoStart];
            setLastketAddtoStart(tmp);
            const tmpResConvert = [...resConvert];
            tmpResConvert.map(m => {
              //update status message
              // if (m.user_sender !== infoRoom.user_login.id) {
              //   m.participants.map(pa => {
              //     if (
              //       pa.code_status !== 2 &&
              //       !listMessUnRead.includes(m.id_message) &&
              //       pa.id_user === infoRoom.user_login.id
              //     ) {
              //       listMessUnRead.push(m.id_message);
              //     }
              //   });
              // }
              //SignedUrl message
              // if (m.files && m.files.length > 0) {
              //   m.files.map(f => {
              //     f.path_file = getSignedUrl(f.path_file);
              //     f.path_file_thumb = getSignedUrl(f.path_file_thumb);
              //   });
              // }
            });
            // if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
            //   wsStatus.send(
            //     JSON.stringify({
            //       ids_message: listMessUnRead,
            //       id_user_login: infoRoom.user_login.id,
            //       code_status: 2,
            //     }),
            //   );
            // }
            setMessages(prev => {
              return tmpResConvert.concat(prev);
            });
          }
        } else {
          setLoadingAddToStart(true);
        }
      }

      async function fetchPaging() {
        if (loadmore) {
          try {
            if (lastketAddtoStart && lastketAddtoStart.length > 0 && !loadingAddToStart) {
              // const messageLocal = await ChatDBHelperInstance.getMessageLocal();
              // if (messageLocal && messageLocal.length > 0) {
              //   let indexLastkey = messageLocal.findIndex(m => lastketAddtoStart[lastketAddtoStart.length - 1].includes(m._raw.id_message));
              //   if (indexLastkey !== -1) {
              //     const checkDBLocal = indexLastkey - 1;
              //     if (checkDBLocal > 0) {
              //       //check if the message is consecutive or not
              //       if (messageLocal[indexLastkey].id_message_request) {
              //         //load data from local
              //         if (messageLocal[indexLastkey].id_message_request === messageLocal[checkDBLocal].id_message) {
              //           await fetchPagingFromLocal(indexLastkey);
              //         }
              //         else {
              //           await fetchPagingFromAPI(realmOpen);
              //         }
              //       }
              //       else {
              //         //load data from local
              //         if (messageLocal[checkDBLocal].id_message_request && messageLocal[checkDBLocal].id_message_request === messageLocal[indexLastkey].id_message) {
              //           await fetchPagingFromLocal(indexLastkey);
              //         }
              //         else if (!messageLocal[checkDBLocal].id_message_request) {
              //           if (messageLocal[indexLastkey].flag_request === last_message) {
              //             setLoadingAddToStart(true);
              //           }
              //           else {
              //             await fetchPagingFromLocal(indexLastkey);
              //           }
              //         }
              //         else {
              //           await fetchPagingFromAPI(realmOpen);
              //         }
              //       }
              //     }
              //     else {
              //       await fetchPagingFromAPI(realmOpen);
              //     }
              //   }
              //   else {
              //     await fetchPagingFromAPI(realmOpen);
              //   }
              // }
              // else {
              //   await fetchPagingFromAPI(realmOpen);
              // }
              await fetchPagingFromAPI();
            } else {
              console.log('call');
            }
          } catch (error) {
            console.log('error1', error);
          }
        }
      }
      fetchPaging();
    }, [loadmore]);

    const handleOnScroll = useCallback(
      ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
        let bottom =
          nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;

        if (
          nativeEvent.contentOffset.y <
          nativeEvent.layoutMeasurement.height + height * 0.7
        ) {
          if (!loadmore) {
            addToStart();
          }
        }

        if (bottom > nativeEvent.contentSize.height - height * 0.1) {
          if (messages.length > 0 && !loadmoreAddToEnd) {
            addToEnd();
          }
        }

        if (bottom < nativeEvent.contentSize.height - height * 0.1) {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      },
      [fadeAnim, loadmore],
    );

    //handle set message when socket reponse
    const setMessageCurrent = (
      list: Array<IMessageGroupChatReceiver>,
      listUnsend: Array<IMessageGroupChatReceiver>,
    ) => {
      setMessagesCurrent([...list]);
      setMessagesUnSend([...listUnsend]);
      // const listMessage = [...listUnsend];
      // const rawMessagesUnSend: any = [];
      // listMessage.map(async m => {
      //   const rawMessUnsend = ChatDBHelperInstance.
      //   if (m.files === null) {
      //     m.files = []
      //   }
      //   const newMessage = {
      //     participants: m.participants,
      //     message: m.message,
      //     status: m.status,
      //     sk: m.sk,
      //     pk: m.pk,
      //     files: m.files,
      //     create_at: m.create_at,
      //     room_id: m.room_id,
      //     user_receiver: m.user_receiver,
      //     user_sender: m.user_sender,
      //     isUnsend: false,
      //     isLocal: true,
      //     isCache: false,
      //     id_local: '',
      //     id_message: m.id_message,
      //     files_local: [],
      //     flag_request: m.flag_request,
      //     id_message_request: m.id_message_request,
      //     is_group: true,
      //   };
      //   rawMessagesUnSend.push(newMessage);
      // })
    };

    /**
     *  handle add message and messagecurrent to local when ws message reponse data
     */
    const addMessageToLocal = async (m: IMessageGroupChatReceiver) => {
      const newMessage = {
        participants: m.participants,
        message: m.message,
        status: m.status,
        sk: m.SK,
        pk: m.PK,
        attachments: m.files,
        _createAt: m.create_at,
        createAtFormat: m.create_at,
        room_id: m.room_id,
        userReceiver: m.user_receiver,
        userSender: m.user_sender,
        isUnsend: false,
        isLocal: true,
        isCache: false,
        id_local: '',
        id_message: m.id_message,
        filesLocal: [],
        flagRequest: m.flag_request,
        idMessageRequest: m.id_message_request,
        is_group: true,
      };
      const newMessageRecord = ChatDBHelperInstance.prepareCreateMessageGroupChat(
        newMessage,
      );
      await ChatDBHelperInstance.batchAction([newMessageRecord]).then(record =>
        console.log('addMessageToLocal', record),
      );
    };

    /**
     *  handle add message and messagecurrent when ws message reponse data
     */
    const fetchCurrent = useCallback(
      async (receiverData: IMessageGroupChatReceiver) => {
        let temp = [...messagesCurrent];
        let checkUpdateParticipantssMessage = false;

        await addMessageToLocal(receiverData);

        // if (receiverData.files && receiverData.files.length) {
        //   receiverData.files.map(f => {
        //     f.path_file = getSignedUrl(f.path_file);
        //     f.path_file_thumb = getSignedUrl(f.path_file_thumb);
        //   });
        // }
        if (!receiverData.message.includes('SpecialMessage:')) {
          let idx = temp.findIndex(m => m.id_local == receiverData.id_local);
          if (idx !== -1) {
            temp[idx] = { ...temp[idx], ...receiverData };
          }
          // update message
          else {
            temp.push(receiverData);
          }
        } else {
          //update paticipant when add user
          if (receiverData.message.includes('がグループに参加しました')) {
            let arrayParticipants: Array<Participant> = [
              ...receiverData.participants,
            ];

            if (messages.length > 0) {
              if (messages[0].participants.length < arrayParticipants.length) {
                let iduserNewArray: Array<string> = [];
                //new id user add
                let iduserNew = '';
                arrayParticipants.map(m => {
                  iduserNewArray.push(m.user_id);
                });
                iduserNewArray.map(id => {
                  let messFindIndex = [...messages[0].participants];
                  let idxx = messFindIndex.findIndex(m => m.user_id === id);
                  if (idxx === -1) {
                    iduserNew = id;
                  }
                });
                checkUpdateParticipantssMessage = true;
                //update paticipant messages state
                messages.map((m: IMessageGroupChatReceiver, index: number) => {
                  let participantsNew: Participant = {
                    code_status: 0,
                    user_id: iduserNew,
                  };
                  let participantsUpdate = [...m.participants];
                  participantsUpdate.push(participantsNew);
                  m.participants = participantsUpdate;
                });
              }
            }
            if (temp.length > 0) {
              if (temp[0].participants.length < arrayParticipants.length) {
                let iduserNewArray: Array<string> = [];
                let iduserNew = '';
                arrayParticipants.map(m => {
                  iduserNewArray.push(m.user_id);
                });

                iduserNewArray.map(idUser => {
                  let messFindIndex = [...temp[0].participants];
                  let idxIduserOld = messFindIndex.findIndex(
                    id => id.user_id === idUser,
                  );
                  if (idxIduserOld === -1) {
                    iduserNew = idUser;
                  }
                });

                //update paticipant messagesCurrent state
                temp.map((m: IMessageGroupChatReceiver, index: number) => {
                  let participantsNew: Participant = {
                    code_status: 0,
                    user_id: iduserNew,
                  };
                  let participantsUpdate = [...m.participants];
                  participantsUpdate.push(participantsNew);
                  m.participants = participantsUpdate;
                });
              }
            }
          }
          temp.push(receiverData);
        }
        setMessagesCurrent(temp);

        if (checkUpdateParticipantssMessage) {
          setMessages(prev => {
            return prev.concat([]);
          });
        }
        console.log('isGotoDataSearch', isGotoDataSearch);
        console.log('idMessageSearch', idMessageSearch);
        if (!isGotoDataSearch && idMessageSearch === '') {
          const checkLastMessageLocal = messages.findIndex(
            m => m.id_message === idMessageFirstData,
          );
          console.log('checkLastMessageLocal', checkLastMessageLocal);
          if (checkLastMessageLocal === -1) {
            setLoadingEndToStart(false);
            setLoadingAddToStart(false);
            setMessagesCurrent([]);
            setMessagesUnSend([]);
            setMessages([]);
            setLastketAddtoStart([]);
            setLastketAddtoEnd([]);
            await fetchDataFromLocal();
          } else {
            setTimeout(() => {
              if (scrollRef && scrollRef.current) {
                scrollRef.current.scrollToEnd();
              }
            }, 500);
          }
        }
      },
      [messagesCurrent, messages],
    );

    /**
     *  handle update state local db message and messagecurrent when wsstatus reponse data => code status = 2
     */
    const updateStatusLocal = async (m: IMessageUpdateStatusChatGroup) => {
      const messageLocal = await ChatDBHelperInstance.getMessageLocalByIdMessage(
        m.id_message,
      );
      if (messageLocal && messageLocal.length > 0) {
        const participant: Array<Participant> = JSON.parse(
          messageLocal[0]._raw.participants,
        );
        m.participants_code_status.map(codeStatus => {
          const updateStatus = participant.findIndex(
            par => par.user_id === codeStatus,
          );
          participant[updateStatus].code_status = 2;
        });
        let dataLocal = {
          message: messageLocal[0]._raw.message,
          filesLocal: messageLocal[0]._raw.filesLocal,
          participants: participant,
        };

        const updateMessgaeCache = await ChatDBHelperInstance.prepareUpdateMessageChatGroup(
          messageLocal,
          dataLocal,
          messageLocal[0]._raw.id,
        );
        console.log('update participant', messageLocal[0]._raw.id);
      }
    };

    /**
     *  handle update state message and messagecurrent when wsstatus reponse data => code status = 2
     */
    const fetchUpdateStatus = useCallback(
      async (arrMessageReaded: Array<IMessageUpdateStatusChatGroup>) => {
        if (arrMessageReaded && arrMessageReaded.length > 0) {
          let checkUpdateStatusMessage = false;
          for (const m of arrMessageReaded) {
            let idx = messagesCurrent.findIndex(
              md => md.id_message == m.id_message,
            );
            if (idx !== -1) {
              m.participants_code_status.map(iduser => {
                if (!messagesCurrent[idx].message.includes('SpecialMessage:')) {
                  let idxpa = messagesCurrent[idx].participants.findIndex(
                    pa => pa.user_id === iduser,
                  );
                  if (
                    messagesCurrent[idx] &&
                    messagesCurrent[idx].participants[idxpa]
                  )
                    messagesCurrent[idx].participants[idxpa].code_status = 2;
                }
              });
            }

            let idxx = messages.findIndex(md => md.id_message == m.id_message);
            if (idxx !== -1) {
              if (!messages[idxx].message.includes('SpecialMessage:')) {
                checkUpdateStatusMessage = true;
                m.participants_code_status.map(iduser => {
                  let idxpa = messages[idxx].participants.findIndex(
                    pa => pa.user_id === iduser,
                  );
                  if (messages[idxx] && messages[idxx].participants[idxpa])
                    messages[idxx].participants[idxpa].code_status = 2;
                });
              }
            }
            await updateStatusLocal(m);
          }

          let tmp = [...messagesCurrent];
          setMessagesCurrent(tmp);
          if (checkUpdateStatusMessage) {
            setMessages(prev => {
              return prev.concat([]);
            });
          }
        }
      },
      [messagesCurrent, messages],
    );

    /**
     *  handle update state message and messagecurrent when wsstatus reponse data => code status = 2
     */
    useEffect(() => {
      if (messagesSendReaded) {
        fetchUpdateStatus(messagesSendReaded);
      }
    }, [messagesSendReaded]);

    /**
     *  handle update state message and messagecurrent when ws message reponse data
     */
    useEffect(() => {
      if (messagesAddNewUser) {
        let newMessages = { ...messagesAddNewUser };
        fetchCurrent(newMessages);
      }
    }, [messagesAddNewUser]);

    /** handle socket
     *  receiver data from socket & render
     */
    const handleSocket = useCallback(() => {
      ws.onopen = () => {
        console.log('ws.onopen');
      };

      wsStatus.onopen = () => {
        console.log('wsStatus.onopen');
      };

      ws.onmessage = (e: any) => {
        let dataUpdate: IMessageGroupChatReceiver = JSON.parse(e.data);
        const MessClone = JSON.parse(JSON.stringify(dataUpdate));
        if (infoRoom && mounted.current) {
          if (
            wsStatus?.readyState === 1 &&
            dataUpdate.user_sender !== infoRoom.user_login
            //&& !dataUpdate.message.includes("SpecialMessage:")
          ) {
            wsStatus.send(
              JSON.stringify({
                ids_message: [dataUpdate.id_message],
                id_user_login: infoRoom.user_login,
                code_status: 2,
                room_id: `${prefixGroupAPI}${infoRoom.room_id}`,
              }),
            );
          }
          //case add new user
          setMessagesAddNewUser(MessClone);
        }
      };

      wsStatus.onmessage = (e: any) => {
        let res = JSON.parse(e.data);
        if (res && mounted.current) {
          setMessagesSendReaded(res);
        }
      };

      ws.onclose = () => {
        console.log('ws.onclose');
        setConnection({
          type: NetInfoStateType.none,
          isConnected: false,
        });
        dispatch(
          createAction(groupchat.CLOSE_SOCKET, {
            room_id: infoRoom.room_id,
          }),
        );
      };

      wsStatus.onclose = () => {
        console.log('wsStatus.onclose');
        dispatch(
          createAction(groupchat.CLOSE_SOCKET, {
            room_id: infoRoom.room_id,
          }),
        );
      };
    }, [ws, wsStatus]);

    /**
     *  handle get data when open room chat
     */
    const fetchData = useCallback(async () => {
      try {
        await ChatDBHelperInstance.deleteMessageLocal();
        const roomID = `${prefixGroup}${infoRoom.room_id}`//`CR#GROUP#${infoRoom.room_id}`
        const respone = await apiGetChatGroupByRoomID(roomID);
        if (respone.data) {
          const listMessUnRead: Array<string> = [];
          const resConvert: Array<IMessageGroupChatReceiver> = JSON.parse(
            JSON.stringify(respone.data.data),
          );
          //insert message from api to db local
          const rawMessages: any = [];
          resConvert.map(async m => {
            if (m.files === null) {
              m.files = []
            }
            const newMessage = {
              participants: m.participants,
              message: m.message,
              status: m.status,
              sk: m.SK,
              pk: m.PK,
              attachments: m.files,
              _createAt: m.create_at,
              createAtFormat: m.create_at,
              room_id: m.room_id,
              userReceiver: m.user_receiver,
              userSender: m.user_sender,
              isUnsend: false,
              isLocal: true,
              isCache: false,
              id_local: '',
              id_message: m.id_message,
              filesLocal: [],
              flagRequest: m.flag_request,
              idMessageRequest: m.id_message_request,
              is_group: true,
            };
            rawMessages.push(newMessage);
          })

          const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(rawMessages);
          await ChatDBHelperInstance.batchAction(newMessageRecord).then(record =>
            console.log('record', record),
          );

          const lastkey = JSON.parse(
            JSON.stringify(respone.data.LastEvaluatedKeyOldDate),
          );
          lastketAddtoStart.push(
            `${roomID}%26${lastkey.create_at}%26${lastkey.PK}`,
          );

          let tmp = [...lastketAddtoStart];
          setLastketAddtoStart(tmp);
          setIdMessageFirstData(resConvert[resConvert.length - 1].id_message);
          resConvert.map(m => {
            //update status message
            if (m.user_sender !== infoRoom.user_login) {
              m.participants.map(pa => {
                if (
                  pa.code_status !== 2 &&
                  !listMessUnRead.includes(m.id_message) &&
                  pa.user_id === infoRoom.user_login
                  //&& !m.message.includes("SpecialMessage:")
                ) {
                  listMessUnRead.push(m.id_message);
                }
              });
            }
          });
          if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
            wsStatus.send(
              JSON.stringify({
                ids_message: listMessUnRead,
                id_user_login: infoRoom.user_login,
                code_status: 2,
                room_id: `${prefixGroupAPI}${infoRoom.room_id}`
              }),
            );
          }

          setMessages(resConvert);
          setTimeout(() => {
            if (scrollRef && scrollRef.current) {
              scrollRef.current.scrollToEnd();
            }
          }, 500);
          if (resConvert.length < 20) {
            setLoadingAddToStart(true);
          }
        }
        else {
          setLoadingAddToStart(true);
        }
      } catch (error) {
        setLoadingAddToStart(true);
        console.log('error get message chat group', error);
      }
    }, [infoRoom]);

    /**
     *  get data cache user input
     */
    const fetchDataCache = useCallback(async () => {
      const messageCache = await ChatDBHelperInstance.getMessageCache(
        `CR#GROUP#${infoRoom.room_id}`,
      );
      if (messageCache && messageCache.length > 0) {
        const message = get(messageCache, [0,`_raw`,`message`], [])
        const cache: IMessageGroupChatReceiver = {
          participants: messageCache[0]._raw.participants,
          message: message,
          status: messageCache[0]._raw.status,
          SK: messageCache[0]._raw.sk,
          PK: messageCache[0]._raw.pk,
          files: messageCache[0]._raw.files,
          create_at: messageCache[0]._raw.create_at,
          room_id: messageCache[0]._raw.room_id,
          user_receiver: messageCache[0]._raw.user_receiver,
          user_sender: messageCache[0]._raw.user_sender,
          isUnsend: messageCache[0]._raw.isUnsend,
          isLocal: messageCache[0]._raw.isLocal,
          isCache: messageCache[0]._raw.isCache,
          id_local: messageCache[0]._raw.id_local,
          id_message: messageCache[0]._raw.id_message,
          filesLocal: JSON.parse(messageCache[0]._raw.files_local),
          flag_request: messageCache[0]._raw.flag_request,
          id_message_request: messageCache[0]._raw.id_message_request,
          is_group: messageCache[0]._raw.is_group,
        };
        setMessagesCache(cache);
      }
      const messageUnsend = await ChatDBHelperInstance.getMessageUnSend();
      if (messageUnsend && messageUnsend.length > 0) {
        const listUnsend: Array<IMessageGroupChatReceiver> = [];
        messageUnsend.map(m => {
          const unsend: IMessageGroupChatReceiver = {
            participants: m._raw.participants,
            message: m._raw.message,
            status: m._raw.status,
            SK: m._raw.sk,
            PK: m._raw.pk,
            files: m._raw.files,
            create_at: m._raw.create_at,
            room_id: m._raw.room_id,
            user_receiver: m._raw.user_receiver,
            user_sender: m._raw.user_sender,
            isUnsend: m._raw.isUnsend,
            isLocal: m._raw.isLocal,
            isCache: m._raw.isCache,
            id_local: m._raw.id_local,
            id_message: m._raw.id_message,
            filesLocal: JSON.parse(m._raw.files_local),
            flag_request: m._raw.flag_request,
            id_message_request: m._raw.id_message_request,
            is_group: m._raw.is_group,
          };
        });

        setMessagesUnSend(listUnsend);
      }
    }, [infoRoom]);

    /**
     *  handle resend message when not connect internet
     */
    const handleResendMessage = async (item: IMessageGroupChatReceiver) => {
      const handleUploadImage = async (
        arrfiles: Array<{
          file_name: string;
          uri: string;
          width: number;
          height: number;
          type: string;
        }>,
        callBack: (res: AxiosResponse<any>) => void,
        errorCallBack: () => void,
      ) => {
        let data = new FormData();
        if (arrfiles.length > 0) {
          arrfiles.map((file, index) => {
            let image = {
              uri:
                Platform.OS === 'android'
                  ? file.uri
                  : file.uri.replace('file://', ''),
              name: file.file_name,
              // name: undefined,
              type: file.type,
            };
            data.append('files', image);
          });
        }
        await apiUploadImage(CATEGORY_TYPE.ALBUM, data)
          .then(callBack)
          .catch(error => {
            console.log('error', error);
            errorCallBack();
          })
          .finally(() => { });
      };
      if (item.id_message == 'local' && infoRoom && connection.isConnected) {
        if (ws.readyState === 1) {
          let dataSend: ImessageChatGroup = {
            chat_room_id: item.room_id,
            message: item.message,
            user_sender: item.user_sender,
            files: [],
            id_local: item.id_local,
          };
          if (item.filesLocal && item.filesLocal.length > 0) {
            await handleUploadImage(
              item.filesLocal as {
                file_name: string;
                uri: string;
                width: number;
                height: number;
                type: string;
              }[],
              res => {
                let arr: Array<File> = [];
                let resData = res.data;
                if (res.data.length) {
                  arr = resData.map((item: IImage) => ({
                    ...JSON.parse(JSON.stringify(item)),
                  }));
                }
                dataSend.files = arr;
                ws.send(JSON.stringify(dataSend));
                let idx_local_arr = messagesCurrent.findIndex(
                  m => m.id_local == item.id_local,
                );
                if (idx_local_arr === -1) {
                  let listCurrent = [...messagesCurrent];
                  listCurrent.push(item);
                  let listUnsend = [...messagesUnSend];
                  let idxxx = listUnsend.findIndex(
                    m => m.id_local === item.id_local,
                  );
                  listUnsend.splice(idxxx, 1);
                  setMessageCurrent(listCurrent, listUnsend);
                  //
                }
              },
              () => { },
            );
          } else {
            ws.send(JSON.stringify(dataSend));
            let idx_local_arr = messagesCurrent.findIndex(
              m => m.id_local == item.id_local,
            );
            if (idx_local_arr === -1) {
              let listCurrent = [...messagesCurrent];
              listCurrent.push(item);
              let listUnsend = [...messagesUnSend];
              let idxxx = listUnsend.findIndex(
                m => m.id_local === item.id_local,
              );
              listUnsend.splice(idxxx, 1);
              setMessageCurrent(listCurrent, listUnsend);
              //
            }
          }
        } else if (ws.readyState === 3) {
          dispatch(
            createAction(groupchat.CLOSE_SOCKET, {
              room_id: infoRoom.room_id,
            }),
          );
        }
      }
    };

    //handle save mouted component
    const storeDataIsMouted = async (mouted: string) => {
      try {
        await AsyncStorage.setItem('@moutedChatDetail', mouted);
      } catch (e) {
        // saving error
      }
    };

    //handle set First Call GotoSearchMessage
    const setisFirstCallGotoSearchMessage = (
      isFirstGotoDataSearch: boolean,
    ) => {
      setIsFirstGotoDataSearch(isFirstGotoDataSearch);
    };

    // componentDidMount
    useEffect(() => {
      mounted.current = true;

      storeDataIsMouted('mouted');
      NetInfo.addEventListener(state => {
        if (mounted.current)
          setConnection({
            type: NetInfoStateType.other,
            isConnected: state.isConnected,
          });
      });
      // call handle socket
      handleSocket();
      //get message from room chat cache
      fetchDataCache();
      //get message from room chat
      fetchData();

      return () => {
        storeDataIsMouted('unMouted');
        mounted.current = false;
      };
    }, []);

    // handle get data
    const handleFetchDataWithKeyworkSearch = useCallback(
      async (
        id_MessageSearch: string,
        createAt_MessageSearch: string,
        index: number,
      ) => {
        setLoadingEndToStart(true);
        setIsFirstGotoDataSearch(false);
        setIdMessgaeFooter(id_MessageSearch);
        setIndexMessgaeFooter(index);
        setLoadingAddToStart(false);
        setLastketAddtoStart([]);
        setLastketAddtoEnd([]);
        setMessagesCurrent([]);
        setMessagesUnSend([]);
        setMessages([]);

        async function fetchPaging() {
          try {
            const roomID = `${prefixGroup}${infoRoom.room_id}`;
            const allMessage = await ChatDBHelperInstance.getAllRecordBySchema();

            if (allMessage) {
              const idCheck = allMessage.findIndex(
                i => i._raw.id_message === id_MessageSearch,
              );
              if (idCheck !== -1) {
                console.log('search load to local');
                const fromIndex =
                  idCheck + limitPaging / 2 < allMessage.length
                    ? idCheck + limitPaging / 2
                    : allMessage.length;
                const toIndex =
                  idCheck - (limitPaging / 2 - 1) > 0
                    ? idCheck - (limitPaging / 2 - 1)
                    : 0;
                
                //
                const messeSearcg = allMessage.slice(toIndex, fromIndex);
                const resConvert: Array<IMessageGroupChatReceiver> = [];
                messeSearcg.map(m => {
                  const messReceiver: IMessageGroupChatReceiver = {
                    participants: JSON.parse(m._raw.participants),
                    message: m._raw.message,
                    status: m._raw.status,
                    SK: m._raw.sk,
                    PK: m._raw.pk,
                    files: JSON.parse(m._raw.files),
                    create_at: m._raw.createAtFormat,
                    room_id: m._raw.room_id,
                    user_receiver: m._raw.user_receiver,
                    user_sender: m._raw.user_sender,
                    isUnsend: m._raw.isUnsend,
                    isLocal: m._raw.isLocal,
                    isCache: m._raw.isCache,
                    id_message: m._raw.id_message,
                    filesLocal: [],
                    flag_request: m._raw.flag_request,
                    id_message_request: m._raw.id_message_request,
                    is_group: m._raw.is_group,
                  };
                  resConvert.push(messReceiver);
                });
                //const resConvert: Array<IMessageGroupChatReceiver> = allMessage.slice(toIndex, fromIndex);
                const lastkeyNew = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`;
                const tmp = [];
                tmp.push(lastkeyNew);
                setLastketAddtoStart(tmp);
                const lastkeyNewAddtoEnd = `${roomID}%26${resConvert[resConvert.length - 1].create_at
                  }%26${resConvert[resConvert.length - 1].id_message}`;
                const tmpEnd = [];
                tmpEnd.push(lastkeyNewAddtoEnd);
                setLastketAddtoEnd(tmpEnd);
                const tmpResConvert = [...resConvert];
                setMessages(tmpResConvert);
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
        await fetchPaging();
      },
      [
        keywork,
        isGotoDataSearch,
        idMessageSearch,
        createMessageSearch,
        indexItemSelected,
      ],
    );

    //go to data search with keywork search
    useEffect(() => {
      if (isGotoDataSearch && keywork !== '') {
        handleFetchDataWithKeyworkSearch(
          idMessageSearch,
          createMessageSearch,
          indexItemSelected,
        );
      }

      if (keywork === '') {
        setIsFirstGotoDataSearch(false);
        setIndexMessgaeFooter(0);
      }
    }, [
      keywork,
      isGotoDataSearch,
      idMessageSearch,
      createMessageSearch,
      indexItemSelected,
    ]);

    //load 20 item message new from db local
    const fetchDataFromLocal = async () => {
      const roomID = `${prefixGroup}${infoRoom.room_id}`;
      const allMessage = await ChatDBHelperInstance.getAllRecordBySchema();

      if (allMessage) {
        const toIndex = allMessage.length - 1;
        const fromIndex = toIndex - limitPaging > 0 ? toIndex - limitPaging : 0;
        const messFirst = allMessage.slice(fromIndex, toIndex);
        const resConvert: Array<IMessageGroupChatReceiver> = [];
        messFirst.map(m => {
          const messReceiver: IMessageGroupChatReceiver = {
            participants: JSON.parse(m._raw.participants),
            message: m._raw.message,
            status: m._raw.status,
            SK: m._raw.sk,
            PK: m._raw.pk,
            files: JSON.parse(m._raw.files),
            create_at: m._raw.createAtFormat,
            room_id: m._raw.room_id,
            user_receiver: m._raw.user_receiver,
            user_sender: m._raw.user_sender,
            isUnsend: m._raw.isUnsend,
            isLocal: m._raw.isLocal,
            isCache: m._raw.isCache,
            id_message: m._raw.id_message,
            filesLocal: [],
            flag_request: m._raw.flag_request,
            id_message_request: m._raw.id_message_request,
            is_group: m._raw.is_group,
          };
          resConvert.push(messReceiver);
        });
        const lastkey = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`;
        lastketAddtoStart.push(`${lastkey}`);
        let tmp = [...lastketAddtoStart];
        setLastketAddtoStart(tmp);
        setIdMessageFirstData(resConvert[resConvert.length - 1].id_message);
        setMessages(resConvert);
        setTimeout(() => {
          if (scrollRef && scrollRef.current) {
            scrollRef.current.scrollToEnd();
          }
        }, 500);
        if (resConvert.length < 20) {
          setLoadingAddToStart(true);
        }
      }
    };

    // handle sroll to end when click button SrollToEnd
    const handleSrollToEnd = async () => {
      const checkLastMessageLocal = messages.findIndex(
        m => m.id_message === idMessageFirstData,
      );
      if (checkLastMessageLocal === -1) {
        setLoadingEndToStart(false)
        setLoadingAddToStart(false);
        setMessagesCurrent([]);
        setMessagesUnSend([]);
        setMessages([]);
        setLastketAddtoStart([])
        setLastketAddtoEnd([]);
        await fetchDataFromLocal();
      }
      else {
        scrollRef.current.scrollToEnd();
      }
      // setLoadingEndToStart(false);
      // setLoadingAddToStart(false);
      // setMessagesCurrent([]);
      // setMessagesUnSend([]);
      // setMessages([]);
      // setLastketAddtoStart([]);
      // setLastketAddtoEnd([]);
      // await fetchDataFromLocal();
    };

    // handle arrow up when click up down in search message
    const handleArrowUpSearchMessage = (
      idmessage: string,
      create_at: string,
      index: number,
    ) => {
      setIsFirstGotoDataSearch(false);
      handleFetchDataWithKeyworkSearch(idmessage, create_at, index);
    };

    const handleDeleteMessage = async (idMessage: string) => {
      console.log('idMessage', idMessage);

      Alert.alert(
        'Are your sure?',
        'Are you sure you want to remove this message?',
        [
          {
            text: Messages.COMMON.BUTTON.CANCEL,
          },
          {
            text: Messages.COMMON.BUTTON.CONFIRM,
            onPress: () => {
              apiDeleteMessage(idMessage, infoRoom.room_id)
                .then(res => {
                  const data: {
                    id_message: string;
                    is_delete: boolean;
                  } = JSON.parse(JSON.stringify(res.data));
                  if (data && data.id_message && data.is_delete) {
                    const messagesLocalTemp = [...messages];
                    const messagesCurrentTemp = [...messagesCurrent];
                    let idxLocal = messagesLocalTemp.findIndex(
                      item => item.id_message == idMessage,
                    );
                    let idxCurrent = messagesCurrentTemp.findIndex(
                      item => item.id_message == idMessage,
                    );
                    if (idxLocal !== -1) {
                      messagesLocalTemp.splice(idxLocal, 1);
                    }
                    if (idxCurrent !== -1) {
                      messagesCurrentTemp.splice(idxLocal, 1);
                    }

                    setMessages(messagesLocalTemp);
                    setMessagesCurrent(messagesCurrentTemp);
                  }
                })
                .catch(err => {
                  let payload: IToast = {
                    isShow: true,
                    title: Messages.COMMON.MSG_COMMON_ERROR_001,
                    type: TypeToash.ERROR,
                    message: `${err}`,
                  };
                  dispatch(createAction(modal.SET_TOASH, payload));
                });
            },
          },
          // The "No" button
          // Does nothing but dismiss the dialog when tapped
        ],
      );
    };

    return (
      <ChannelContext.Provider value={{ handleDeleteMessage }}>
        <ScrollView
          ref={scrollRef}
          maintainVisibleContentPosition={{
            minIndexForVisible: 1,
          }}
          style={{ paddingTop: 10 }}
          onContentSizeChange={() => {
            if (loadmore) {
              setTimeout(() => setLoadmore(false), 500);
            }
            if (loadmoreAddToEnd) {
              setTimeout(() => setLoadmoreAddToEnd(false), 500);
            }
          }}
          scrollEventThrottle={16}
          onScroll={handleOnScroll}
          removeClippedSubviews={true}>
          <View
            style={{
              height: !loadingAddToStart ? 40 : 0,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              display: !loadingAddToStart ? 'flex' : 'none',
            }}>
            <ActivityIndicator size={20} color={'#000'} />
          </View>

          <MessagesLocalChatGroup
            messageLocalDB={messages}
            infoRoom={infoRoom}
            connection={connection}
            scrollRef={scrollRef}
            keyword={keywork}
            keyworkFullwidth={keyworkFullwidth}
            keyworkHalfwidth={keyworkHalfwidth}
            idmessage={idMessgaeFooter}
            isFirstGotoDataSearch={isFirstGotoDataSearch}
            setisFirstCallGotoSearchMessage={setisFirstCallGotoSearchMessage}
            date={date}
          />

          <MessagesCurrentChatGroup
            messagesCurrent={messagesCurrent}
            infoRoom={infoRoom}
            isConnected={connection.isConnected}
            loadingEndToStart={loadingEndToStart}
          />

          <MessagesUnsendChatGroup
            messagesUnsend={messagesUnSend}
            infoRoom={infoRoom}
            connection={connection}
            handleResendMessageMessage={handleResendMessage}
          />

          <View
            style={{
              height: loadingEndToStart && messages.length > 0 ? 40 : 0,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              display:
                loadingEndToStart && messages.length > 0 ? 'flex' : 'none',
            }}>
            <ActivityIndicator size={20} color={'#000'} />
          </View>

          <View
            style={{
              height: 1,
              display: 'flex',
            }}></View>
        </ScrollView>

        <View style={[{ position: 'relative' }]}>
          <ButtonIcon
            onPress={() => {
              handleSrollToEnd();
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 10,
              zIndex: 100,
              display: 'flex',
              transform: [{ translateY: -20 }],
            }}>
            <Animated.View
              style={[
                styles.iconBtnScroll,
                {
                  // backfaceVisibility: 'hidden
                  opacity: fadeAnim,
                  paddingHorizontal: 6,
                  paddingVertical: 6,
                },
              ]}>
              <AntDesign
                size={15}
                name="arrowdown"
                style={{ color: '#ececec' }}
              />
            </Animated.View>
          </ButtonIcon>
        </View>

        <View style={[styles.topLine, styles.inpAction]}>
          {isOpentSearchMessage ? (
            <FooterSearch
              idmessage={idMessgaeFooter}
              indexItemSelected={indexMessgaeFooter}
              dataMessageSearch={dataMessageSearch}
              handleArrowUpDownSearchMessage={handleArrowUpSearchMessage}
            />
          ) : (
            <InputAction
              navigation={navigation}
              ws={ws}
              setMessageCurrent={setMessageCurrent}
              listMessageCurrent={messagesCurrent}
              listMessageUnsend={messagesUnSend}
              cacheDataMessage={cacheMessages}
              infoRoom={infoRoom}
              connection={connection}
              refScrollView={scrollRef}
            />
          )}
        </View>
      </ChannelContext.Provider>
    );
  },
);
export default ChanelMessages;
const styles = StyleSheet.create({
  topLine: {
    shadowColor: '#000',
    backgroundColor: 'transparent',
  },
  inpAction: {
    paddingTop: 5,
    backgroundColor: '#fff',
    borderColor: 'rgba(230,230,230,0.8)',
    borderTopWidth: 1,
    elevation: 0,
    paddingBottom: 3,
  },
  iconBtnScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    elevation: 0,
  },
});
