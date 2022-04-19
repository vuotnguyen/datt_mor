import { debounce, get } from 'lodash';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// custom styles
import { useDispatch } from 'react-redux';
import InputAction from '../../components/common/InputAction/inputTemplate';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import { IChat, IChatResutlMessageSearch, Participant } from '../../models/chat';
import { apiUpdateIsJoinUserChatGroup } from '../../services/chat';
import { useAppDispatch, useAppSelector } from '../../stories';
import { createAction } from '../../stories/actions';
import { getChatDetail } from '../../stories/actions/chat';
import { groupchat, message } from '../../stories/types';
import ChanelMessages from './ChanelMessages';
import ChanelMessagesV2 from './ChanelMessagesV2';
import HeaderSetting from './HeaderGroup';
import HeaderSearchMessage from './HeaderSearchMessage';
import ModalConfirmGroupNotExist from './ModalConfirmGroupNotExist';
import SearchMessage from '../../components/common/SearchMessage/index';
import { connectDB } from '../../database';
import { RoomChatIndOp } from '../../database/modules/IndividualChatGroupScreen';
import { RoomChatSchemaType } from '../../database/modules/IndividualChatGroupScreen/roomChatGroupSchema';
import ModalChatConfirm, {
  IModalChatConfirm,
} from '../../components/common/ModalConfirm/modalChat';
import { ChatContext, useChatContext } from '../../hooks/chat';
import { useConvertFullSizeHalfSize } from '../../hooks/convertFullSizeHalfSize';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import {
  RootStackNavigationProp,
  RootStackParamsList,
} from '../../navigations/RootStack';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import Model from '@nozbe/watermelondb/Model';
import { NetInfoStateType } from '@react-native-community/netinfo';
import FooterSearch from '../../components/common/SearchMessage/FooterSearch';
import { InfoUserTmp } from '../../models/user';

import Messages from '../../config/Messages';

export type ChatGroupParams = {
  infoRoom: IChat;
  isRouteGroupChat: boolean;
};

type TRoute = RouteProp<RootStackParamsList, 'ChatGroup'>;

type Props = {
  navigation: any;
  route: any;
};

const ChatGroupScreen: React.FC<Props> = () => {
  const route = useRoute<TRoute>();
  const infoParams: IChat = get(route, 'params.infoRoom');
  if (!infoParams) return null;

  const navigation = useNavigation<RootStackNavigationProp>();

  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();
  const [isFetchedData, setIsFetchedData] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [idMessageSearch, setIdMessageSearch] = useState<string>('');
  const [createMessageSearch, setCreateMessageSearch] = useState<string>('');
  const [indexItemSelected, setIndexItemSelected] = useState<number>(0);
  const [isGotoDataSearch, setIsGotoDataSearch] = useState<boolean>(false);
  const [chats, setChats] = useState<Array<IChatResutlMessageSearch>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpentSearchMessage, setOpentSearchMessage] = useState<boolean>(
    false,
  );
  const [modalConfirm, setModalConfirm] = useState<IModalChatConfirm | null>(
    null,
  );

  const [keyworkFullwidth, setKeyworkFullwidth] = useState<string>('');
  const [keyworkHalfwidth, setKeyworkHalfwidth] = useState<string>('');
  const [totalResultSearch, setTotalResultSearch] = useState<number>(0);

  const animatedopenSearchMessage = new Animated.Value(0);
  const animatedHightSearchMessage = new Animated.Value(0);
  const animatedHeader = new Animated.Value(1);
  const animatedHightHeader = new Animated.Value(50);

  const refInput = useRef<TextInput>(null);

  const connectionNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );

  const connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  } = { isConnected: connectionNetwork, type: NetInfoStateType.other };

  /**
   * 1. get infoRoom from navigation
   * 2. dispatch from store connect socket with room_id
   */
  const infoRoom: IChat = useMemo(() => {

    let infoRoomParam: IChat = JSON.parse(JSON.stringify(infoParams));

    let roomIDConvert = infoRoomParam.room_id.replace(infoRoomParam.is_group == 1 ? 'CR#GROUP#' : 'CS#', '');
    infoRoomParam.room_id = roomIDConvert;

    if (infoRoomParam && infoRoomParam.room_id) {
      if (connectionNetwork) {
        dispatch(
          createAction(groupchat.CREATE_ROOM, {
            room_id: roomIDConvert,
          }),
        );
      }
    }
    return infoRoomParam;
  }, [connectionNetwork]);

  const isRouteGroupChat = route.params?.isRouteGroupChat;

  // get socket
  const dataRoom = useAppSelector(
    state => state.dataGroupChat[infoRoom.room_id],
  );

  useEffect(() => {
    if (!connectionNetwork) {
      dispatch(
        createAction(groupchat.CLOSE_SOCKET, {
          room_id: infoRoom.room_id,
        }),
      );
    }
  }, [connectionNetwork, infoRoom]);

  /** handle update value join group
   *
   */
  const UpdateValJoinGroup = useCallback(() => {
    // if (infoRoom && infoRoom.room_id && infoRoom.user_login.is_join == false) {
    //   apiUpdateIsJoinUserChatGroup(infoRoom.room_id)
    //     .then(res => {
    //       const resData = JSON.parse(JSON.stringify(res.data));
    //       dispatchThunk(
    //         getChatDetail(infoRoom.room_id, true, 'UPDATE_IS_JOIN'),
    //       );
    //     })
    //     .catch(error => console.log('error apiUpdateIsJoinUserChatGroup'));
    // }
  }, [infoRoom]);

  useEffect(() => {
    /**
     * handle render default template await data server send success
     */
    InteractionManager.runAfterInteractions(() => {
      UpdateValJoinGroup();
      setIsFetchedData(true);
    });
    return () => { };
  }, [infoRoom]);

  const changeAnimated = (animated: Animated.Value, valueChange: number) => {
    Animated.timing(animated, {
      toValue: valueChange,
      duration: 1,
      useNativeDriver: false,
    }).start();
  };
  //handle open tab search message
  const opentSearchMessage = (openSearchMessage: boolean) => {
    if (openSearchMessage) {
      if (refInput) refInput.current?.focus();
      changeAnimated(animatedopenSearchMessage, 1);
      changeAnimated(animatedHeader, 0);
      changeAnimated(animatedHightSearchMessage, 50);
      changeAnimated(animatedHightHeader, 0);
    } else {
      Keyboard.dismiss();
      changeAnimated(animatedopenSearchMessage, 0);
      changeAnimated(animatedHeader, 1);
      changeAnimated(animatedHightSearchMessage, 0);
      changeAnimated(animatedHightHeader, 50);

      setTimeout(() => {
        setKeyword('');
        setIdMessageSearch('');
        setIsGotoDataSearch(false);
      }, 100);
    }
    setTimeout(() => {
      setOpentSearchMessage(openSearchMessage);
    }, 100);
  };

  const _handleChangText = (keywork1: string) => {
    setIsGotoDataSearch(false);
    setKeyword(keywork1);
    if (keywork1.length > 1) {
      setIsLoading(false);
      handler(keywork1);
    }
  };

  const _handleSearch = async (str: string) => {
    if (str.trim() && str !== ' ' && str.length > 1) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const convert = useConvertFullSizeHalfSize(str);
      const messageLocal = await ChatDBHelperInstance.getAllRecordBySchema();

      if (messageLocal) {
        const arrResultFullWidth = messageLocal.filter(m =>
          get(m, [`_raw`, `message`], '')
            .toLowerCase()
            .includes(String(convert.fullWidth).toLowerCase()),
        );
        const arrResultHalfWidth = messageLocal.filter(m =>
          get(m, [`_raw`, `message`], '')
            .toLowerCase()
            .includes(convert.halfWidth.toLowerCase()),
        );

        const arr: Array<IChatResutlMessageSearch> = [];
        if (arrResultFullWidth.length > 0) {
          arrResultFullWidth.map(m => {
            if (
              !String(get(m, [`_raw`, `message`], '')).includes(
                'SpecialMessage:',
              )
            ) {
              const tmp: IChatResutlMessageSearch = {
                id_message: get(m, [`_raw`, `id_message`], ''),
                message: get(m, [`_raw`, `message`], ''),
                room_id: get(m, [`_raw`, `room_id`], ''),
                user_sender: get(m, [`_raw`, `user_sender`], ''),
                create_at: get(m, [`_raw`, `createAtFormat`], ''),
              };
              arr.push(tmp);
            }
          });
        }
        if (arrResultHalfWidth.length > 0) {
          arrResultHalfWidth.map(m => {
            const idx = arr.findIndex(m1 => m1.id_message === get(m, [`_raw`, `id_message`], ''));
            if (idx === -1) {
              if (
                !String(get(m, [`_raw`, `message`], '')).includes(
                  'SpecialMessage:',
                )
              ) {
                const tmp: IChatResutlMessageSearch = {
                  id_message: get(m, [`_raw`, `id_message`], ''),
                  message: get(m, [`_raw`, `message`], ''),
                  room_id: get(m, [`_raw`, `room_id`], ''),
                  user_sender: get(m, [`_raw`, `user_sender`], ''),
                  create_at: get(m, [`_raw`, `createAtFormat`], ''),
                };
                arr.push(tmp);
              }
            }
          });
        }

        setChats([...arr.reverse()]);
        setTotalResultSearch(arr.length);
        setKeyworkFullwidth(convert.fullWidth);
        setKeyworkHalfwidth(convert.halfWidth);
        setIsLoading(true);
        Keyboard.dismiss();
      }
    }
  };

  const handler = useCallback(debounce(_handleSearch, 1000), []);

  //handle click item result search message
  const handleSearchMessageID = (
    idmessage: string,
    create_at: string,
    index: number,
  ) => {
    setIdMessageSearch(idmessage);
    setCreateMessageSearch(create_at);
    setIndexItemSelected(index);
    setIsGotoDataSearch(true);
  };

  const handclearText = () => {
    if (refInput) {
      refInput.current?.focus();
    }
    setKeyword('');
    setChats([]);
  };

  const handleArrowUpSearchMessage = (idmessage: string,
    create_at: string,
    index: number,) => {
    setIdMessageSearch(idmessage);
    setCreateMessageSearch(create_at);
    setIndexItemSelected(index);
    setIsGotoDataSearch(true);
  }

  return (
    <ChatContext.Provider value={{ typeChat: infoParams.is_group == 2 ? 'groupConstruction' : 'groupUser', navigation, infoUsers: { user_friend: InfoUserTmp, user_login: InfoUserTmp, user_sender: InfoUserTmp } }}>
      <React.Fragment>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
            enabled>
            <Animated.View
              style={{
                height: animatedHightSearchMessage,
                opacity: animatedopenSearchMessage,
              }}>
              <HeaderSearchMessage
                setOpenSearchMessage={opentSearchMessage}
                setKeyword={_handleChangText}
                keyword={keyword}
                handclearText={handclearText}
                refInput={refInput}
              />
            </Animated.View>

            <Animated.View
              style={{
                height: animatedHightHeader,
                opacity: animatedHeader,
              }}>
              <HeaderSetting
                infoRoom={infoRoom}
                isFetchedData={isFetchedData}
                setOpenSearchMessage={opentSearchMessage}
                isGroup={infoRoom.is_group}
              />
            </Animated.View>

            <View
              style={{
                position: 'relative',
                display:
                  keyword.length > 1 && !isGotoDataSearch ? 'flex' : 'none',
              }}>
              {!isLoading ? (
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
                // <SearchMessage/>
                <>
                  {chats.length > 0 ? (
                    <SearchMessage
                      handleSearchMessageID={handleSearchMessageID}
                      chats={chats}
                      keyworkFullwidth={keyworkFullwidth}
                      keyworkHalfwidth={keyworkHalfwidth}
                      totalResultSearch={totalResultSearch}
                      roomID={infoRoom.room_id}
                      keywork={keyword}
                    />
                  ) : (
                    <>
                      {isLoading ? (
                        <>
                          <Text style={{ padding: 10, textAlign: 'center' }}>
                            {/* {`「${keyword.trim()}」に一致する結果はありませんでした`} */}
                            {`検索結果がありません`}
                          </Text>
                          <View
                            key={'NotKeyworkSearch'}
                            style={[styles.wrapperBox]}>
                            <TouchableNativeFeedback onPress={() => { }}>
                              <View
                                style={[
                                  styles.userBoxLoading,
                                  { paddingHorizontal: 1000 },
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

            <View
              style={{
                flex: 1,
                position: 'relative',
              }}>
              {dataRoom ? (
                <ChanelMessagesV2
                  ws={dataRoom.ws}
                  wsStatus={dataRoom.wsStatus}
                  navigation={navigation}
                  infoRoom={infoRoom}
                  keywork={keyword}
                  isGotoDataSearch={isGotoDataSearch}
                  idMessageSearch={idMessageSearch}
                  createMessageSearch={createMessageSearch}
                  indexItemSelected={indexItemSelected}
                  dataMessageSearch={chats}
                  isOpentSearchMessage={isOpentSearchMessage}
                  keyworkFullwidth={keyworkFullwidth}
                  keyworkHalfwidth={keyworkHalfwidth}
                  connection={connection}
                  isGroup={infoRoom.is_group}
                />
              ) : null}

              {/* <Animated.View
                style={[{ height: animatedHightSearchMessage, opacity: animatedopenSearchMessage }, styles.topLine, styles.inpAction, styles.search]}
              >
                <FooterSearch
                  keywork={keyword}
                  idmessage={idMessageSearch}
                  indexItemSelected={indexItemSelected}
                  dataMessageSearch={chats}
                  handleArrowUpDownSearchMessage={handleArrowUpSearchMessage}
                />
              </Animated.View> */}

              {/* {isOpentSearchMessage ?
                <View style={[styles.topLine, styles.inpAction, styles.search]}>
                  <FooterSearch
                    keywork={keyword}
                    idmessage={idMessageSearch}
                    indexItemSelected={indexItemSelected}
                    dataMessageSearch={chats}
                    handleArrowUpDownSearchMessage={handleArrowUpSearchMessage}
                  />
                </View> : null} */}

              {!isFetchedData ? (
                <View
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#fff',
                  }}>
                  <View
                    style={{
                      height: 40,
                      paddingTop: 10,
                    }}>
                    <ActivityIndicator size={20} color={'#000'} />
                  </View>
                  <View style={{ flex: 1 }}></View>
                  <View style={[styles.topLine, styles.inpAction]}>
                    <InputAction />
                  </View>
                </View>
              ) : null}
            </View>
            {infoRoom && !isRouteGroupChat ? (
              <ModalConfirmGroupNotExist
                navigation={navigation}
                room_id={infoRoom.room_id}
                isGroup={infoRoom.is_group}
              />
            ) : null}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </React.Fragment>
    </ChatContext.Provider>
  );
};

export default memo(ChatGroupScreen);
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
    paddingBottom: 5,
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
  search: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000
  }
});
