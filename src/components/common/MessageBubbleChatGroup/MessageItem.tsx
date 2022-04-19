import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { TYPE_MESSAGES_RENDER } from '.';
import { IChat, IMessageGroupChatReceiver } from '../../../models/chat';
import { useAppDispatch, useAppSelector } from '../../../stories';
import AvatarUser from './AvatarUser';
import FileRender from './FileRender';
import MessageText from './MessageText';
import {InfoUser, InfoUserTmp} from '../../../models/user';
import {get} from 'lodash';

interface Props {
  messageItem: IMessageGroupChatReceiver;
  infoRoom: IChat | null;
  onRefeshSend: (messageItem: IMessageGroupChatReceiver) => void;
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
  idmessage
}) => {
  const {
    user_sender,
    files,
    filesLocal,
    participants,
    message
  } = messageItem;
  const { AllUserInfo } = useAppSelector(state => state.dataAllUser);
  const { UserInfo } = useAppSelector(state => state.dataUser);

  const getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      //console.log('id', id);

      return get(AllUserInfo, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };

  let mine = useMemo(() => {
    if (infoRoom?.user_login === user_sender) return false;
    return true;
  }, [messageItem]);

  const [isFailLocal, setisFailLocal] = useState<boolean>(false);
  let UserMessage = useMemo(() => {
    if (infoRoom) {
      //let idx = AllUserInfo.findIndex(m => m.id === user_sender);
      const uerInfo: InfoUser = getUserInfo(user_sender);
      return uerInfo;
      // if (idx !== -1) {
      //   return AllUserInfo[idx]
      // }
      // else {
      //   return {
      //     id: UserInfo.id,
      //     avatar: UserInfo.avatar,
      //     username: UserInfo.username,
      //     fullname: UserInfo.fullname,
      //     email: '',
      //     address: '',
      //     create_at: '',
      //     special_message: '',
      //     is_join: false
      //   };
      // }
    }
    return null;
  }, [infoRoom, messageItem]);
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
    <View style={{ flex: 1 }}>
      {/* message */}
      {
        message.includes("SpecialMessage:") ?
          <View>
            <View
              style={[
                styles.message,
                {
                  marginHorizontal: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>

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
            <View
              style={{
                marginTop: 5,
                marginBottom: 10
              }}>
            </View>
          </View>
          :
          <View>
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
                  avatar={ UserMessage ? UserMessage.avatar : null}
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
                marginTop: 5,
                marginBottom:
                  files && filesLocal && (files.length > 0 || filesLocal.length > 0)
                    ? 5
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
          </View>
      }
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
