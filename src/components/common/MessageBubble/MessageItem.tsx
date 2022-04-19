import React, {memo, useEffect, useMemo, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {Popover, Button, Box, Center, HStack} from 'native-base';
import {IChat, IMessageReceiver} from '../../../models/chat';
import {useAppDispatch, useAppSelector} from '../../../stories';
import MessageText from './MessageText';
import AvatarUser from './AvatarUser';
import FileRender from './FileRender';
import {FontAwesome5, Ionicons} from '../../../assets/icons';
import {TYPE_MESSAGES_RENDER} from '.';
import {get} from 'lodash';
import {InfoUser, InfoUserTmp} from '../../../models/user';

interface Props {
  messageItem: IMessageReceiver;
  infoRoom: IChat | null;
  onRefeshSend: (messageItem: IMessageReceiver) => void;
  typeMessageRender: TYPE_MESSAGES_RENDER;
  isConnected: boolean;
  keywork?: string;
  keyworkFullwidth?: string;
  keyworkHalfwidth?: string;
  idmessage?: string;
}
const MessageItem: React.FC<Props> = ({
  messageItem,
  infoRoom,
  onRefeshSend,
  typeMessageRender,
  isConnected,
  keywork,
  keyworkFullwidth,
  keyworkHalfwidth,
  idmessage,
}) => {
  const {user_sender, files, filesLocal} = messageItem;
  let mine = useMemo(() => {
    if (infoRoom?.user_login === user_sender) return false;
    return true;
  }, [messageItem]);

  const [isFailLocal, setisFailLocal] = useState<boolean>(false);
  const AllUserInfo = useAppSelector(state => state.dataAllUser.AllUserInfo);
  const getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      return get(AllUserInfo, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };

  let UserMessage: InfoUser | null = useMemo(() => {
    if (infoRoom && infoRoom.user_friend && infoRoom.user_login) {
      const userFriend = getUserInfo(infoRoom.user_friend);
      const userLogin = getUserInfo(infoRoom.user_login);
      if (mine) {
        return userFriend;
      }
      return userLogin;
    }
    return null;
  }, [infoRoom, mine, AllUserInfo]);
  useEffect(() => {
    let result = false;
    if (typeMessageRender === 'UNSEND') {
      result = result || true;
    }
    if (typeMessageRender === 'SENDING' && !isConnected) {
      result = result || true;
    }
    setisFailLocal(result);
  }, [isConnected]);

  return (
    <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
      <View style={{flex: 1, flexShrink: 0}}>
        <React.Fragment>
          {/* message */}
          <View
            style={[
              styles.message,
              mine ? styles.mine : styles.not_mine,
              {
                marginHorizontal: 5,
              },
            ]}>
            {/* avatar */}
            {infoRoom ? (
              <AvatarUser
                avatar={UserMessage ? UserMessage.avatar : null}
                mine={mine}
              />
            ) : null}

            {/* bubble message */}
            <MessageText
              messageItem={messageItem}
              mine={mine}
              onRefeshSend={onRefeshSend}
              isFailLocal={isFailLocal}
              keywork={keywork}
              keyworkFullwidth={keyworkFullwidth}
              keyworkHalfwidth={keyworkHalfwidth}
              idmessage={idmessage}
            />
          </View>

          {/* render list image */}
          <View
            style={{
              marginTop: 10,
              marginBottom:
                files &&
                filesLocal &&
                (files.length > 0 || filesLocal.length > 0)
                  ? 10
                  : 0,
            }}>
            <FileRender
              isFailLocal={isFailLocal}
              messageItem={messageItem}
              mine={mine}
              userMessage={UserMessage}
              onRefeshSend={onRefeshSend}
            />
          </View>
        </React.Fragment>
      </View>
    </View>
  );
};

export default memo(MessageItem);
const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    marginVertical: moderateScale(1, 2),
  },
  mine: {},
  not_mine: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  cloud: {
    maxWidth: moderateScale(250, 2),
    paddingHorizontal: moderateScale(10, 2),
    paddingTop: moderateScale(5, 2),
    paddingBottom: moderateScale(7, 2),
    borderRadius: 5,
  },
  text: {
    // paddingTop: 3,
    // borderColor: 'red',
    // borderWidth: 1,
    fontSize: 17,
    lineHeight: 22,
  },
  arrow_container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    flex: 1,
  },
  arrow_left_container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  arrow_right_container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  arrow_left: {
    left: 0,
  },
  arrow_right: {
    right: 0,
  },
  view_mine_message: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  view_not_mine_message: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  createAt: {
    color: '#A29F9F',
    fontSize: 10,
  },
});
