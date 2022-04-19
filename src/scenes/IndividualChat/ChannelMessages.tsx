import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { ScrollView } from '@stream-io/flat-list-mvcp';
import { AxiosResponse } from 'axios';
import { forEach, isEmpty } from 'lodash';
import React, { createRef, PureComponent } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View,
  Alert,
  Text,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect, ConnectedProps } from 'react-redux';
import { ButtonIcon } from '../../components/buttons';
import InputAction from '../../components/common/InputAction/indexV2';
import FooterSearch from '../../components/common/SearchMessage/FooterSearch';
import { connectDB } from '../../database';
import { RoomChatIndOp } from '../../database/modules/IndividualChatScreen';
import { RoomChatSchemaType } from '../../database/modules/IndividualChatScreen/roomChatSchema';
import { useS3 } from '../../hooks/aws';
import { ChannelContext } from '../../hooks/chat';
import { get } from 'lodash';
import {
  File,
  IChat,
  IChatResutlMessageSearch,
  IChatTmp,
  ImessageChat,
  IMessageReceiver,
} from '../../models/chat';
import { IImage } from '../../models/image';
import {
  apiGetChatDetailByKeyworkSearch,
  apiGetChatIndivial,
} from '../../services/chat';
import { apiUploadImage, CATEGORY_TYPE } from '../../services/image';
import { apiDeleteMessage } from '../../services/chat';
import { AppDispatch, RootState } from '../../stories';
import { createAction } from '../../stories/actions';
import { individualChat, modal } from '../../stories/types';
import MessagesCurrent from './MessagesCurrent';
import MessagesFromLocal from './MessagesFromLocal';
import MessagesUnsend from './MessagesUnsend';
import { IToast, TypeToash } from '../../models/common';
import Messages from '../../config/Messages';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import ModalLoading, {
  IModalData,
} from '../../components/common/LoadingCircle/modalLoading';
const { height, width } = Dimensions.get('screen');
const { getSignedUrl } = useS3();

const condition_get_message_old_or_new_addToStart = 'load_to_old_date';
const condition_get_message_old_or_new_addToEnd = 'load_to_new_date';
const limitPaging = 20;
const last_message = 'last_message';

type Props = {
  infoRoom: IChat;
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
  navigation: any;
  ws: WebSocket;
  wsStatus: WebSocket;

  //search message
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

type State = {
  messagesLocal: Array<IMessageReceiver>;
  messagesCurrent: Array<IMessageReceiver>;
  messagesUnsend: Array<IMessageReceiver>;
  cacheDataMessage: IMessageReceiver | null;
  lastketAddtoStart: Array<string>;
  lastkeyAddtoEnd: Array<string>;
  loadmore: boolean;
  loadmoreAddToEnd: boolean;
  loadingAddToStart: boolean;
  loadingEndToStart: boolean;
  //search message
  indexMessgaeFooter: number;
  isFirstGotoDataSearch: boolean;
  idMessgaeFooter: string;
  idMessageFirstData: string;
  isMoutingComponent: boolean;
  messagesDelete: string[];
  modalLoadingRef: IModalData;
};

const mapStateToProps = (state: RootState, owlProp: Props) => {
  return {
    dataIndividualChat: state.dataIndividualChat,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, owlProp: any) => {
  return {
    fetchInfoRoom: (payload: { info_room: IChat }) =>
      dispatch(createAction(individualChat.CREATE_ROOM, payload)),
    closeSocket: (room_id: string) =>
      dispatch(createAction(individualChat.CLOSE_SOCKET, { room_id })),
    setUnmount: (value: boolean, room_id: string) =>
      dispatch(
        createAction(individualChat.SET_VAL_IS_CLOSE_SOCKET, { value, room_id }),
      ),
    setIntervalRoom: (room_id: string, timerCheck: NodeJS.Timeout) =>
      dispatch(
        createAction(individualChat.SET_TIMER_INTERVAL, { room_id, timerCheck }),
      ),
    clearIntervalRoom: (room_id: string) =>
      dispatch(createAction(individualChat.CLEAR_TIMER_INVERVAL, { room_id })),
    toast: (payload: IToast) =>
      dispatch(createAction(modal.SET_TOASH, payload)),
  };
};
const connector = connect(mapStateToProps, mapDispatchToProps);

class ChannelMessages extends PureComponent<
  Props & ConnectedProps<typeof connector>,
  State
> {
  fadeAnim: Animated.Value;
  scrollRef: React.MutableRefObject<any>;
  date: string;
  isUnmount: boolean;
  constructor(props: Props & ConnectedProps<typeof connector>) {
    super(props);
    this.state = {
      messagesLocal: [],
      messagesCurrent: [],
      messagesUnsend: [],
      lastketAddtoStart: [],
      lastkeyAddtoEnd: [],
      cacheDataMessage: null,
      loadmore: false,
      loadmoreAddToEnd: false,
      loadingAddToStart: false,
      loadingEndToStart: false,
      //search message
      indexMessgaeFooter: this.props.indexItemSelected,
      isFirstGotoDataSearch: false,
      idMessgaeFooter: this.props.idMessageSearch,
      idMessageFirstData: '',
      isMoutingComponent: false,
      messagesDelete: [],
      modalLoadingRef: { open: () => undefined, close: () => undefined },
    };
    this.fadeAnim = new Animated.Value(0);
    this.scrollRef = createRef<ScrollView | any>();
    this.date = '';
    this.isUnmount = false;
    /**
     * get socket store
     */
    this.props.fetchInfoRoom({ info_room: this.props.infoRoom });

    this.props.clearIntervalRoom(this.props.infoRoom.room_id);

    this.fetchData = this.fetchData.bind(this);
    this.fetchDataCache = this.fetchDataCache.bind(this);
    this.addToStart = this.addToStart.bind(this);
    this.handleOnScroll = this.handleOnScroll.bind(this);
    this.handleDeleteMessage = this.handleDeleteMessage.bind(this);
    this.insertMessageLocal = this.insertMessageLocal.bind(this);
  }

  //save data to db local
  insertMessageLocal = async (resConvert: Array<IMessageReceiver>) => {
    const rawMessages: any = [];
    resConvert.map(async m => {
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
        is_group: false,
      };
      rawMessages.push(newMessage);
    });
    const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(
      rawMessages,
    );
    await ChatDBHelperInstance.batchAction(newMessageRecord).then(record =>
      console.log('record', record),
    );
  };

  //get data from api
  fetchData = async (infoRoomParam: IChat) => {
    const { lastketAddtoStart } = this.state;
    const { wsStatus, infoRoom } = this.props;

    try {
      await ChatDBHelperInstance.deleteMessageLocal();
      // const realmOpen = await connectDB();
      const roomId: string = infoRoomParam.room_id;
      const respone = await apiGetChatIndivial(roomId.replace(/#/g, '%23'));
      if (respone.data) {
        const listMessUnRead: Array<string> = [];
        const resConvert: Array<IMessageReceiver> = JSON.parse(
          JSON.stringify(respone.data.data),
        );

        //save to local
        this.insertMessageLocal(resConvert);

        const lastkey = JSON.parse(
          JSON.stringify(respone.data.LastEvaluatedKeyOldDate),
        );

        lastketAddtoStart.push(
          `${lastkey.SK}%26${lastkey.create_at}%26${lastkey.PK}`,
        );
        let tmp = [...lastketAddtoStart];
        this.setState({
          lastketAddtoStart: tmp,
          idMessageFirstData: resConvert[resConvert.length - 1].id_message,
        });
        resConvert.map(m => {
          //update status message
          if (m.user_sender !== infoRoomParam.user_login && m.status !== 2) {
            listMessUnRead.push(m.id_message);
          }
        });
        if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
          wsStatus.send(
            JSON.stringify({
              id_messages: listMessUnRead,
              status_code: 2,
              room_id: infoRoomParam.room_id,
            }),
          );
        }

        this.setState({ messagesLocal: resConvert });
        setTimeout(() => {
          if (this.scrollRef && this.scrollRef.current) {
            this.scrollRef.current.scrollToEnd();
          }
        }, 500);
        if (resConvert.length < 20) {
          this.setState({ loadingAddToStart: true });
        }
      } else {
        this.setState({ loadingAddToStart: true });
      }
    } catch (error) {
      this.setState({ loadingAddToStart: true });
      console.log('error get message chat', error);
    }
  };

  //get message unsend and cache input
  fetchDataCache = async (infoRoomParam: IChat) => {

    const messageCache = await ChatDBHelperInstance.getMessageCacheIndividual(
      `${infoRoomParam.room_id}`,
    );

    if (messageCache && messageCache.length > 0) {
      const cache: IMessageReceiver = {
        participants: get(messageCache, [0, `_raw`, `participants`], []),
        message: get(messageCache, [0, `_raw`, `message`], []),
        status: get(messageCache, [0, `_raw`, `status`], []),
        SK: get(messageCache, [0, `_raw`, `sk`], []),
        PK: get(messageCache, [0, `_raw`, `pk`], []),
        files: get(messageCache, [0, `_raw`, `files`], []),
        create_at: get(messageCache, [0, `_raw`, `create_at`], []),
        room_id: get(messageCache, [0, `_raw`, `room_id`], []),
        user_receiver: get(messageCache, [0, `_raw`, `user_receiver`], []),
        user_sender: get(messageCache, [0, `_raw`, `user_sender`], []),
        id_local: get(messageCache, [0, `_raw`, `id_local`], []),
        id_message: get(messageCache, [0, `_raw`, `id_message`], []),
        filesLocal: JSON.parse(get(messageCache, [0, `_raw`, `files_local`], [])),
        flag_request: get(messageCache, [0, `_raw`, `flag_request`], []),
        id_message_request: get(messageCache, [0, `_raw`, `id_message_request`], []),
      };
      this.setState({
        cacheDataMessage: cache,
      });
    }

    // const messageUnSend = await ChatDBHelperInstance.getMessageUnsendIndividual(
    //   `${infoRoomParam.room_id}`,
    // );

    // const listMessageUnSendLocal: IMessageReceiver[] = [];
    // if (messageUnSend && messageUnSend.length > 0) {
    //   messageUnSend.map(m => {
    //     const unsend: IMessageReceiver = {
    //       participants: get(m, [`_raw`, `participants`], []),
    //       message: get(m, [`_raw`, `message`], []),
    //       status: get(m, [`_raw`, `status`], []),
    //       SK: get(m, [`_raw`, `sk`], []),
    //       PK: get(m, [`_raw`, `pk`], []),
    //       files: get(m, [`_raw`, `files`], []),
    //       create_at: get(m, [`_raw`, `create_at`], []),
    //       room_id: get(m, [`_raw`, `room_id`], []),
    //       user_receiver: get(m, [`_raw`, `user_receiver`], []),
    //       user_sender: get(m, [`_raw`, `user_sender`], []),
    //       id_local: get(m, [`_raw`, `id_local`], []),
    //       id_message: get(m, [`_raw`, `id_message`], []),
    //       filesLocal: JSON.parse(get(m, [`_raw`, `files_local`], [])),
    //       flag_request: get(m, [`_raw`, `flag_request`], []),
    //       id_message_request: get(m, [`_raw`, `id_message_request`], []),
    //     };
    //     listMessageUnSendLocal.push(unsend);
    //   })

    //   this.setState({
    //     messagesUnsend: listMessageUnSendLocal,
    //   });
    // }

  };

  //handle load message when scroll to top from server
  addToStartFromAPI = async () => {
    const { infoRoom, wsStatus } = this.props;
    const { lastketAddtoStart } = this.state;
    const listMessUnRead: Array<string> = [];
    try {
      const respone = await apiGetChatIndivial(
        infoRoom.room_id.replace(/#/g, '%23'),
        condition_get_message_old_or_new_addToStart,
        lastketAddtoStart[lastketAddtoStart.length - 1].replace(/#/g, '%23'),
      );

      const resConvert: Array<IMessageReceiver> = JSON.parse(
        JSON.stringify(respone.data.data),
      );

      const rawMessages: any = [];
      for (const m of resConvert) {
        const messCheck = await ChatDBHelperInstance.getMessageLocalByIdMessageIndividual(
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
            is_group: false,
          };
          rawMessages.push(newMessage);
        }
      }
      if (rawMessages.length > 0) {
        const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(
          rawMessages,
        );
        await ChatDBHelperInstance.batchAction(newMessageRecord).then(record =>
          console.log('record', record),
        );
      }

      if (resConvert && resConvert.length > 0) {
        if (
          !lastketAddtoStart.includes(
            `${resConvert[0].room_id}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`,
          )
        ) {
          lastketAddtoStart.push(
            `${resConvert[0].room_id}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`,
          );
          let tmp = [...lastketAddtoStart];
          this.setState({ lastketAddtoStart: tmp });
          resConvert.map(m => {
            //update status message
            if (m.user_sender !== infoRoom.user_login && m.status !== 2) {
              listMessUnRead.push(m.id_message);
            }
          });
          if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
            wsStatus.send(
              JSON.stringify({
                id_messages: listMessUnRead,
                status_code: 2,
                room_id: infoRoom.room_id,
              }),
            );
          }
          this.setState(state => {
            return {
              messagesLocal: resConvert.concat(state.messagesLocal),
            };
          });
        }
      } else {
        if (lastketAddtoStart[lastketAddtoStart.length - 1] !== '') {
          this.setState({ loadingAddToStart: true });
        }
      }

      if (resConvert && resConvert.length < limitPaging) {
        this.setState({ loadingAddToStart: true });
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  //handle load message when scroll to top from db local
  addToStartFromLocal = async (
    roomLocal: RoomChatIndOp.RoomChatSchemaType & Realm.Object,
    indexLastkey: number,
  ) => {
    const { infoRoom, wsStatus } = this.props;
    const { lastketAddtoStart } = this.state;

    const listMessUnRead: Array<string> = [];
    const fromIndex = indexLastkey;
    const toIndex = fromIndex - limitPaging > 0 ? fromIndex - limitPaging : 0;
    if (indexLastkey < roomLocal.messages.length && fromIndex !== 0) {
      const resConvert: Array<IMessageReceiver> = roomLocal.messages.slice(
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
        this.setState({ lastketAddtoStart: tmp });
        const tmpResConvert = [...resConvert];
        // tmpResConvert.map(m => {
        //   //SignedUrl message
        //   if (m.files && m.files.length > 0) {
        //     m.files.map(f => {
        //       f.path_file = getSignedUrl(f.path_file);
        //       f.path_file_thumb = getSignedUrl(f.path_file_thumb);
        //     });
        //   }
        // });
        // if (wsStatus?.readyState === 1 && listMessUnRead.length > 0) {
        //   wsStatus.send(
        //     JSON.stringify({
        //       id_messages: listMessUnRead,
        //       status_code: 2,
        //       room_id: infoRoom.room_id
        //     }),
        //   );
        // }
        this.setState(state => {
          return {
            messagesLocal: tmpResConvert.concat(state.messagesLocal),
          };
        });
      }
    } else {
      this.setState({ loadingAddToStart: true });
    }
  };

  //handle load message when scroll to top
  addToStart = async () => {
    const { infoRoom, wsStatus } = this.props;
    const { lastketAddtoStart } = this.state;
    this.setState(
      {
        loadmore: true,
      },
      async () => {
        /**
         * callback when async function setState finish
         */
        if (lastketAddtoStart && lastketAddtoStart.length > 0) {
          // const realmOpen = await connectDB();
          // realmOpen.write(async () => {
          //   const roomLocal = realmOpen.objectForPrimaryKey<RoomChatSchemaType>(
          //     RoomChatIndOp.NAME_SCHEMA,
          //     infoRoom.room_id,
          //   );
          //   //check lastkey in db local
          //   //yes: load data from dblocal
          //   // if (roomLocal && roomLocal.messages.length > 0) {
          //   //   let indexLastkey = roomLocal.messages.findIndex(m =>
          //   //     lastketAddtoStart[lastketAddtoStart.length - 1].includes(
          //   //       m.id_message,
          //   //     ),
          //   //   );
          //   //   if (indexLastkey !== -1) {
          //   //     const checkDBLocal = indexLastkey - 1;
          //   //     if (checkDBLocal > 0) {
          //   //       //check if the message is consecutive or not
          //   //       if (roomLocal.messages[indexLastkey].id_message_request) {
          //   //         //load data from local
          //   //         if (
          //   //           roomLocal.messages[indexLastkey].id_message_request ===
          //   //           roomLocal.messages[checkDBLocal].id_message
          //   //         ) {
          //   //           await this.addToStartFromLocal(roomLocal, indexLastkey);
          //   //         } else {
          //   //           await this.addToStartFromAPI(realmOpen);
          //   //         }
          //   //       } else {
          //   //         //load data from local
          //   //         if (
          //   //           roomLocal.messages[checkDBLocal].id_message_request &&
          //   //           roomLocal.messages[checkDBLocal].id_message_request ===
          //   //             roomLocal.messages[indexLastkey].id_message
          //   //         ) {
          //   //           await this.addToStartFromLocal(roomLocal, indexLastkey);
          //   //         } else if (
          //   //           !roomLocal.messages[checkDBLocal].id_message_request
          //   //         ) {
          //   //           if (
          //   //             roomLocal.messages[indexLastkey].flag_request ===
          //   //             last_message
          //   //           ) {
          //   //             this.setState({loadingAddToStart: true});
          //   //           } else {
          //   //             await this.addToStartFromLocal(roomLocal, indexLastkey);
          //   //           }
          //   //         } else {
          //   //           await this.addToStartFromAPI(realmOpen);
          //   //         }
          //   //       }
          //   //     } else {
          //   //       await this.addToStartFromAPI(realmOpen);
          //   //     }
          //   //   } else {
          //   //     await this.addToStartFromAPI(realmOpen);
          //   //   }
          //   // } else {
          //   //   await this.addToStartFromAPI(realmOpen);
          //   // }
          // });
          await this.addToStartFromAPI();
        }
      },
    );
  };

  //handle load message when scroll to bottom from server
  addToEndFromAPI = async () => {
    console.log('addToEndFromAPI');
    const { infoRoom } = this.props;
    const { lastkeyAddtoEnd } = this.state;
    try {
      const respone = await apiGetChatIndivial(
        infoRoom.room_id.replace(/#/g, '%23'),
        condition_get_message_old_or_new_addToEnd,
        lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1].replace(/#/g, '%23'),
      );
      console.log("lastkeyAddtoEnd", lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1])
      const resConvert: Array<IMessageReceiver> = JSON.parse(
        JSON.stringify(respone.data.data),
      );
      if (resConvert && resConvert.length > 0) {
        if (
          !lastkeyAddtoEnd.includes(
            `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
            }%26${resConvert[resConvert.length - 1].PK}`,
          )
        ) {
          lastkeyAddtoEnd.push(
            `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
            }%26${resConvert[resConvert.length - 1].PK}`,
          );
          let tmp = [...lastkeyAddtoEnd];
          this.setState({ lastkeyAddtoEnd: tmp });

          this.setState(state => {
            return {
              messagesLocal: state.messagesLocal.concat(resConvert),
            };
          });
        }
      } else {
        if (lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1] !== '') {
          this.setState({ loadingEndToStart: false, messagesCurrent: [] });
        }
      }

      if (resConvert && resConvert.length < limitPaging) {
        this.setState({ loadingEndToStart: false, messagesCurrent: [] });
      }
    } catch (error) {
      console.log('error load to bottom', error);
    }
  };

  //handle load message when scroll to bottom from db local
  addToEndFromLocal = async (
    roomLocal: RoomChatIndOp.RoomChatSchemaType & Realm.Object,
    indexLastkey: number,
  ) => {
    const { infoRoom, wsStatus } = this.props;
    const { lastkeyAddtoEnd } = this.state;
    console.log('addToEndFromLocal');
    const listMessUnRead: Array<string> = [];
    const fromIndex =
      indexLastkey + 1 < roomLocal.messages.length
        ? indexLastkey + 1
        : roomLocal.messages.length;
    const toIndex =
      fromIndex + limitPaging + 1 < roomLocal.messages.length
        ? fromIndex + limitPaging + 1
        : roomLocal.messages.length;
    if (
      indexLastkey < roomLocal.messages.length &&
      fromIndex !== roomLocal.messages.length
    ) {
      const resConvert: Array<IMessageReceiver> = roomLocal.messages.slice(
        fromIndex,
        toIndex,
      );
      if (resConvert && resConvert.length > 0) {
        if (
          !lastkeyAddtoEnd.includes(
            `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
            }%26${resConvert[resConvert.length - 1].id_message}`,
          )
        ) {
          lastkeyAddtoEnd.push(
            `${resConvert[resConvert.length - 1].room_id}%26${resConvert[resConvert.length - 1].create_at
            }%26${resConvert[resConvert.length - 1].id_message}`,
          );
          let tmp = [...lastkeyAddtoEnd];
          this.setState({ lastkeyAddtoEnd: tmp });
          const tmpResConvert = [...resConvert];
          tmpResConvert.map(m => {
            //update status message
            if (m.user_sender !== infoRoom.user_login && m.status !== 2) {
              listMessUnRead.push(m.id_message);
            }
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
          //       id_messages: listMessUnRead,
          //       status_code: 2,
          //       room_id: infoRoom.room_id
          //     }),
          //   );
          // }
          this.setState(state => {
            return {
              messagesLocal: state.messagesLocal.concat(tmpResConvert),
            };
          });
        }
      } else {
        if (lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1] !== '') {
          this.setState({ loadingEndToStart: false, messagesCurrent: [] });
        }
      }
    }
  };

  //handle load message when scroll to bottom
  addToEnd = async () => {
    const { infoRoom, wsStatus } = this.props;
    const { lastkeyAddtoEnd, loadmoreAddToEnd, loadingEndToStart } = this.state;

    this.setState(
      {
        loadmoreAddToEnd: true,
      },
      async () => {

        if (
          lastkeyAddtoEnd &&
          lastkeyAddtoEnd.length > 0 &&
          loadingEndToStart
        ) {
          // const realmOpen = await connectDB();
          // realmOpen.write(async () => {
          //   const roomLocal = realmOpen.objectForPrimaryKey<RoomChatSchemaType>(
          //     RoomChatIndOp.NAME_SCHEMA,
          //     infoRoom.room_id,
          //   );
          //   //check lastkey in db local
          //   //yes: load data from dblocal
          //   if (roomLocal && roomLocal.messages.length > 0) {
          //     let indexLastkey = roomLocal.messages.findIndex(m =>
          //       lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1].includes(
          //         m.id_message,
          //       ),
          //     );
          //     if (indexLastkey !== -1) {
          //       const checkDBLocal = indexLastkey + 1;
          //       if (roomLocal.messages[checkDBLocal]) {
          //         if (roomLocal.messages[indexLastkey].id_message_request) {
          //           if (
          //             roomLocal.messages[indexLastkey].id_message_request ===
          //             roomLocal.messages[checkDBLocal].id_message
          //           ) {
          //             //load from local
          //             console.log('case 1');
          //             await this.addToEndFromLocal(roomLocal, indexLastkey);
          //           } else {
          //             console.log('case 2');
          //             await this.addToEndFromAPI(realmOpen);
          //           }
          //         } else {
          //           //load data from local
          //           if (
          //             roomLocal.messages[checkDBLocal].id_message_request &&
          //             roomLocal.messages[checkDBLocal].id_message_request ===
          //               roomLocal.messages[indexLastkey].id_message
          //           ) {
          //             //load from local
          //             console.log('case 3');
          //             await this.addToEndFromLocal(roomLocal, indexLastkey);
          //           } else if (
          //             !roomLocal.messages[checkDBLocal].id_message_request
          //           ) {
          //             //load from local
          //             console.log('case 4');
          //             await this.addToEndFromLocal(roomLocal, indexLastkey);
          //           } else {
          //             console.log(
          //               'roomLocal.messages[checkDBLocal].id_message_request',
          //               roomLocal.messages[checkDBLocal].id_message_request,
          //             );
          //             console.log(
          //               'roomLocal.messages[indexLastkey].id_message_request',
          //               roomLocal.messages[indexLastkey].id_message_request,
          //             );
          //             console.log(
          //               'roomLocal.messages[indexLastkey].id_message',
          //               roomLocal.messages[indexLastkey].id_message,
          //             );
          //             console.log('case 5');
          //             await this.addToEndFromAPI(realmOpen);
          //           }
          //         }
          //       } else {
          //         console.log('case 6');
          //         await this.addToEndFromAPI(realmOpen);
          //       }
          //     } else {
          //       console.log('case 7');
          //       await this.addToEndFromAPI(realmOpen);
          //     }
          //   } else {
          //     console.log('case 8');
          //     await this.addToEndFromAPI(realmOpen);
          //   }
          // });
          await this.addToEndFromAPI();
        }
      },
    );
  };

  //handle sroll message
  handleOnScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { loadmore, messagesLocal, loadmoreAddToEnd } = this.state;
    let bottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y;

    const heightContent = nativeEvent.contentSize.height - height * 0.1;
    if (
      nativeEvent.contentOffset.y <
      nativeEvent.layoutMeasurement.height + height * 0.7
    ) {
      if (!loadmore) {
        this.addToStart();
      }
    }

    if (bottom > heightContent && heightContent > 0) {
      if (messagesLocal.length > 0 && !loadmoreAddToEnd) {
        this.addToEnd();
      }
    }

    if (bottom < heightContent) {
      Animated.timing(this.fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  };

  addMessageReceiverToLocal = async (m: IMessageReceiver) => {
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
      is_group: false,
    };
    const newMessageRecord = ChatDBHelperInstance.prepareCreateMessageGroupChat(
      newMessage,
    );
    await ChatDBHelperInstance.batchAction([newMessageRecord]).then(record =>
      console.log('record', record),
    );
  };

  //update message when socket callback
  fetchMessageCurrent = async (receiverData: IMessageReceiver) => {
    const { messagesCurrent, messagesLocal, idMessageFirstData } = this.state;
    const { isGotoDataSearch, idMessageSearch } = this.props;

    await this.addMessageReceiverToLocal(receiverData);

    const tmp = [...messagesCurrent];
    let idx = tmp.findIndex(m => m.id_local == receiverData.id_local);
    if (idx !== -1) {
      tmp[idx] = { ...tmp[idx], ...receiverData };
    }
    // update message
    else {
      tmp.push(receiverData);
    }
    this.setState({ messagesCurrent: tmp });

    if (!isGotoDataSearch && idMessageSearch === '') {
      const checkLastMessageLocal = messagesLocal.findIndex(
        m => m.id_message === idMessageFirstData,
      );

      if (checkLastMessageLocal === -1 && messagesLocal.length > 0) {
        console.log('case sroll 1');
        this.setState(
          {
            loadingEndToStart: false,
            loadingAddToStart: false,
            messagesCurrent: [],
            messagesUnsend: [],
            messagesLocal: [],
            lastkeyAddtoEnd: [],
            lastketAddtoStart: [],
          },
          async () => {
            // await this.fetchData(this.props.infoRoom);
            await this.fetchDataFromLocal();
          },
        );
      } else {
        console.log('case sroll 2');
        setTimeout(() => {
          if (this.scrollRef && this.scrollRef.current) {
            this.scrollRef.current.scrollToEnd();
          }
        }, 500);
      }
    }
    // this.setState({idMessageFirstData: receiverData.id_message});
  };

  updateStatusLocal = async (m: string) => {
    const messageLocal = await ChatDBHelperInstance.getMessageLocalByIdMessage(
      m,
    );
    if (messageLocal && messageLocal.length > 0) {

      await ChatDBHelperInstance.prepareUpdateStatusMessageChatGroupIndividual(
        messageLocal,
        messageLocal[0]._raw.id,
      );
    }
  };

  //update status message when socket callback
  fetchUpdateStatus = async (arrMessageReaded: Array<string>) => {
    const { messagesCurrent, messagesLocal } = this.state;
    if (arrMessageReaded && arrMessageReaded.length > 0) {
      let checkUpdateStatusMessage = false;

      for (const m of arrMessageReaded) {
        let idx = messagesCurrent.findIndex(md => md.id_message == m);
        if (idx !== -1) {
          messagesCurrent[idx].status = 2;
        }

        let idxx = messagesLocal.findIndex(md => md.id_message == m);
        if (idxx !== -1) {
          checkUpdateStatusMessage = true;
          messagesLocal[idxx].status = 2;
        }
      }

      let tmp = [...messagesCurrent];
      this.setState({ messagesCurrent: tmp });
      if (checkUpdateStatusMessage) {
        this.setState(state => {
          return {
            messagesLocal: state.messagesLocal.concat([]),
          };
        });
      }

      for (const m of arrMessageReaded) {
        await this.updateStatusLocal(m);
      }
    }
  };

  //handle set message current and unsend when receipt or send message
  setmessageLocal = (
    list: Array<IMessageReceiver>,
    listUnsend: Array<IMessageReceiver>,
  ) => {
    const { infoRoom } = this.props;
    this.setState({
      messagesCurrent: [...list],
      messagesUnsend: [...listUnsend],
    });
    connectDB()
      .then(realm => {
        realm.write(() => {
          const roomLocal = realm.objectForPrimaryKey<RoomChatSchemaType>(
            RoomChatIndOp.NAME_SCHEMA,
            infoRoom.room_id,
          );
          if (roomLocal) roomLocal.messages_Unsend = [...listUnsend];
        });
      })
      .catch(error => console.log(error));
  };

  //handle resend message
  handleResendMessage = async (item: IMessageReceiver) => {
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
    const { infoRoom, connection, ws } = this.props;
    const { messagesCurrent, messagesUnsend } = this.state;

    if (item.id_message == 'local' && infoRoom && connection.isConnected) {
      if (ws.readyState === 1) {
        let dataSend: ImessageChat = {
          chat_room_id: infoRoom.room_id,
          message: item.message,
          user_sender: infoRoom.user_login,
          user_receiver: infoRoom.user_friend,
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
              //dataSend.files = arr;
              ws.send(JSON.stringify(dataSend));
              let idx_local_arr = messagesCurrent.findIndex(
                m => m.id_local == item.id_local,
              );
              if (idx_local_arr === -1) {
                let listCurrent = [...messagesCurrent];
                listCurrent.push(item);
                let listUnsend = [...messagesUnsend];
                let idxxx = listUnsend.findIndex(
                  m => m.id_local === item.id_local,
                );
                listUnsend.splice(idxxx, 1);
                this.setmessageLocal(listCurrent, listUnsend);
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
            let listUnsend = [...messagesUnsend];
            let idxxx = listUnsend.findIndex(m => m.id_local === item.id_local);
            listUnsend.splice(idxxx, 1);
            this.setmessageLocal(listCurrent, listUnsend);
            //
          }
        }
      } else if (ws.readyState === 3) {
        this.props.closeSocket(infoRoom.room_id);
        this.props.clearIntervalRoom(infoRoom.room_id);
      }
    }
  };

  //handle call api search message
  handleFetchDataWithKeyworkSearch = async (
    id_MessageSearch: string,
    createAt_MessageSearch: string,
    index: number,
  ) => {
    const { infoRoom } = this.props;

    this.setState(
      {
        messagesCurrent: [],
        messagesUnsend: [],
        messagesLocal: [],
        loadingEndToStart: true,
        isFirstGotoDataSearch: false,
        idMessgaeFooter: id_MessageSearch,
        indexMessgaeFooter: index,
        loadingAddToStart: false,
        lastketAddtoStart: [],
        lastkeyAddtoEnd: [],
      },
      async () => {
        try {

          const roomID = infoRoom.room_id.replace(/#/g, '%23');
          const allMessage = await ChatDBHelperInstance.getAllRecordIndividual();

          if (allMessage) {

            const idCheck = allMessage.findIndex(
              i => get(i, [`_raw`, `id_message`], '') === id_MessageSearch,
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
              const resConvert: Array<IMessageReceiver> = [];
              messeSearcg.map(m => {
                const messReceiver: IMessageReceiver = {
                  participants: JSON.parse(get(m, [`_raw`, `participants`], '')),
                  message: get(m, [`_raw`, `message`], ''),
                  status: get(m, [`_raw`, `status`], ''),
                  SK: get(m, [`_raw`, `sk`], ''),
                  PK: get(m, [`_raw`, `pk`], ''),
                  files: JSON.parse(get(m, [`_raw`, `files`], [])),
                  create_at: get(m, [`_raw`, `createAtFormat`], ''),
                  room_id: get(m, [`_raw`, `room_id`], ''),
                  user_receiver: get(m, [`_raw`, `user_receiver`], ''),
                  user_sender: get(m, [`_raw`, `user_sender`], ''),
                  id_message: get(m, [`_raw`, `id_message`], ''),
                  filesLocal: [],
                  flag_request: get(m, [`_raw`, `flag_request`], ''),
                  id_message_request: get(m, [`_raw`, `id_message_request`], ''),
                };
                resConvert.push(messReceiver);
              });
              const lastkeyNew = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`;
              const tmp = [];
              tmp.push(lastkeyNew);

              const lastkeyNewAddtoEnd = `${roomID}%26${resConvert[resConvert.length - 1].create_at
                }%26${resConvert[resConvert.length - 1].id_message}`;
              const tmpEnd = [];
              tmpEnd.push(lastkeyNewAddtoEnd);
              const tmpResConvert = [...resConvert];
              this.setState({ messagesLocal: tmpResConvert })
              this.setState({ lastketAddtoStart: tmp });
              this.setState({ lastkeyAddtoEnd: tmpEnd })
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
    );
  };

  // handle arrow up when click up down in search message
  handleArrowUpSearchMessage = (
    idmessage: string,
    create_at: string,
    index: number,
  ) => {
    this.setState({
      isFirstGotoDataSearch: false,
    });
    this.handleFetchDataWithKeyworkSearch(idmessage, create_at, index);
  };

  //handle set First Call GotoSearchMessage
  setisFirstCallGotoSearchMessage = (isFirstGotoDataSearch: boolean) => {
    this.setState({ isFirstGotoDataSearch: isFirstGotoDataSearch });
  };

  fetchDataFromLocal = async () => {
    const { lastketAddtoStart } = this.state;
    const { infoRoom } = this.props;
    const roomID = infoRoom.room_id.replace(/#/g, '%23');
    const allMessage = await ChatDBHelperInstance.getAllRecordIndividual();

    if (allMessage) {
      const toIndex = allMessage.length;
      const fromIndex = toIndex - limitPaging > 0 ? toIndex - limitPaging : 0;
      const messeSearcg = allMessage.slice(fromIndex, toIndex);
      const resConvert: Array<IMessageReceiver> = [];
      messeSearcg.map(m => {
        const messReceiver: IMessageReceiver = {
          participants: JSON.parse(get(m, [`_raw`, `participants`], [])),
          message: get(m, [`_raw`, `message`], ''),
          status: get(m, [`_raw`, `status`], ''),
          SK: get(m, [`_raw`, `sk`], ''),
          PK: get(m, [`_raw`, `pk`], ''),
          files: JSON.parse(get(m, [`_raw`, `files`], [])),
          create_at: get(m, [`_raw`, `createAtFormat`], ''),
          room_id: get(m, [`_raw`, `room_id`], ''),
          user_receiver: get(m, [`_raw`, `user_receiver`], ''),
          user_sender: get(m, [`_raw`, `user_sender`], ''),
          id_message: get(m, [`_raw`, `id_message`], ''),
          filesLocal: [],
          flag_request: get(m, [`_raw`, `flag_request`], ''),
          id_message_request: get(m, [`_raw`, `id_message_request`], ''),
        };
        resConvert.push(messReceiver);
      });
      const lastkey = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].PK}`;
      lastketAddtoStart.push(lastkey);
      let tmp = [...lastketAddtoStart];
      this.setState({
        lastketAddtoStart: tmp,
        idMessageFirstData: resConvert[resConvert.length - 1].id_message,
      });

      this.setState({ messagesLocal: resConvert });
      setTimeout(() => {
        if (this.scrollRef && this.scrollRef.current) {
          this.scrollRef.current.scrollToEnd();
        }
      }, 500);
      if (resConvert.length < 20) {
        this.setState({ loadingAddToStart: true });
      }
    }
  };

  // handle sroll to end when click button SrollToEnd
  handleSrollToEnd = async () => {
    const { messagesLocal, idMessageFirstData } = this.state;
    const checkLastMessage = messagesLocal.findIndex(
      m => m.id_message === idMessageFirstData,
    );

    if (checkLastMessage === -1) {
      this.setState(
        {
          loadingEndToStart: false,
          loadingAddToStart: false,
          messagesCurrent: [],
          messagesUnsend: [],
          messagesLocal: [],
          lastkeyAddtoEnd: [],
          lastketAddtoStart: [],
        },
        async () => {
          await this.fetchDataFromLocal();
          // await this.fetchData(this.props.infoRoom);
        },
      );
    } else {
      this.scrollRef.current.scrollToEnd();
    }
  };

  /**
   *  life cycle run after component render
   */
  componentDidMount() {
    const { infoRoom, ws, wsStatus } = this.props;

    /**
     * function run when socket open
     */
    ws.onopen = () => {
      console.log('ws.onopen');
    };

    wsStatus.onopen = () => {
      console.log('wsStatus.onopen');
    };

    /**
     * function run when socket callback
     */
    ws.onmessage = (e: any) => {
      let dataUpdate: IMessageReceiver = JSON.parse(e.data);
      console.log('ws.onmessage', dataUpdate);

      if (infoRoom) {
        if (wsStatus?.readyState === 1 &&
          dataUpdate.user_sender !== infoRoom.user_login) {
          wsStatus.send(
            JSON.stringify({
              id_messages: [dataUpdate.id_message],
              status_code: 2,
              room_id: infoRoom.room_id,
            }),
          );
        }
      }
      /**
       * fetch message , update message current
       */
      this.fetchMessageCurrent(dataUpdate);
      // }
    };

    /**
     * socket update status messages when readed by user friend
     */
    wsStatus.onmessage = (e: any) => {
      let res = JSON.parse(e.data);
      if (infoRoom) this.fetchUpdateStatus(res.id_messages);
    };

    if (infoRoom) {
      //get message from room chat cache
      this.fetchDataCache(infoRoom);
      this.fetchData(infoRoom);
    }
  }

  /**
   * life cycle run before component unmount
   */
  async componentWillUnmount() {
    this.isUnmount = true;
    const { infoRoom, connection, ws } = this.props;
    const { messagesCurrent } = this.state;
    if (infoRoom) {
      let arrMessagesSending = messagesCurrent.filter(
        m => m.create_at == '' && m.id_message == 'local' && m.status !== -1,
      );
      if (arrMessagesSending.length > 0 && connection.isConnected) {
        this.props.setIntervalRoom(
          infoRoom.room_id,
          setInterval(() => {
            let arr = messagesCurrent.filter(
              m =>
                m.create_at == '' && m.id_message == 'local' && m.status !== -1,
            );
            let isUnmount = this.isUnmount;
            if (!isUnmount) {
              this.props.clearIntervalRoom(infoRoom.room_id);
            }
            /**
             * cancel socket ws.onclose
             */
            ws.onclose = () => {
              // console.log('cancel socket ws.onclose ');
              this.props.clearIntervalRoom(infoRoom.room_id);
            };
            /**
             * cancel socket no connect internet
             */
            NetInfo.fetch().then(state => {
              if (!state.isConnected) {
                console.log('cancel socket no connect internet ');
                this.props.clearIntervalRoom(infoRoom.room_id);
              }
            });
            /**
             * cancel when all messages sended
             */
            if (arr && arr.length == 0) {
              console.log('cancel when all messages sended ');
              this.props.closeSocket(infoRoom.room_id);
              this.props.clearIntervalRoom(infoRoom.room_id);
            }
          }, 1500),
        );
      } else {
        console.log('else');
        this.props.closeSocket(infoRoom.room_id);
      }
    }
  }

  //handle search message when props change
  componentDidUpdate(prevProps: Props) {
    if (prevProps.idMessageSearch !== this.props.idMessageSearch) {
      //go to data search message
      if (this.props.isGotoDataSearch && this.props.keywork !== '') {
        this.handleFetchDataWithKeyworkSearch(
          this.props.idMessageSearch,
          this.props.createMessageSearch,
          this.props.indexItemSelected,
        );
      }

      if (this.props.keywork === '') {
        this.setState({
          isFirstGotoDataSearch: false,
          indexMessgaeFooter: 0,
        });
      }
    }
  }

  async handleDeleteMessage(idMessage: string, fileName: string) {
    Alert.alert(
      '',
      fileName
        ? `「${fileName}」を削除してもよろしいですか？`
        : '選択されたメッセージを削除してもよろしいですか？',
      [
        {
          text: Messages.COMMON.BUTTON.CANCEL,
        },
        {
          text: Messages.COMMON.BUTTON.CONFIRM,
          onPress: async () => {
            this.state.modalLoadingRef.open();
            await apiDeleteMessage(
              idMessage,
              get(this.props, 'infoRoom.room_id', ''),
            )
              .then(async res => {
                const data: {
                  id_message: string;
                  is_delete: boolean;
                } = JSON.parse(JSON.stringify(res.data));
                if (data && data.id_message && data.is_delete) {
                  const messagesLocalTemp = [...this.state.messagesLocal];
                  const messagesCurrentTemp = [...this.state.messagesCurrent];
                  this.setState({
                    messagesCurrent: messagesCurrentTemp.filter(item => item.id_message !== idMessage),
                    messagesLocal: messagesLocalTemp.filter(item => item.id_message !== idMessage),
                  });

                  await ChatDBHelperInstance.deleteMessage(this.props.infoRoom.room_id, idMessage);
                }
              })
              .catch(err => {
                // this.state.modalLoadingRef.close();
                let payload: IToast = {
                  isShow: true,
                  title: Messages.COMMON.MSG_COMMON_ERROR_001,
                  type: TypeToash.ERROR,
                  message: `${err}`,
                };
                this.props.toast(payload);
              });
            setTimeout(() => {
              this.state.modalLoadingRef.close();
            }, 1000);
          },
        },
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
      ],
    );
  }

  render() {
    this.isUnmount = false;
    const {
      loadmore,
      loadingAddToStart,
      messagesLocal,
      messagesCurrent,
      messagesUnsend,
      cacheDataMessage,
      idMessgaeFooter,
      isFirstGotoDataSearch,
      loadingEndToStart,
      loadmoreAddToEnd,
      indexMessgaeFooter,
    } = this.state;
    const {
      infoRoom,
      connection,
      navigation,
      ws,
      keywork,
      dataMessageSearch,
      keyworkFullwidth,
      keyworkHalfwidth,
      isOpentSearchMessage
    } = this.props;
    return (
      <ChannelContext.Provider
        value={{ handleDeleteMessage: this.handleDeleteMessage }}>
        <ScrollView
          ref={this.scrollRef}
          maintainVisibleContentPosition={{
            minIndexForVisible: 1,
          }}
          style={{ paddingTop: 10 }}
          onContentSizeChange={() => {
            if (loadmore) {
              setTimeout(() => this.setState({ loadmore: false }), 1000);
            }

            if (loadmoreAddToEnd) {
              setTimeout(() => this.setState({ loadmoreAddToEnd: false }), 1000);
            }
          }}
          scrollEventThrottle={16}
          onScroll={this.handleOnScroll}
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

          <MessagesFromLocal
            messageLocalDB={messagesLocal}
            infoRoom={infoRoom}
            connection={connection}
            date={this.date}
            scrollRef={this.scrollRef}
            keyword={keywork}
            keyworkFullwidth={keyworkFullwidth}
            keyworkHalfwidth={keyworkHalfwidth}
            idmessage={idMessgaeFooter}
            isFirstGotoDataSearch={isFirstGotoDataSearch}
            setisFirstCallGotoSearchMessage={
              this.setisFirstCallGotoSearchMessage
            }
          />
          <MessagesCurrent
            messagesCurrent={messagesCurrent}
            infoRoom={infoRoom}
            connection={connection}
            loadingEndToStart={loadingEndToStart}
          />
          <MessagesUnsend
            messagesUnsend={messagesUnsend}
            infoRoom={infoRoom}
            connection={connection}
            handleResendMessageMessage={this.handleResendMessage}
          />
          <View
            style={{
              height: loadingEndToStart && messagesLocal.length > 0 ? 40 : 0,
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              display:
                loadingEndToStart && messagesLocal.length > 0 ? 'flex' : 'none',
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
              this.handleSrollToEnd();
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
                  opacity: this.fadeAnim,
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
              keywork={keywork}
              idmessage={idMessgaeFooter}
              indexItemSelected={indexMessgaeFooter}
              dataMessageSearch={dataMessageSearch}
              handleArrowUpDownSearchMessage={this.handleArrowUpSearchMessage}
            />
          ) : (
            <InputAction
              navigation={navigation}
              setMessageCurrent={this.setmessageLocal}
              listMessageCurrent={messagesCurrent}
              listMessageUnsend={messagesUnsend}
              cacheDataMessage={cacheDataMessage}
              ws={ws}
              infoRoom={infoRoom}
              refScrollView={this.scrollRef}
              connection={connection}
            />
          )}
          {/* <InputAction
            navigation={navigation}
            setMessageCurrent={this.setmessageLocal}
            listMessageCurrent={messagesCurrent}
            listMessageUnsend={messagesUnsend}
            cacheDataMessage={cacheDataMessage}
            ws={ws}
            infoRoom={infoRoom}
            refScrollView={this.scrollRef}
            connection={connection}
          /> */}
        </View>
        <ModalLoading
          setRef={ref => {
            this.setState({ modalLoadingRef: ref });
          }}
        />
      </ChannelContext.Provider>
    );
  }
}

export default connector(ChannelMessages);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
});
