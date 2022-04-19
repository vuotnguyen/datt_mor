import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  FlatList,
  Pressable,
  Dimensions,
  TouchableNativeFeedback,
} from 'react-native';
import MESSAGES from '../../config/Messages';
import { ButtonIcon } from '../../components/buttons';
import AvatarRes from '../../components/common/Avatar';
import { Entypo, Feather, AntDesign } from '../../assets/icons';
import { IChat, User } from '../../models/chat';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import * as globalStyles from '../../styles';
import UserBoxItem from '../../components/organisms/UserBoxItem';
import * as apiUser from '../../services/user';
import { debounce } from 'lodash';
const screen = Dimensions.get('screen');

type Props = {
  selected: Array<User>;
  setSelected: (listItem: Array<User>) => void;
  // listUserOld?: Array<User>;
  listUserOld?: string[];
  myID?: string;
};
const SearchUser: React.FC<Props> = ({
  selected,
  setSelected,
  listUserOld,
  myID,
}) => {
  const [refresh, setrefresh] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [listUsers, setListUsers] = useState<Array<User>>([]);
  // const [usersFilter, setUsersFilter] = useState<Array<User>>([]);

  const scrollRef = useRef<ScrollView | any>();
  const refInputSearch = useRef<TextInput>(null);
  const flatlistRef = useRef<FlatList | any>();
  console.log('listUserOld', listUserOld);

  const filterUsersNotAccept = (arr: Array<User>) => {
    if (!listUserOld || listUserOld.length == 0) return arr;

    return arr.filter(user => {
      console.log('User ----  ', user.user_id);
      let idx = listUserOld.findIndex(id => id == user.user_id);
      if (idx !== -1) {
        return false;
      }
      return true;
    });
  };

  // console.log(listUserOld, 'list user old ???');
  /**
   *  fetch get list data
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res = await apiUser.getAllUsers();
      const resData: Array<User> = JSON.parse(JSON.stringify(res.data));
      // delete acc admin when create
      if (myID != null) setListUsers(resData.slice().filter(item => item.user_id !== myID));
      else setListUsers(resData);

    } catch (error) {
      console.log('error getlist chat', error);
    }
    setLoading(false);
  }, []);

  /**
   *  call get list data
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * refresh
   */
  const onRefresh = useCallback(() => {
    setrefresh(false);
    fetchData();
  }, []);

  /**
   *  search user
   *
   */
  const _handleSearch = useCallback((str: string) => {
    apiUser
      .getAllUsers(str.trim())
      .then(res => {
        const resDataConvert: Array<User> = JSON.parse(
          JSON.stringify(res.data),
        );
        // delete acc admin when create
        if (myID != null){
          setListUsers(resDataConvert.slice().filter(item => item.user_id !== myID));
        } else{
          setListUsers(resDataConvert);
        } 
      })
      .catch(error => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  /**
   *  handleOnChangeText
   */
  const handler = useCallback(debounce(_handleSearch, 1000), []);
  const handleOnChangeText = useCallback(
    (e: string) => {
      setKeyword(e);
      if (!loading) setLoading(true);
      handler(e);
    },
    [loading],
  );

  /**
   *  clear text search user
   *
   */
  const _handleClear = useCallback(() => {
    setKeyword('');
    fetchData();
  }, []);

  /**
   *  handle choose or remove user chat group
   *
   */
  const handleCheckedUser = (item: User) => {
    let arm = [...selected];
    let idx = arm.findIndex(m => m.user_id === item.user_id);
    if (idx !== -1) arm.splice(idx, 1);
    else {
      arm.push(item);
    }
    setSelected(arm);
  };

  const RenderChatBox = useCallback(() => {
    if (!(listUsers && listUsers?.length)) return;
    // return usersFilter.map((item, index) => {
    return filterUsersNotAccept(listUsers).map((item, index) => {
      let idx = selected.findIndex(u => u.user_id == item.user_id);
      return (
        <View key={index} style={[styles.wrapperBox, { overflow: 'hidden' }]}>
          <TouchableNativeFeedback onPress={() => handleCheckedUser(item)}>
            <View style={[styles.userBox, { paddingHorizontal: 10 }]}>
              <UserBoxItem item={item} selected={idx !== -1 ? true : false} />
            </View>
          </TouchableNativeFeedback>
        </View>
      );
    });
  }, [listUsers, selected]);
  return (
    <View style={{ position: 'relative', zIndex: 1 }}>
      <ScrollView
        nestedScrollEnabled={false}
        removeClippedSubviews={true}
        overScrollMode={'never'}
        scrollToOverflowEnabled={false}
        onResponderStart={Keyboard.dismiss}
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        stickyHeaderIndices={[0]}>
        {/* search user */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingTop: 5,
            paddingBottom: 5,
            backgroundColor: '#fff',
          }}>
          <View
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
            }}>
            <View style={[styles.inpWrapper, { height: 35 }]}>
              <TextInput
                ref={refInputSearch}
                placeholder={MESSAGES.CHAT.MSG_CHAT_TEXT_007}
                style={styles.input}
                value={keyword ? keyword : ''}
                numberOfLines={1}
                // editable={!loading}
                autoFocus={false}
                onSubmitEditing={() => _handleSearch(keyword)}
                onChangeText={handleOnChangeText}
              // onChangeText={searchUserHandle}
              />

              <ButtonIcon onPress={() => _handleClear()}>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    display: keyword ? 'flex' : 'none',
                  }}>
                  <AntDesign name={'close'} size={16} />
                </View>
              </ButtonIcon>
            </View>
          </View>
          <FlatList
            ref={flatlistRef}
            data={selected}
            overScrollMode={'never'}
            keyExtractor={(item, index) => `user_${index}`}
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              // paddingVertical: 10,
              // flex: 1,
            }}
            onContentSizeChange={() => {
              if (flatlistRef) flatlistRef.current.scrollToEnd();
            }}
            scrollToOverflowEnabled={false}
            renderItem={({ item }) => (
              <View
                style={{
                  marginHorizontal: 4,
                  // paddingVertical: 10,
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <View style={{ position: 'relative' }}>
                    <AvatarRes
                      uri={item.avatar ? item.avatar : null}
                      size={50}
                    />
                    <Pressable
                      style={styles.deleteDot}
                      onPress={() => {
                        handleCheckedUser(item);
                      }}>
                      <AntDesign name={'close'} size={10} color={'#fff'} />
                    </Pressable>
                  </View>
                </View>
                <View style={{ marginTop: 5 }}>
                  <Text style={{ textAlign: 'center' }}>
                    {item.full_name.length > 5
                      ? item.full_name.substr(0, 5) + '...'
                      : item.full_name}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        {loading ? (
          <LoadingGroup />
        ) : (
          <>
            {listUsers && listUsers.length > 0 ? (
              RenderChatBox()
            ) : (
              <View>
                {!loading && keyword.trim() ? (
                  <Text
                    style={[
                      globalStyles.text.subTitle,
                      {
                        textAlign: 'center',
                        fontWeight: 'normal',
                        height: screen.height / 2,
                        marginVertical: 15,
                      },
                    ]}>{`「${keyword.trim()}」に一致する結果はありませんでした。`}</Text>
                ) : (
                  // <LoadingGroup />
                  <Text
                    style={[
                      globalStyles.text.subTitle,
                      {
                        textAlign: 'center',
                        fontWeight: 'normal',
                        height: screen.height / 2,
                        marginVertical: 15,
                      },
                    ]}>
                    {/* No users available */}
                    ユーザが見つからない
                  </Text>
                )}
              </View>
            )}
          </>
        )}
        <View
          style={{ height: screen.height * 0.25, width: screen.width }}></View>
      </ScrollView>
    </View>
  );
};
const LoadingGroup = () => (
  <>
    <ChatBoxLoading />
    <ChatBoxLoading />
    <ChatBoxLoading />
    <ChatBoxLoading />
  </>
);
export default memo(SearchUser);
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarGroup: {},
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
  },
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  avatarUser: {
    width: screen.width * 0.15,
    height: screen.width * 0.15,
    borderRadius: (screen.width * 0.15) / 2,
  },
  iconBack: {
    position: 'absolute',
    left: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconNewGroup: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4.5,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{ translateY: -1 }, { translateX: 8 }],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inpWrapper: {
    // width: width,
    flex: 1,
    paddingHorizontal: 5,
    borderBottomColor: 'transparent',
    backgroundColor: 'rgba(230,230,230,0.5)',
    borderRadius: 10,
    paddingVertical: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {},
  input: {
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
