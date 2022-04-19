import React, {memo, useCallback} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {useAppSelector} from '../../stories';
import MESSAGES from '../../config/Messages';
import * as globalStyles from '../../styles';
import ChatBoxItem from '../../components/organisms/ChatBoxItem';
import ChatBoxLoading from '../../components/organisms/ChatBoxItem/ChatBoxLoading';
import {IChat} from '../../models/chat';
import {useNavigation} from '@react-navigation/native';
import {RootStackNavigationProp} from '../../navigations/RootStack';

const {height} = Dimensions.get('screen');

const LoadingBox = memo(() => (
  <>
    <ChatBoxLoading />
    <ChatBoxLoading />
    <ChatBoxLoading />
    <ChatBoxLoading />
  </>
));

const ListChats: React.FC<{
  loading: boolean;
}> = memo(({loading}) => {
  if (loading) {
    return (
      <View style={{display: loading ? 'flex' : 'none'}}>
        <LoadingBox />
      </View>
    );
  }
  const navigation = useNavigation<RootStackNavigationProp>();
  const handleOnpress = (item: IChat) => {
    if (item.is_group) {
      navigation.push('ChatGroup', {
        infoRoom: item,
        isRouteGroupChat: false,
      });
    } else {
      navigation.push('IndividualChat', {infoRoom: item});
    }
  };

  const chats = useAppSelector(state => state.dataChat.chat_rooms);

  const RenderChatBox = useCallback(() => {
    if (!(chats && chats?.length)) {
      return;
    }
    return chats
      .sort((a, b) => {
        let createAtA = new Date(a.create_at);
        let createAtB = new Date(b.create_at);
        return createAtA > createAtB ? -1 : createAtA < createAtB ? 1 : 0;
      })
      .map((item, index) => {
        return (
          <View key={index} style={[styles.wrapperBox, {overflow: 'hidden'}]}>
            <TouchableNativeFeedback onPress={() => handleOnpress(item)}>
              <View style={[styles.userBox, {paddingHorizontal: 10}]}>
                <ChatBoxItem item={item} />
              </View>
            </TouchableNativeFeedback>
          </View>
        );
      });
  }, [chats]);

  return (
    <>
      <View style={{display: 'flex'}}>
        <View style={{flex: 1}}>
          {chats && chats.length > 0 ? (
            RenderChatBox()
          ) : (
            <View>
              <Text
                style={[
                  globalStyles.text.subTitle,
                  {
                    textAlign: 'center',
                    fontWeight: 'normal',
                    height: height / 2,
                    marginVertical: 15,
                  },
                ]}>
                {MESSAGES.CHAT.MSG_CHAT_TEXT_001}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
});
export default ListChats;
const screen = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
});
