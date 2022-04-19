import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ButtonIcon} from '../../components/buttons';
import ChatBoxItem from '../../components/organisms/ChatBoxItem';
import {IChat, IChatRes, RoomChatType} from '../../models/chat';
import {apiGetListChats} from '../../services/chat';
import MESSAGES from '../../config/Messages';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {debounce} from 'lodash';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useAppSelector} from '../../stories';
const {width, height} = Dimensions.get('screen');

const SearchScreen = (): JSX.Element => {
  const [chats, setChats] = useState<Array<IChat>>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const refInput = useRef<TextInput>(null);
  const {goBack, push} = useNavigation();

  const AllInfoGroup = useAppSelector(state => state.dataAllGroup.AllGroupInfo);
  const _handleSearch = (str: string) => {
    if (str.trim() && str !== ' ') {
      apiGetListChats(str.trim())
        .then(res => {
          const resDataConvert: Array<IChatRes> = JSON.parse(
            JSON.stringify(res.data),
          );
          let arr: Array<IChat> = resDataConvert.map(item => {
            let result: IChat = {
              ...item,
              admin_id: '',
              participants: [],
              avatar_group: '',
              group_name: '',
            };
            if (item.is_group !== RoomChatType.INDIVIDUAL) {
              const info = AllInfoGroup[item.room_id];
              if (info) {
                result.admin_id = info.admin_id;
                result.participants = info.participants_id;
                result.avatar_group = info.avatar_group;
                result.group_name = info.group_name;
              }
            }
            return result;
          });
          setChats(arr);
        })
        .catch(err => {
          console.log('apiGetListChats error', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const _handleClear = useCallback(() => {
    setKeyword('');
    setChats([]);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handler = useCallback(debounce(_handleSearch, 1000), []);
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        setLoading(true);
      }
      handler(keyword);
    }, [keyword]),
  );

  const RenderChatBox = useCallback(() => {
    if (!chats || chats.length === 0) {
      return;
    }
    return chats.map((item, index) => (
      <View key={index} style={[styles.wrapperBox, {overflow: 'hidden'}]}>
        <TouchableNativeFeedback
          onPress={() => {
            if (item.is_group) {
              push('ChatGroup', {
                infoRoom: item,
                isRouteGroupChat: false,
              });
            } else {
              push('IndividualChat', {infoRoom: item});
            }
          }}>
          <View style={[styles.userBox, {paddingHorizontal: 0}]}>
            <ChatBoxItem item={item} />
          </View>
        </TouchableNativeFeedback>
      </View>
    ));
  }, [chats]);

  return (
    <SafeAreaView
      style={{position: 'relative', flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={{paddingHorizontal: 10}}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <View style={{paddingTop: 10, backgroundColor: '#fff'}}>
          <View
            style={{
              borderBottomColor: '#fff',
              borderColor: '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{marginHorizontal: 2}}>
              <ButtonIcon
                onPress={() => {
                  Keyboard.dismiss();
                  goBack();
                }}>
                <View style={{paddingHorizontal: 7, paddingVertical: 7}}>
                  <Ionicons name={'chevron-back'} size={25} />
                </View>
              </ButtonIcon>
            </View>
            <View style={[styles.inpWrapper, {height: 35}]}>
              <TextInput
                ref={refInput}
                placeholder={MESSAGES.CHAT.MSG_CHAT_TEXT_007}
                style={styles.input}
                value={keyword ? keyword : ''}
                numberOfLines={1}
                autoFocus={true}
                onSubmitEditing={() => _handleSearch(keyword)}
                onChangeText={setKeyword}
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
        </View>
        <TouchableWithoutFeedback
          style={{flex: 1}}
          onPress={Keyboard.dismiss}
          accessible={false}>
          {/* List chat search */}
          <ScrollView
            style={{flex: 1}}
            nestedScrollEnabled={false}
            removeClippedSubviews={true}
            onResponderStart={() => {
              Keyboard.dismiss();
            }}>
            {keyword.trim() ? (
              loading ? (
                <>
                  <ChatBoxLoading />
                  <ChatBoxLoading />
                  <ChatBoxLoading />
                  <ChatBoxLoading />
                </>
              ) : chats.length > 0 ? (
                RenderChatBox()
              ) : (
                <Text style={{padding: 10, textAlign: 'center'}}>
                  {!loading
                    ? `「${keyword.trim()}」に一致する結果はありませんでした。`
                    : null}
                </Text>
              )
            ) : null}
            <View style={{height: height * 0.15, width: width}} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
  },
  inpWrapper: {
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
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
});
export default SearchScreen;
