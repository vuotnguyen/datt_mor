import AsyncStorage from '@react-native-async-storage/async-storage';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';
import {debounce, get} from 'lodash';
import React, {createRef, PureComponent} from 'react';
// component
import {
  Animated,
  Dimensions,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {connect, ConnectedProps} from 'react-redux';
import HeaderSearchMessage from '../../components/common/Header/HeaderSearchMessage';
import Header from '../../components/common/Header/index';
import SearchMessage from '../../components/common/SearchMessage/index';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import {connectDB} from '../../database';
import {useConvertFullSizeHalfSize} from '../../hooks/convertFullSizeHalfSize';
// hook
import {
  IChat,
  IChatResutlMessageSearch,
  IMessageReceiver,
  ITypeRoomChat,
} from '../../models/chat';
import {AppDispatch, RootState} from '../../stories';
import {createAction} from '../../stories/actions';
import {individualChat} from '../../stories/types';
import ChannelMessages from './ChannelMessages';
import {RoomChatSchemaType} from '../../database/modules/IndividualChatScreen/roomChatSchema';
import {RoomChatIndOp} from '../../database/modules/IndividualChatScreen';
import ModalChatConfirm, {
  IModalChatConfirm,
} from '../../components/common/ModalConfirm/modalChat';
import {ChatContext, useChatContext} from '../../hooks/chat';
import {InfoUser, InfoUserTmp} from '../../models/user';

// get height width devices
const {height, width} = Dimensions.get('screen');

export type IndividualChatParams = {
  infoRoom: IChat;
};

export interface Imessage {
  createAt: string;
  mine: boolean;
  text: string;
  avatar?: string;
  images?: Array<PhotoIdentifier>;
  isRead?: boolean;
}

type Props = {
  navigation: any;
  route: any;
};
type State = {
  infoRoom: IChat | null;
  loading: boolean;
  loadingSearchMessage: boolean;
  messages: Array<IMessageReceiver>;
  messageLocalDB: Array<IMessageReceiver>;
  messagesUnsend: Array<IMessageReceiver>;
  messageLocal: Array<IMessageReceiver>;
  cacheDataMessage: IMessageReceiver | null;
  itemResend: IMessageReceiver | null;
  arrDateShowed: Array<{date: string; showed: boolean}>;
  refScrollView: ScrollView | null;
  isLoadMore: boolean;
  isAllowScroll: boolean;
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
  isUnMount: boolean;
  isOpentSearchMessage: boolean;
  keywork: string;
  keyworkFullwidth: string;
  keyworkHalfwidth: string;
  totalResultSearch: number;
  idMessageSearch: string;
  isGotoDataSearch: boolean;
  chats: Array<IChatResutlMessageSearch>;
  createMessageSearch: string;
  indexItemSelected: number;
  modalConfirm: IModalChatConfirm | null;
};
const mapStateToProps = (state: RootState, owlProp: Props) => {
  return {
    dataIndividualChat: state.dataIndividualChat,
    dataAllUsers: state.dataAllUser,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch, owlProp: any) => {
  return {
    fetchInfoRoom: (payload: {info_room: IChat}) =>
      dispatch(createAction(individualChat.CREATE_ROOM, payload)),
    closeSocket: (room_id: string) =>
      dispatch(createAction(individualChat.CLOSE_SOCKET, {room_id})),
    setUnmount: (value: boolean, room_id: string) =>
      dispatch(
        createAction(individualChat.SET_VAL_IS_CLOSE_SOCKET, {value, room_id}),
      ),
    setIntervalRoom: (room_id: string, timerCheck: NodeJS.Timeout) =>
      dispatch(
        createAction(individualChat.SET_TIMER_INTERVAL, {room_id, timerCheck}),
      ),
    clearIntervalRoom: (room_id: string) =>
      dispatch(createAction(individualChat.CLEAR_TIMER_INVERVAL, {room_id})),
  };
};
const connector = connect(mapStateToProps, mapDispatchToProps);

class indexClassVersion extends PureComponent<
  Props & ConnectedProps<typeof connector>,
  State
> {
  wsStatus: WebSocket;
  ws: WebSocket;
  // refScrollView: ScrollView;
  fadeAnim: Animated.Value;
  loadingPagingMessage: Animated.Value;
  refInput: React.RefObject<TextInput> | null;
  animatedopenSearchMessage: Animated.Value;
  animatedHightSearchMessage: Animated.Value;
  animatedHeader: Animated.Value;
  animatedHightHeader: Animated.Value;
  user_friend: InfoUser;
  user_login: InfoUser;
  user_sender: InfoUser;

  //refInput: useRef<TextInput>(null);

  isAllowReadmore: boolean;
  isUnmount: boolean;

  constructor(props: Props & ConnectedProps<typeof connector>) {
    super(props);
    const infoRoomParam: IChat = this.props.route?.params?.infoRoom;
    console.log('infoRoomParam', infoRoomParam);

    this.state = {
      infoRoom: infoRoomParam,
      loading: false,
      loadingSearchMessage: false,
      messages: [],
      messageLocalDB: [],
      messagesUnsend: [],
      messageLocal: [],
      cacheDataMessage: null,
      itemResend: null,
      arrDateShowed: [],
      refScrollView: null,
      isLoadMore: true,
      isAllowScroll: false,
      connection: {
        type: NetInfoStateType.none,
        isConnected: true,
      },
      isUnMount: false,
      isOpentSearchMessage: false,
      keywork: '',
      keyworkHalfwidth: '',
      keyworkFullwidth: '',
      totalResultSearch: 0,
      idMessageSearch: '',
      isGotoDataSearch: false,
      chats: [],
      createMessageSearch: '',
      indexItemSelected: 0,
      modalConfirm: null,
    };

    this.fadeAnim = new Animated.Value(0);
    this.loadingPagingMessage = new Animated.Value(0);
    this.refInput = createRef<TextInput | any>();

    this.animatedopenSearchMessage = new Animated.Value(0);
    this.animatedHightSearchMessage = new Animated.Value(0);
    this.animatedHeader = new Animated.Value(1);
    this.animatedHightHeader = new Animated.Value(50);

    this.isAllowReadmore = false;
    this.isUnmount = false;
    /**
     * get socket store
     */
    this.props.fetchInfoRoom({info_room: infoRoomParam});

    this.props.clearIntervalRoom(infoRoomParam.room_id);

    const dataStore = this.props.dataIndividualChat[infoRoomParam?.room_id];

    const {ws, wsStatus} = dataStore;
    this.ws = ws;
    this.wsStatus = wsStatus;

    this.handleGoback = this.handleGoback.bind(this);
    this.setModalConfirm = this.setModalConfirm.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);

    this.user_friend = this.getUserInfo(infoRoomParam.user_friend);
    this.user_login = this.getUserInfo(infoRoomParam.user_login);
    this.user_sender = this.getUserInfo(infoRoomParam.user_sender);
  }

  getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      return get(this.props.dataAllUsers, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };

  /**
   * set modal confirm
   * @returns
   */
  setModalConfirm = (modalConfirm: IModalChatConfirm | null) => {
    this.setState({modalConfirm});
  };

  /**
   *
   * @returns goback method
   */
  handleGoback = () => this.props.navigation.goBack();

  changeAnimated = (animated: Animated.Value, valueChange: number) => {
    Animated.timing(animated, {
      toValue: valueChange,
      duration: 1,
      useNativeDriver: false,
    }).start();
  };

  opentSearchMessage = (openSearchMessage: boolean) => {
    if (openSearchMessage) {
      if (this.refInput) this.refInput.current?.focus();
      this.changeAnimated(this.animatedopenSearchMessage, 1);
      this.changeAnimated(this.animatedHeader, 0);
      this.changeAnimated(this.animatedHightSearchMessage, 50);
      this.changeAnimated(this.animatedHightHeader, 0);
    } else {
      Keyboard.dismiss();
      this.changeAnimated(this.animatedopenSearchMessage, 0);
      this.changeAnimated(this.animatedHeader, 1);
      this.changeAnimated(this.animatedHightSearchMessage, 0);
      this.changeAnimated(this.animatedHightHeader, 50);
      setTimeout(() => {
        this.setState({
          keywork: '',
          idMessageSearch: '',
          isGotoDataSearch: false,
        });
      }, 100);
    }
    setTimeout(() => {
      this.setState({
        isOpentSearchMessage: openSearchMessage,
      });
    }, 100);
  };

  _handleChangText = (keywork1: string) => {
    this.setState({
      keywork: keywork1,
      isGotoDataSearch: false,
    });
    if (keywork1.length > 1) {
      this.setState({
        loadingSearchMessage: false,
      });
      this.handler(keywork1);
    }
  };

  handclearText = () => {
    if (this.refInput) {
      this.refInput.current?.focus();
    }
    this.setState({
      keywork: '',
      chats: [],
    });
  };

  _handleSearch = async (str: string) => {
    if (str.trim() && str !== ' ' && this.state.infoRoom) {
      const {infoRoom} = this.state;
      // apiSearchMessage(this.state.infoRoom.room_id, str.trim())
      //     .then(res => {
      //         const resDataConvert = JSON.parse(JSON.stringify(res));
      //         let arr: Array<IChatResutlMessageSearch> = [];
      //         if (resDataConvert.data.data.length > 0) {
      //             arr = resDataConvert.data.data;
      //         } else {
      //             arr = [];
      //         }
      //         this.setState(
      //             {
      //                 chats: [...arr],
      //                 totalResultSearch: resDataConvert.data.number_total_result,
      //                 keyworkFullwidth: resDataConvert.data.message_convert.fullwidth,
      //                 keyworkHalfwidth: resDataConvert.data.message_convert.halfwidth,
      //                 loadingSearchMessage: true
      //             },
      //             () => {
      //                 Keyboard.dismiss();
      //             },
      //         );
      //     })
      //     .catch(err => {
      //         console.log('apiSearchMessage error', err);
      //     })
      const convert = useConvertFullSizeHalfSize(str);
      const realmOpen = await connectDB();
      realmOpen.write(async () => {
        const roomLocal = realmOpen.objectForPrimaryKey<RoomChatSchemaType>(
          RoomChatIndOp.NAME_SCHEMA,
          infoRoom.room_id,
        );
        if (roomLocal) {
          const arrMessage: Array<IMessageReceiver> = roomLocal.messages;
          const arrResultFullWidth = arrMessage.filter(m =>
            m.message
              .toLowerCase()
              .includes(String(convert.fullWidth).toLowerCase()),
          );
          const arrResultHalfWidth = arrMessage.filter(m =>
            m.message.toLowerCase().includes(convert.halfWidth.toLowerCase()),
          );
          const arr: Array<IChatResutlMessageSearch> = [];
          if (arrResultFullWidth.length > 0) {
            arrResultFullWidth.map(m => {
              const tmp: IChatResutlMessageSearch = {
                id_message: m.id_message,
                message: m.message,
                room_id: m.room_id,
                user_sender: m.user_sender,
                create_at: m.create_at,
                is_group: false,
              };
              arr.push(tmp);
            });
          }
          if (arrResultHalfWidth.length > 0) {
            arrResultHalfWidth.map(m => {
              const tmp: IChatResutlMessageSearch = {
                id_message: m.id_message,
                message: m.message,
                room_id: m.room_id,
                user_sender: m.user_sender,
                create_at: m.create_at,
                is_group: false,
              };
              arr.push(tmp);
            });
          }
          arr.map(m => console.log('id', m.id_message));
          this.setState(
            {
              chats: [...arr.reverse()],
              totalResultSearch: arr.length,
              keyworkFullwidth: convert.fullWidth,
              keyworkHalfwidth: convert.halfWidth,
              loadingSearchMessage: true,
            },
            () => {
              Keyboard.dismiss();
            },
          );
        }
      });
    }
  };

  handler = debounce(this._handleSearch, 1000);

  handleSearchMessageID = (
    idmessage: string,
    create_at: string,
    index: number,
  ) => {
    this.setState({
      isGotoDataSearch: true,
      idMessageSearch: idmessage,
      createMessageSearch: create_at,
      indexItemSelected: index,
    });
  };

  render() {
    this.isUnmount = false;
    const {navigation} = this.props;
    const {
      infoRoom,
      refScrollView,
      keywork,
      isGotoDataSearch,
      loadingSearchMessage,
      chats,
      connection,
      idMessageSearch,
      createMessageSearch,
      indexItemSelected,
      isOpentSearchMessage,
      keyworkFullwidth,
      keyworkHalfwidth,
      totalResultSearch,
    } = this.state;
    /**
     *  handle scroll to end when keyboard will show
     */
    Keyboard.addListener('keyboardDidShow', () => {
      if (refScrollView) refScrollView.scrollToEnd({animated: false});
    });

    return (
      <ChatContext.Provider
        value={{
          typeChat: 'individual',
          navigation,
          openModal: this.setModalConfirm,
        }}>
        <React.Fragment>
          <SafeAreaView style={{flex: 1}}>
            <KeyboardAvoidingView
              style={{flex: 1, backgroundColor: '#fff'}}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
              enabled>
              <Animated.View
                style={{
                  height: this.animatedHightSearchMessage,
                  opacity: this.animatedopenSearchMessage,
                }}>
                <HeaderSearchMessage
                  setOpenSearchMessage={this.opentSearchMessage}
                  setKeyword={this._handleChangText}
                  keyword={this.state.keywork}
                  handclearText={this.handclearText}
                  refInput={this.refInput}
                />
              </Animated.View>

              <Animated.View
                style={{
                  height: this.animatedHightHeader,
                  opacity: this.animatedHeader,
                }}>
                <Header
                  handleGoback={this.handleGoback}
                  headerTitle={this.user_friend.full_name}
                  setOpenSearchMessage={this.opentSearchMessage}
                />
              </Animated.View>

              <View
                style={{
                  position: 'relative',
                  display:
                    keywork.length > 1 && !isGotoDataSearch ? 'flex' : 'none',
                }}>
                {!loadingSearchMessage ? (
                  <>
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                    <ChatBoxLoading />
                  </>
                ) : (
                  <>
                    {chats.length > 0 ? (
                      <SearchMessage
                        handleSearchMessageID={this.handleSearchMessageID}
                        chats={chats}
                        keyworkFullwidth={keyworkFullwidth}
                        keyworkHalfwidth={keyworkHalfwidth}
                        totalResultSearch={totalResultSearch}
                        roomID={infoRoom ? infoRoom.room_id : ''}
                        keywork={keywork}
                      />
                    ) : (
                      <>
                        {loadingSearchMessage ? (
                          <>
                            <Text style={{padding: 10, textAlign: 'center'}}>
                              {`検索結果がありません`}
                            </Text>
                            <View
                              key={'NotKeyworkSearch'}
                              style={[styles.wrapperBox]}>
                              <TouchableNativeFeedback onPress={() => {}}>
                                <View
                                  style={[
                                    styles.userBoxLoading,
                                    {paddingHorizontal: 1000},
                                  ]}></View>
                              </TouchableNativeFeedback>
                            </View>
                          </>
                        ) : null}
                      </>
                    )}
                  </>
                )}
              </View>

              {infoRoom ? (
                <ChannelMessages
                  infoRoom={infoRoom}
                  connection={connection}
                  navigation={navigation}
                  ws={this.ws}
                  wsStatus={this.wsStatus}
                  keywork={keywork}
                  keyworkFullwidth={keyworkFullwidth}
                  keyworkHalfwidth={keyworkHalfwidth}
                  idMessageSearch={idMessageSearch}
                  createMessageSearch={createMessageSearch}
                  indexItemSelected={indexItemSelected}
                  isGotoDataSearch={isGotoDataSearch}
                  dataMessageSearch={chats}
                  isOpentSearchMessage={isOpentSearchMessage}
                />
              ) : null}
            </KeyboardAvoidingView>
          </SafeAreaView>
          <ModalChatConfirm
            modalConfirm={this.state.modalConfirm}
            setModalConfirm={this.setModalConfirm}
          />
        </React.Fragment>
      </ChatContext.Provider>
    );
  }

  storeDataIsMouted = async (mouted: string) => {
    try {
      await AsyncStorage.setItem('@moutedChatDetail', mouted);
    } catch (e) {
      // saving error
    }
  };

  /**
   *  life cycle run after component render
   */
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      // 2: Component is done animating
      const {infoRoom} = this.state;

      this.storeDataIsMouted('mouted');

      /**
       * handle connect Internet
       */
      NetInfo.addEventListener(state => {
        if (!this.isUnmount) {
          this.setState({
            connection: {
              type: NetInfoStateType.other,
              isConnected: state.isConnected,
            },
          });
        }
      });
      /**
       * function run when socket close
       */
      this.ws.onclose = () => {
        console.log('ws.onclose');
        if (infoRoom) {
          this.props.closeSocket(infoRoom.room_id);
        }
        // this.state.messageLocal
        // const realmOpen = await ;
        this.setState({
          connection: {
            type: NetInfoStateType.none,
            isConnected: false,
          },
        });
      };
      /**
       * function run when socket status
       */
      this.wsStatus.onclose = () => {
        console.log('wsStatus.onclose 111');
      };
    });
  }

  /**
   * life cycle run before component unmount
   */
  async componentWillUnmount() {
    // isUnmount = true;
    this.storeDataIsMouted('unMouted');
  }
}

export default connector(indexClassVersion);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  wrapperHeader: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  wrapperInputAction: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: width,
  },
  topLine: {
    shadowColor: '#000',
    backgroundColor: 'transparent',
    // shadowOffset: {width: 0, height: 3},
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    // elevation: 0,
  },
  wrapperIconButton: {
    width: 30,
    position: 'absolute',
    right: 10,
    zIndex: 100,
    // height: 50,
    // bottom: -70,
    transform: [{translateY: -70}],
  },
  iconBtnScroll: {
    // paddingHorizontal: 5,
    // paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 200,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    elevation: 0,
  },
  inpAction: {
    paddingTop: 5,
    backgroundColor: '#fff',
    borderColor: 'rgba(230,230,230,0.8)',
    borderTopWidth: 1,
    elevation: 0,
    paddingBottom: 3,
  },
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  userBoxLoading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1000,
    width: '100%',
  },
});
