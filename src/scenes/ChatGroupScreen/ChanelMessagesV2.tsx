import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetInfoStateType } from '@react-native-community/netinfo';
import { ScrollView } from '@stream-io/flat-list-mvcp';
import { AxiosResponse } from 'axios';
import { get } from 'lodash';
import React, { createRef, PureComponent } from 'react';
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
import { connect, ConnectedProps } from 'react-redux';
import { ButtonIcon } from '../../components/buttons';
import InputAction from '../../components/common/InputAction/inputChatGroup';
import ModalLoading, {
  IModalData
} from '../../components/common/LoadingCircle/modalLoading';
import FooterSearch from '../../components/common/SearchMessage/FooterSearch';
import Messages from '../../config/Messages';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import { ChannelContext } from '../../hooks/chat';
import {
  FileUpload,
  IChat,
  IChatResutlMessageSearch,
  ImessageChatGroup,
  IMessageGroupChatReceiver,
  IMessageUpdateStatusChatGroup,
  Participant
} from '../../models/chat';
import { IToast, TypeToash } from '../../models/common';
import { apiDeleteMessage, apiGetChatGroupByRoomID } from '../../services/chat';
import { apiUploadFile, OBJECT_TYPE } from '../../services/file';
import { AppDispatch, RootState } from '../../stories';
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
// const prefixGroup = 'CR%23GROUP%23';
// const prefixGroupAPI = 'CR#GROUP#';

// const prefixCS = 'CS%23';
// const prefixCSAPI = 'CS#';

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
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
  isGroup: number;
};

type State = {
  messages: Array<IMessageGroupChatReceiver>;
  messagesCurrent: Array<IMessageGroupChatReceiver>;
  messagesUnSend: Array<IMessageGroupChatReceiver>;
  cacheMessages: IMessageGroupChatReceiver | null;

  lastkeyAddtoStart: Array<string>;
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
  messagesSendReaded: Array<IMessageUpdateStatusChatGroup>;
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
    closeSocket: (room_id: string) =>
      dispatch(createAction(groupchat.CLOSE_SOCKET, { room_id })),
    toast: (payload: IToast) =>
      dispatch(createAction(modal.SET_TOASH, payload)),
  };
};
const connector = connect(mapStateToProps, mapDispatchToProps);

class ChanelMessagesV2 extends PureComponent<
  Props & ConnectedProps<typeof connector>,
  State
> {
  fadeAnim: Animated.Value;
  scrollRef: React.MutableRefObject<any>;
  mounted: boolean;
  date: string;
  prefixGroup: string;
  prefixGroupAPI: string;

  constructor(props: Props & ConnectedProps<typeof connector>) {
    super(props);
    this.state = {
      messages: [],
      messagesCurrent: [],
      messagesUnSend: [],
      lastkeyAddtoStart: [],
      lastkeyAddtoEnd: [],
      cacheMessages: null,
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
      messagesSendReaded: [],
      modalLoadingRef: { open: () => undefined, close: () => undefined },
    };
    this.fadeAnim = new Animated.Value(0);
    this.scrollRef = createRef<ScrollView | any>();
    this.mounted = false;
    this.date = '';
    this.prefixGroup = this.props.isGroup === 1 ? 'CR%23GROUP%23' : 'CS%23';
    this.prefixGroupAPI = this.props.isGroup === 1 ? 'CR#GROUP#' : 'CS#';

    this.handleOnScroll = this.handleOnScroll.bind(this);
    this.handleDeleteMessage = this.handleDeleteMessage.bind(this);
    this.setisFirstCallGotoSearchMessage = this.setisFirstCallGotoSearchMessage.bind(
      this,
    );
  }

  //get message when scroll to top
  addToStart = () => {
    const { infoRoom, wsStatus } = this.props;
    const { lastkeyAddtoStart, loadingAddToStart } = this.state;
    const roomID = `${this.prefixGroup}${infoRoom.room_id}`;

    this.setState(
      {
        loadmore: true,
      },
      async () => {
        if (
          lastkeyAddtoStart &&
          lastkeyAddtoStart.length > 0 &&
          !loadingAddToStart
        ) {
          console.log(
            'load data to api',
            lastkeyAddtoStart[lastkeyAddtoStart.length - 1],
          );
          const listMessUnRead: Array<string> = [];
          const respone = await apiGetChatGroupByRoomID(
            roomID,
            condition_get_message_old_or_new_addToStart,
            lastkeyAddtoStart[lastkeyAddtoStart.length - 1],
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
          const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(
            listInsertToLocal,
          );
          await ChatDBHelperInstance.batchAction(
            newMessageRecord,
          ).then(record =>
            console.log('add new message with sroll to bottom', record),
          );

          if (resConvert && resConvert.length > 0) {
            if (
              !lastkeyAddtoStart.includes(
                `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].PK}`,
              )
            ) {
              lastkeyAddtoStart.push(
                `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].PK}`,
              );
              let tmp = [...lastkeyAddtoStart];
              this.setState({ lastkeyAddtoStart: tmp });
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
                    room_id: `${this.prefixGroupAPI}${infoRoom.room_id}`,
                  }),
                );
              }
              this.setState(state => {
                return {
                  messages: resConvert.concat(state.messages),
                };
              });
            }
          } else {
            if (lastkeyAddtoStart[lastkeyAddtoStart.length - 1] !== '') {
              this.setState({ loadingAddToStart: true });
            }
          }

          if (resConvert && resConvert.length < limitPaging) {
            this.setState({ loadingAddToStart: true });
          }
        }
      },
    );
  };

  //get message when scroll to bottom
  addToEnd = () => {
    this.setState(
      {
        loadmoreAddToEnd: true,
      },
      async () => {
        const { infoRoom, wsStatus } = this.props;
        const { lastkeyAddtoEnd, loadingEndToStart } = this.state;

        if (
          lastkeyAddtoEnd &&
          lastkeyAddtoEnd.length > 0 &&
          loadingEndToStart
        ) {
          try {
            const roomID = `${this.prefixGroup}${infoRoom.room_id}`;
            const respone = await apiGetChatGroupByRoomID(
              roomID,
              condition_get_message_old_or_new_addToEnd,
              lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1],
            );
            console.log("lastkeyAddtoEnd", lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1])
            const resConvert: Array<IMessageGroupChatReceiver> = JSON.parse(
              JSON.stringify(respone.data.data),
            );

            if (resConvert && resConvert.length > 0) {
              if (
                !lastkeyAddtoEnd.includes(
                  `${roomID}%26${resConvert[resConvert.length - 1].create_at
                  }%26${resConvert[resConvert.length - 1].PK}`,
                )
              ) {
                lastkeyAddtoEnd.push(
                  `${roomID}%26${resConvert[resConvert.length - 1].create_at
                  }%26${resConvert[resConvert.length - 1].PK}`,
                );
                let tmp = [...lastkeyAddtoEnd];
                this.setState({ lastkeyAddtoEnd: tmp });

                this.setState(state => {
                  return {
                    messages: state.messages.concat(resConvert),
                  };
                });
              }
            } else {
              if (lastkeyAddtoEnd[lastkeyAddtoEnd.length - 1] !== '') {
                this.setState({
                  messagesCurrent: [],
                  loadingEndToStart: false,
                });
              }
            }

            if (resConvert && resConvert.length < limitPaging) {
              this.setState({
                messagesCurrent: [],
                loadingEndToStart: false,
              });
            }
          } catch (error) {
            console.log('error', error);
          }
        }
      },
    );
  };

  //handle scroll message
  handleOnScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { loadmore, messages, loadmoreAddToEnd } = this.state;
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
      if (messages.length > 0 && !loadmoreAddToEnd) {
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

  //handle delete message
  async handleDeleteMessage(idMessage: string, fileName: string) {
    const { infoRoom } = this.props;
    const roomIDPrefix = `${this.prefixGroupAPI}${infoRoom.room_id}`;
    const { messages, messagesCurrent } = this.state;

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
            await apiDeleteMessage(idMessage, roomIDPrefix)
              .then(async res => {
                const data: {
                  id_message: string;
                  is_delete: boolean;
                } = JSON.parse(JSON.stringify(res.data));
                if (data && data.id_message && data.is_delete) {
                  const messagesLocalTemp = [...messages];
                  const messagesCurrentTemp = [...messagesCurrent];
                  this.setState({
                    messages: messagesLocalTemp.filter(item => item.id_message !== idMessage),
                    messagesCurrent: messagesCurrentTemp.filter(item => item.id_message !== idMessage),
                  });
                  await ChatDBHelperInstance.deleteMessage(roomIDPrefix, idMessage);

                }
              })
              .catch(err => {
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
            }, 500);
          },
        },
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
      ],
    );
  }

  //handle set First Call GotoSearchMessage
  setisFirstCallGotoSearchMessage = (isFirstGotoDataSearch: boolean) => {
    this.setState({ isFirstGotoDataSearch });
  };

  handleUploadFile = async ({
    room_id = '',
    arrFiles = [],
    callBack = () => undefined,
    errorCallBack = () => undefined,
  }: {
    room_id: string;
    arrFiles: Array<{ uri: string; name: string; type: string }>;
    callBack: (res: AxiosResponse<any>) => void;
    errorCallBack?: () => void;
  }) => {
    let data = new FormData();
    if (arrFiles.length > 0) {
      data.append('object_type', OBJECT_TYPE.ROOM_CHAT);
      data.append('object_id', room_id);
      arrFiles.map((file, index) => {
        data.append('file', file);
      });
    }
    console.log('data', data);

    await apiUploadFile(data)
      .then(callBack)
      .catch(error => {
        console.log('error', error);
        errorCallBack();
      })
      .finally(() => { });
  };

  /**
   *  handle resend message when not connect internet
   */
  handleResendMessage = async (item: IMessageGroupChatReceiver) => {
    const { infoRoom, ws, connection } = this.props;
    const { messagesCurrent, messagesUnSend } = this.state;
    let key = new Date().getTime();
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
          let arr = item.filesLocal.map(item1 => {
            const uri = get(item1, 'img.node.image.uri', '');
            return {
              uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
              name: get(item1, 'img.node.image.filename', ''),
              // name: undefined,
              type: get(item1, 'img.node.type', ''),
            };
          });
          const successCallback = (res: AxiosResponse<any>) => {
            const data: FileUpload = JSON.parse(JSON.stringify(res.data));
            const fileName = data.path_file.replace('images/', '');
            let dataSend: ImessageChatGroup = {
              chat_room_id: item.room_id,
              message: item.message,
              user_sender: String(infoRoom.user_login),
              files: [
                {
                  file_name: fileName,
                  link_url: data.link_url_file,
                  path: data.path_file,
                  payload: null,
                },
              ],
              id_local: 'local_' + key,
            };

            if (ws.readyState === 1) {
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
                this.setMessageCurrent(listCurrent, listUnsend);
              }
            }
          };

          const failCallback = () => {
            this.props.closeSocket(item.room_id);
          };

          this.handleUploadFile({
            room_id: item.room_id,
            arrFiles: arr,
            callBack: successCallback,
            errorCallBack: failCallback,
          });
        } else {
          ws.send(JSON.stringify(dataSend));
          let idx_local_arr = messagesCurrent.findIndex(
            m => m.id_local == item.id_local,
          );
          if (idx_local_arr === -1) {
            let listCurrent = [...messagesCurrent];
            listCurrent.push(item);
            let listUnsend = [...messagesUnSend];
            let idxxx = listUnsend.findIndex(m => m.id_local === item.id_local);
            listUnsend.splice(idxxx, 1);
            this.setMessageCurrent(listCurrent, listUnsend);
            //
          }
        }
      } else if (ws.readyState === 3) {
        this.props.closeSocket(infoRoom.room_id);
      }
    }
  };

  fetchDataFromLocal = async () => {
    const { infoRoom } = this.props;
    const { lastkeyAddtoStart } = this.state;
    const roomID = `${this.prefixGroup}${infoRoom.room_id}`;
    const allMessage = await ChatDBHelperInstance.getAllRecordBySchema();

    if (allMessage) {
      const toIndex = allMessage.length - 1;
      const fromIndex = toIndex - limitPaging > 0 ? toIndex - limitPaging : 0;
      const messFirst = allMessage.slice(fromIndex, toIndex);
      const resConvert: Array<IMessageGroupChatReceiver> = [];

      messFirst.map(messageCache => {
        const messReceiver: IMessageGroupChatReceiver = {
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
          isUnsend: get(messageCache, [0, `_raw`, `isUnsend`], []),
          isLocal: get(messageCache, [0, `_raw`, `isLocal`], []),
          isCache: get(messageCache, [0, `_raw`, `isCache`], []),
          id_local: get(messageCache, [0, `_raw`, `id_local`], []),
          id_message: get(messageCache, [0, `_raw`, `id_message`], []),
          filesLocal: JSON.parse(
            get(messageCache, [0, `_raw`, `files_local`], []),
          ),
          flag_request: get(messageCache, [0, `_raw`, `flag_request`], []),
          id_message_request: get(
            messageCache,
            [0, `_raw`, `id_message_request`],
            [],
          ),
          is_group: get(messageCache, [0, `_raw`, `is_group`], []),
        };
        resConvert.push(messReceiver);
      });
      const lastkey = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`;
      lastkeyAddtoStart.push(`${lastkey}`);
      let tmp = [...lastkeyAddtoStart];

      this.setState({
        lastkeyAddtoStart: tmp,
        idMessageFirstData: resConvert[resConvert.length - 1].id_message,
        messages: resConvert
      })
      setTimeout(() => {
        if (this.scrollRef && this.scrollRef.current) {
          this.scrollRef.current.scrollToEnd();
        }
      }, 500);
      if (resConvert.length < 20) {
        this.setState({ loadingAddToStart: true })
      }
    }
  }

  handleSrollToEnd = () => {

    const { messages, idMessageFirstData } = this.state;
    const checkLastMessage = messages.findIndex(
      m => m.id_message === idMessageFirstData,
    );

    if (checkLastMessage === -1) {
      this.setState(
        {
          loadingEndToStart: false,
          loadingAddToStart: false,
          messagesCurrent: [],
          messagesUnSend: [],
          messages: [],
          lastkeyAddtoEnd: [],
          lastkeyAddtoStart: [],
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

  //handle Fetch Data With Keywork Search
  handleFetchDataWithKeyworkSearch = async (
    id_MessageSearch: string,
    createAt_MessageSearch: string,
    index: number,
  ) => {
    const { infoRoom } = this.props;

    this.setState(
      {
        loadingEndToStart: true,
        isFirstGotoDataSearch: false,
        idMessgaeFooter: id_MessageSearch,
        indexMessgaeFooter: index,
        loadingAddToStart: false,
        lastkeyAddtoStart: [],
        lastkeyAddtoEnd: [],
        messagesCurrent: [],
        messagesUnSend: [],
        messages: [],
      },
      async () => {
        try {
          const roomID = `${this.prefixGroup}${infoRoom.room_id}`;
          const allMessage = await ChatDBHelperInstance.getAllRecordBySchema();
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

              const resConvert: Array<IMessageGroupChatReceiver> = [];
              messeSearcg.map(m => {
                const messReceiver: IMessageGroupChatReceiver = {
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
                  isUnsend: get(m, [`_raw`, `isUnsend`], ''),
                  isLocal: get(m, [`_raw`, `isLocal`], ''),
                  isCache: get(m, [`_raw`, `isCache`], ''),
                  id_message: get(m, [`_raw`, `id_message`], ''),
                  filesLocal: [],
                  flag_request: get(m, [`_raw`, `flag_request`], ''),
                  id_message_request: get(m, [`_raw`, `id_message_request`], ''),
                  is_group: get(m, [`_raw`, `is_group`], ''),
                };
                resConvert.push(messReceiver);
              });
              const lastkeyNew = `${roomID}%26${resConvert[0].create_at}%26${resConvert[0].id_message}`;
              const tmp = [];
              tmp.push(lastkeyNew);
              this.setState({ lastkeyAddtoStart: tmp });
              const lastkeyNewAddtoEnd = `${roomID}%26${resConvert[resConvert.length - 1].create_at
                }%26${resConvert[resConvert.length - 1].id_message}`;
              const tmpEnd = [];
              tmpEnd.push(lastkeyNewAddtoEnd);
              this.setState({ lastkeyAddtoEnd: tmpEnd })
              const tmpResConvert = [...resConvert];
              this.setState({ messages: tmpResConvert })

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
    this.setState({ isFirstGotoDataSearch: false }, () => {
      this.handleFetchDataWithKeyworkSearch(idmessage, create_at, index);
    });
  };

  //
  setMessageCurrent = (
    list: Array<IMessageGroupChatReceiver>,
    listUnsend: Array<IMessageGroupChatReceiver>,
  ) => {
    this.setState({
      messagesCurrent: [...list],
      messagesUnSend: [...listUnsend],
    });
  };

  //handle save mouted component
  storeDataIsMouted = async (mouted: string) => {
    try {
      await AsyncStorage.setItem('@moutedChatDetail', mouted);
    } catch (e) {
      // saving error
    }
  };

  //add message to db local
  addMessageToLocal = async (m: IMessageGroupChatReceiver) => {
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

  //update message current and add to local
  fetchCurrent = async (receiverData: IMessageGroupChatReceiver) => {
    const { messagesCurrent, messages, idMessageFirstData } = this.state;
    const { isGotoDataSearch, idMessageSearch } = this.props;
    let temp = [...messagesCurrent];
    let checkUpdateParticipantssMessage = false;

    await this.addMessageToLocal(receiverData);

    if (!receiverData.message.includes('SpecialMessage:')) {
      let idx = temp.findIndex(m => m.id_local == receiverData.id_local);
      if (idx !== -1) {
        console.log('case 1');
        temp[idx] = { ...temp[idx], ...receiverData };
      }
      // update message
      else {
        console.log('case 2');
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

    this.setState({ messagesCurrent: temp });

    if (checkUpdateParticipantssMessage) {
      this.setState(state => {
        return {
          messages: state.messages.concat([]),
        };
      });
    }

    if (!isGotoDataSearch && idMessageSearch === '') {
      const checkLastMessageLocal = messages.findIndex(
        m => m.id_message === idMessageFirstData,
      );
      console.log('checkLastMessageLocal', checkLastMessageLocal);
      if (checkLastMessageLocal === -1) {
        this.setState({
          loadingEndToStart: false,
          loadingAddToStart: false,
          messages: [],
          messagesUnSend: [],
          messagesCurrent: [],
          lastkeyAddtoStart: [],
          lastkeyAddtoEnd: [],
        });

        //await fetchDataFromLocal();
      } else {
        setTimeout(() => {
          if (this.scrollRef && this.scrollRef.current) {
            this.scrollRef.current.scrollToEnd();
          }
        }, 500);
      }
    }
  };

  updateStatusLocal = async (m: IMessageUpdateStatusChatGroup) => {
    const messageLocal = await ChatDBHelperInstance.getMessageLocalByIdMessage(
      m.id_message,
    );
    if (messageLocal && messageLocal.length > 0) {
      const participant: Array<Participant> = JSON.parse(
        get(messageLocal, [0, `_raw`, `participants`], []),
      );
      m.participants_code_status.map(codeStatus => {
        const updateStatus = participant.findIndex(
          par => par.user_id === codeStatus,
        );
        participant[updateStatus].code_status = 2;
      });
      let dataLocal = {
        message: get(messageLocal, [0, `_raw`, `message`], []),
        filesLocal: get(messageLocal, [0, `_raw`, `filesLocal`], []),
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

  //update status message
  fetchUpdateStatus = async (
    arrMessageReaded: Array<IMessageUpdateStatusChatGroup>,
  ) => {
    const { messagesCurrent, messages } = this.state;
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
      }

      let tmp = [...messagesCurrent];
      this.setState({ messagesCurrent: tmp });
      if (checkUpdateStatusMessage) {
        this.setState(state => {
          return {
            messages: state.messages.concat([]),
          };
        });
      }
      for (const m of arrMessageReaded) {
        await this.updateStatusLocal(m);
      }
    }
  };

  //handle socket message
  handleSocket = () => {
    const { infoRoom, ws, wsStatus } = this.props;

    ws.onopen = () => {
      console.log('ws.onopen');
    };

    wsStatus.onopen = () => {
      console.log('wsStatus.onopen');
    };

    ws.onmessage = (e: any) => {
      let dataUpdate: IMessageGroupChatReceiver = JSON.parse(e.data);
      const MessClone: IMessageGroupChatReceiver = JSON.parse(
        JSON.stringify(dataUpdate),
      );
      if (infoRoom && this.mounted) {
        if (
          wsStatus?.readyState === 1 &&
          dataUpdate.user_sender !== infoRoom.user_login
        ) {
          wsStatus.send(
            JSON.stringify({
              ids_message: [dataUpdate.id_message],
              id_user_login: infoRoom.user_login,
              code_status: 2,
              room_id: `${this.prefixGroupAPI}${infoRoom.room_id}`,
            }),
          );
        }
        //case add new user
        this.fetchCurrent(MessClone);
      }
    };

    wsStatus.onmessage = (e: any) => {
      let res = JSON.parse(e.data);
      if (res && this.mounted) {
        this.fetchUpdateStatus(res);
      }
    };

    ws.onclose = () => {
      console.log('ws.onclose');
      this.props.closeSocket(infoRoom.room_id);
    };

    wsStatus.onclose = () => {
      console.log('wsStatus.onclose');
      this.props.closeSocket(infoRoom.room_id);
    };
  };

  //handle get message drag
  fetchDataCache = async () => {
    const { infoRoom } = this.props;
    const messageCache = await ChatDBHelperInstance.getMessageCache(
      `CR#GROUP#${infoRoom.room_id}`,
    );

    if (messageCache && messageCache.length > 0) {
      const cache: IMessageGroupChatReceiver = {
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
        isUnsend: get(messageCache, [0, `_raw`, `isUnsend`], []),
        isLocal: get(messageCache, [0, `_raw`, `isLocal`], []),
        isCache: get(messageCache, [0, `_raw`, `isCache`], []),
        id_local: get(messageCache, [0, `_raw`, `id_local`], []),
        id_message: get(messageCache, [0, `_raw`, `id_message`], []),
        filesLocal: JSON.parse(
          get(messageCache, [0, `_raw`, `files_local`], []),
        ),
        flag_request: get(messageCache, [0, `_raw`, `flag_request`], []),
        id_message_request: get(
          messageCache,
          [0, `_raw`, `id_message_request`],
          [],
        ),
        is_group: get(messageCache, [0, `_raw`, `is_group`], []),
      };
      this.setState({ cacheMessages: cache });
    }
  };

  //get message from API
  fetchData = async () => {
    const { infoRoom, wsStatus } = this.props;
    try {
      await ChatDBHelperInstance.deleteMessageLocal();
      const roomID = `${this.prefixGroup}${infoRoom.room_id}`; //`CR#GROUP#${infoRoom.room_id}`
      const respone = await apiGetChatGroupByRoomID(roomID);
      if (respone.data) {
        const listMessUnRead: Array<string> = [];
        const resConvert: Array<IMessageGroupChatReceiver> = JSON.parse(
          JSON.stringify(respone.data.data),
        );
        //insert message from api to db local
        const rawMessages: any = [];
        resConvert.map(m => {
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
          rawMessages.push(newMessage);
        });

        const newMessageRecord = ChatDBHelperInstance.prepareCreateArrayMessageGroupChat(
          rawMessages,
        );
        await ChatDBHelperInstance.batchAction(newMessageRecord).then(record =>
          console.log('record', record),
        );

        const lastkey = JSON.parse(
          JSON.stringify(respone.data.LastEvaluatedKeyOldDate),
        );
        const lastkeyAddtoStart: any = [];
        lastkeyAddtoStart.push(
          `${roomID}%26${lastkey.create_at}%26${lastkey.PK}`,
        );
        this.setState({
          lastkeyAddtoStart: lastkeyAddtoStart,
          idMessageFirstData: resConvert[resConvert.length - 1].id_message,
        });

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
              room_id: `${this.prefixGroupAPI}${infoRoom.room_id}`,
            }),
          );
        }

        this.setState({ messages: resConvert });
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
      console.log('error get message chat group', error);
    }
  };

  componentDidMount() {
    this.mounted = true;
    this.storeDataIsMouted('mouted');
    // call handle socket
    this.handleSocket();
    //get message from room chat cache
    this.fetchDataCache();
    this.fetchData();
  }

  async componentWillUnmount() {
    this.storeDataIsMouted('unMouted');
    this.mounted = false;
  }

  //handle search message when props change
  componentDidUpdate(prevProps: Props) {
    if (prevProps.idMessageSearch !== this.props.idMessageSearch) {
      //go to data search message
      if (this.props.isGotoDataSearch && this.props.keywork !== '') {
        console.log("componentDidUpdate")
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

  render() {
    const {
      loadmore,
      loadingAddToStart,
      messages,
      messagesCurrent,
      messagesUnSend,
      cacheMessages,
      idMessgaeFooter,
      isFirstGotoDataSearch,
      loadingEndToStart,
      loadmoreAddToEnd,
      indexMessgaeFooter,
    } = this.state;
    const {
      infoRoom,
      navigation,
      ws,
      keywork,
      isOpentSearchMessage,
      dataMessageSearch,
      keyworkFullwidth,
      keyworkHalfwidth,
      connection,
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
              setTimeout(() => this.setState({ loadmore: false }), 500);
            }
            if (loadmoreAddToEnd) {
              setTimeout(() => this.setState({ loadmoreAddToEnd: false }), 500);
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

          <MessagesLocalChatGroup
            messageLocalDB={messages}
            infoRoom={infoRoom}
            connection={connection}
            scrollRef={this.scrollRef}
            keyword={keywork}
            keyworkFullwidth={keyworkFullwidth}
            keyworkHalfwidth={keyworkHalfwidth}
            idmessage={idMessgaeFooter}
            isFirstGotoDataSearch={isFirstGotoDataSearch}
            setisFirstCallGotoSearchMessage={
              this.setisFirstCallGotoSearchMessage
            }
            date={this.date}
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
            handleResendMessageMessage={this.handleResendMessage}
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
              ws={ws}
              setMessageCurrent={this.setMessageCurrent}
              listMessageCurrent={messagesCurrent}
              listMessageUnsend={messagesUnSend}
              cacheDataMessage={cacheMessages}
              infoRoom={infoRoom}
              connection={connection}
              refScrollView={this.scrollRef}
              isGroup={this.props.isGroup}
            />
          )}
          {/* <InputAction
            navigation={navigation}
            ws={ws}
            setMessageCurrent={this.setMessageCurrent}
            listMessageCurrent={messagesCurrent}
            listMessageUnsend={messagesUnSend}
            cacheDataMessage={cacheMessages}
            infoRoom={infoRoom}
            connection={connection}
            refScrollView={this.scrollRef}
            isGroup={this.props.isGroup}
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

export default connector(ChanelMessagesV2);

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
