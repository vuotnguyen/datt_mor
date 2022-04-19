import React, { memo, useMemo } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { get, debounce } from 'lodash';
import {
  RootStackNavigationProp,
  RootStackParamsList,
} from '../../navigations/RootStack';
import HeaderSearchMessage from '../../components/common/Header/HeaderSearchMessage';
import Header from '../../components/common/Header/index';
import { useConvertFullSizeHalfSize } from '../../hooks/convertFullSizeHalfSize';
import { RoomChatSchemaType } from '../../database/modules/IndividualChatGroupScreen/roomChatGroupSchema';
import { connectDB } from '../../database';
import { RoomChatIndOp } from '../../database/modules/IndividualChatScreen';
import SearchMessage from '../../components/common/SearchMessage/index';
import ChannelMessages from './ChannelMessages';

import {
  IChat,
  IChatResutlMessageSearch,
  IGroupInfo,
  IMessageReceiver,
  ITypeRoomChat,
} from '../../models/chat';
import { useAppDispatch, useAppSelector } from '../../stories';
import { InfoUser, InfoUserTmp } from '../../models/user';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import { NetInfoStateType } from '@react-native-community/netinfo';
import { useDispatch } from 'react-redux';
import { createAction } from '../../stories/actions';
import { individualChat } from '../../stories/types';
import { ChatContext, IChatServices, useChatContext } from '../../hooks/chat';
import { ChatDBHelperInstance } from '../../database/DatabaseHelper';
import FooterSearch from '../../components/common/SearchMessage/FooterSearch';

interface Props { }
type TRoute = RouteProp<RootStackParamsList, 'IndividualChat'>;
export type IndividualChatParams = {
  infoRoom: IChat;
};
type IKeywordState = {
  value: string;
  fullWidth: string;
  halfWidth: string;
};

type ISearchState = {
  keyword: IKeywordState;
  idMessageSearch: string;
  createMessageSearch: string;
  indexItemSelected: number;
  isGotoDataSearch: boolean;
  chats: Array<IChatResutlMessageSearch>;
  isOpentSearchMessage: boolean;
};
type ISearchSet = {
  keyword?: {
    value?: string;
    fullWidth?: string;
    halfWidth?: string;
  };
  idMessageSearch?: string;
  createMessageSearch?: string;
  indexItemSelected?: number;
  isGotoDataSearch?: boolean;
  chats?: Array<IChatResutlMessageSearch>;
  isOpentSearchMessage?: boolean;
};
const IndividualChat = ({ }: Props) => {
  const route = useRoute<TRoute>();
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();

  // stories
  const { AllUserInfo } = useAppSelector(state => state.dataAllUser);

  const getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      return get(AllUserInfo, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };
  //   connection
  const isConnectNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );

  const connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  } = { isConnected: isConnectNetwork, type: NetInfoStateType.other };

  //   const infoRoom: IChat = get(route, 'params.infoRoom', '');
  /**
   * 1. get infoRoom from navigation
   * 2. dispatch from store connect socket with room_id
   */
  const infoRoom: IChat = React.useMemo(() => {
    let infoRoomParam: IChat = get(route, 'params.infoRoom', '');
    if (infoRoomParam && infoRoomParam.room_id) {
      if (isConnectNetwork) {
        dispatch(
          createAction(individualChat.CREATE_ROOM, {
            info_room: infoRoomParam,
          }),
        );
      }
    }
    return infoRoomParam;
  }, [isConnectNetwork]);

  if (!infoRoom) return <Text>InfoGroup null</Text>;
  const navigation = useNavigation<RootStackNavigationProp>();
  const handleGoBack = () => {
    navigation.goBack();
  };

  //   info users
  const user_friend = getUserInfo(infoRoom.user_friend);
  const user_login = getUserInfo(infoRoom.user_login);
  const user_sender = getUserInfo(infoRoom.user_sender);

  //   Websocket
  const dataRoom = useAppSelector(
    state => state.dataIndividualChat[infoRoom.room_id],
  );
  if (!dataRoom) return <Text>dataRoom null</Text>;

  // search
  const [search, setSearch] = React.useState<ISearchState>({
    keyword: {
      fullWidth: '',
      halfWidth: '',
      value: '',
    },
    chats: [],
    createMessageSearch: '',
    idMessageSearch: '',
    indexItemSelected: 0,
    isGotoDataSearch: false,
    isOpentSearchMessage: false,
  });
  const handleSetSearch = ({
    chats,
    createMessageSearch,
    idMessageSearch,
    indexItemSelected,
    isGotoDataSearch,
    isOpentSearchMessage,
    keyword,
  }: ISearchSet) => {
    let searchValue: ISearchState = {
      chats: chats ?? search.chats,
      createMessageSearch: createMessageSearch ?? search.createMessageSearch,
      idMessageSearch: idMessageSearch ?? search.idMessageSearch,
      indexItemSelected: indexItemSelected ?? search.indexItemSelected,
      isGotoDataSearch: isGotoDataSearch ?? search.isGotoDataSearch,
      isOpentSearchMessage: isOpentSearchMessage ?? search.isOpentSearchMessage,
      keyword: {
        value: keyword?.value ?? search.keyword.value,
        fullWidth: keyword?.fullWidth ?? search.keyword?.fullWidth,
        halfWidth: keyword?.halfWidth ?? search.keyword?.halfWidth,
      },
    };
    setSearch(searchValue);
  };
  const [services, setService] = React.useState<IChatServices | null>(null);
  return (
    <ChatContext.Provider
      value={{
        navigation,
        typeChat: 'individual',
        infoUsers: { user_friend, user_sender, user_login },
        setService,
        services,
      }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#fff' }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
          enabled>
          <HeaderHandle
            infoRoom={infoRoom}
            handleGoBack={handleGoBack}
            setSearch={handleSetSearch}
            search={search}
          />

          <ChannelMessages
            infoRoom={infoRoom}
            connection={connection}
            navigation={navigation}
            ws={dataRoom.ws}
            wsStatus={dataRoom.wsStatus}
            keywork={search.keyword.value}
            keyworkFullwidth={search.keyword.fullWidth}
            keyworkHalfwidth={search.keyword.halfWidth}
            idMessageSearch={search.idMessageSearch}
            createMessageSearch={search.createMessageSearch}
            indexItemSelected={search.indexItemSelected}
            isGotoDataSearch={search.isGotoDataSearch}
            dataMessageSearch={search.chats}
            isOpentSearchMessage={search.isOpentSearchMessage}
          />


        </KeyboardAvoidingView>
      </SafeAreaView>
    </ChatContext.Provider>
  );
};

const HeaderHandle = ({
  infoRoom,
  handleGoBack = () => undefined,
  setSearch = () => undefined,
  search
}: {
  infoRoom: IChat;
  handleGoBack: () => void;
  setSearch: (val: ISearchSet) => void;
  search: ISearchState
}) => {
  const roomChatContext = useChatContext();

  if (!roomChatContext)
    return (
      <>
        <Header
          handleGoback={() => undefined}
          headerTitle={''}
          setOpenSearchMessage={() => undefined}
        />
      </>
    );
  const { infoUsers } = roomChatContext;
  //   animated
  const animatedopenSearchMessage = new Animated.Value(0);
  const animatedHightSearchMessage = new Animated.Value(0);
  const animatedHeader = new Animated.Value(1);
  const animatedHightHeader = new Animated.Value(50);

  //   search
  const refInput = React.useRef<TextInput>(null);
  const [keyword, setKeyword] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGotoDataSearch, setIsGotoDataSearch] = React.useState<boolean>(
    false,
  );
  const [chats, setChats] = React.useState<Array<IChatResutlMessageSearch>>([]);
  const [keyworkFullwidth, setKeyworkFullwidth] = React.useState<string>('');
  const [keyworkHalfwidth, setKeyworkHalfwidth] = React.useState<string>('');
  const [totalResultSearch, setTotalResultSearch] = React.useState<number>(0);

  const changeAnimated = (animated: Animated.Value, valueChange: number) => {
    Animated.timing(animated, {
      toValue: valueChange,
      duration: 1,
      useNativeDriver: false,
    }).start();
  };

  const openSearchMessage = (openSearchMessage: boolean) => {
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
        setSearch({
          keyword: { value: '' },
          idMessageSearch: '',
          isGotoDataSearch: false,
        });
        // setIdMessageSearch('');
        setIsGotoDataSearch(false);
      }, 100);
    }
    console.log("openSearchMessage", openSearchMessage)
    setTimeout(() => {
      setSearch({ isOpentSearchMessage: openSearchMessage });
    }, 100);
  };

  const _handleSearch = async (str: string) => {
    if (str.trim() && str !== ' ' && str.length > 1) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const convert = useConvertFullSizeHalfSize(str);

      const messageLocal = await ChatDBHelperInstance.getAllRecordIndividual();
      if (messageLocal) {
        console.log(messageLocal.length)

        const arrResultFullWidth = messageLocal.filter(m =>
          get(m, [`_raw`, `message`], '')
            .toLowerCase()
            .includes(String(convert.fullWidth).toLowerCase()),
        );
        const arrResultHalfWidth = messageLocal.filter(m =>
          get(m, [`_raw`, `message`], '')
            .toLowerCase().includes(convert.halfWidth.toLowerCase()),
        );

        const arr: Array<IChatResutlMessageSearch> = [];
        if (arrResultFullWidth.length > 0) {
          arrResultFullWidth.map(m => {
            const tmp: IChatResutlMessageSearch = {
              id_message: get(m, [`_raw`, `id_message`], ''),
              message: get(m, [`_raw`, `message`], ''),
              room_id: get(m, [`_raw`, `room_id`], ''),
              user_sender: get(m, [`_raw`, `user_sender`], ''),
              create_at: get(m, [`_raw`, `createAtFormat`], ''),
            };
            arr.push(tmp);
          });
        }
        if (arrResultHalfWidth.length > 0) {
          arrResultHalfWidth.map(m => {
            const idx = arr.findIndex(m1 => m1.id_message === get(m, [`_raw`, `id_message`], ''));
            if (idx === -1) {
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
        console.log(arr.reverse())
        setSearch({
          keyword: {
            value: str,
            fullWidth: convert.fullWidth,
            halfWidth: convert.halfWidth,
          },
          chats: arr.reverse(),
        });
        setChats(arr.reverse());
        setTotalResultSearch(arr.length);
        setKeyworkFullwidth(convert.fullWidth);
        setKeyworkHalfwidth(convert.halfWidth);
        setIsLoading(true);
        Keyboard.dismiss();
      }
    }
  };

  const handler = React.useCallback(debounce(_handleSearch, 1000), []);
  const _handleChangText = (kw: string) => {
    setIsGotoDataSearch(false);
    setKeyword(kw);
    if (kw.length > 1) {
      setIsLoading(false);
      handler(kw);
    }
  };

  const handClearText = () => {
    if (refInput) {
      refInput.current?.focus();
    }
    setKeyword('');
    setChats([]);
  };

  const handleSearchMessageID = (
    idmessage: string,
    create_at: string,
    index: number,
  ) => {
    setSearch({
      idMessageSearch: idmessage,
      createMessageSearch: create_at,
      indexItemSelected: index,
      isGotoDataSearch: true,
    });
    setIsGotoDataSearch(true);
  };


  return (
    <>
      <Animated.View
        style={{
          height: animatedHightSearchMessage,
          opacity: animatedopenSearchMessage,
        }}>
        <HeaderSearchMessage
          setOpenSearchMessage={openSearchMessage}
          setKeyword={_handleChangText}
          keyword={keyword}
          handclearText={handClearText}
          refInput={refInput}
        />
      </Animated.View>

      <Animated.View
        style={{
          height: animatedHightHeader,
          opacity: animatedHeader,
        }}>
        <Header
          handleGoback={handleGoBack}
          headerTitle={infoUsers.user_friend.full_name}
          setOpenSearchMessage={openSearchMessage}
        />
      </Animated.View>

      {/* <Animated.View
        style={[{ height: animatedHightSearchMessage, opacity: animatedopenSearchMessage }, styles.topLine, styles.inpAction, styles.search]}
      >
        <FooterSearch
          keywork={keyword}
          idmessage={search.idMessageSearch}
          indexItemSelected={search.indexItemSelected}
          dataMessageSearch={chats}
          handleArrowUpDownSearchMessage={handleSearchMessageID}
        />
      </Animated.View> */}

      {/* {search.isOpentSearchMessage ?
      <View style={[styles.topLine, styles.inpAction, styles.search]}>
        <FooterSearch
          keywork={keyword}
          idmessage={search.idMessageSearch}
          indexItemSelected={search.indexItemSelected}
          dataMessageSearch={chats}
          handleArrowUpDownSearchMessage={handleSearchMessageID}
        />
      </View> : null} */}

      <View
        style={{
          position: 'relative',
          display: keyword.length > 1 && !isGotoDataSearch ? 'flex' : 'none',
        }}>
        {!isLoading ? (
          <LoadingBoxComponent />
        ) : (
          <>
            {chats.length > 0 ? (
              <SearchMessage
                handleSearchMessageID={handleSearchMessageID}
                chats={chats}
                keyworkFullwidth={keyworkFullwidth}
                keyworkHalfwidth={keyworkHalfwidth}
                totalResultSearch={totalResultSearch}
                roomID={infoRoom ? infoRoom.room_id : ''}
                keywork={keyword}
              />
            ) : (
              <>
                {isLoading ? (
                  <>
                    <Text style={{ padding: 10, textAlign: 'center' }}>
                      {`検索結果がありません`}
                    </Text>
                    <View key={'NotKeyworkSearch'} style={[styles.wrapperBox]}>
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
    </>
  );
};
const LoadingBoxComponent = memo(() => {
  return (
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
  );
});
export default IndividualChat;
const styles = StyleSheet.create({
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
  search: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10000
  }
});
