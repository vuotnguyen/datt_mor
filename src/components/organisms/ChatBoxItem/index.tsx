import React, {memo, useMemo} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import MESSAGES from '../../../config/Messages';
import {useDate} from '../../../hooks/date';
import {
  IChat,
  IGroupInfo,
  IGroupInfoTemp,
  RoomChatType,
} from '../../../models/chat';
import {useAppSelector} from '../../../stories';
import * as stylesGlobal from '../../../styles';
import {get} from 'lodash';
import AvatarRes from '../../common/Avatar';
import AvatarGroup from '../../common/Avatar/avatarSetting';
import Badge, {BadgeText} from '../../common/Badge';
import {InfoUser, InfoUserTmp} from '../../../models/user';
const screen = Dimensions.get('screen');
interface Props {
  item: IChat;
  // groupName?: string;
  // avatarGroup?: string;
}
const ChatBoxItem = ({item}: Props) => {
  const AllUserInfo = useAppSelector(state => state.dataAllUser.AllUserInfo);
  // const AllGroupInfo = useAppSelector(state => state.dataAllGroup.AllGroupInfo);

  const {UserInfo} = useAppSelector(state => state.dataUser);

  const getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      return get(AllUserInfo, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };

  // const groupInfo = React.useMemo(() => {
  //   const group = get(AllGroupInfo, [item.room_id], IGroupInfoTemp);
  //   if (item.avatar_group) {
  //     group.avatar_group = item.avatar_group;
  //   }
  //   if (item.group_name) {
  //     group.group_name = item.group_name;
  //   }

  //   return group;
  // }, [AllGroupInfo, item]);

  const userFriend: InfoUser = getUserInfo(get(item, 'user_friend', ''));

  const userLogin: InfoUser = getUserInfo(get(item, 'user_login', ''));

  const userSender: InfoUser = getUserInfo(get(item, 'user_sender', ''));

  const admin: InfoUser = getUserInfo(get(item, 'admin_id', ''));

  const {getCreateAtChatBoxView} = useDate();

  let isUnReadMessage = useMemo(() => {
    return item.unread_message_stack && item.unread_message_stack > 0
      ? true
      : false;
    return false;
  }, [item]);
  const getNameLimit = (name: string | null) => {
    if (name) return name.length > 29 ? name.substr(0, 29) + '...' : name;
    return '';
  };

  let messagesText = useMemo(() => {
    if (item.message) {
      if (
        item.message.includes('があなたをグループに招待しました') &&
        item.user_login == item.admin_id
      ) {
        return 'グループが作成されました';
      } else if (item.message.includes('SpecialMessage:')) {
        let messageReplace = item.message;
        let indices = [];
        let i = -1;
        let idUser: Array<string> = [];
        while ((i = messageReplace.indexOf('<id>', i + 1)) >= 0)
          indices.push(i);
        indices.map(idx => {
          idUser.push(
            messageReplace.slice(idx + 4, messageReplace.indexOf('</id>', idx)),
          );
        });
        messageReplace = messageReplace.replace('SpecialMessage: ', '');
        idUser.map(id => {
          let user = getUserInfo(id);
          if (user.user_id) {
            messageReplace = messageReplace.replace(
              `<id>${id}</id>`,
              user.full_name,
            );
          } else {
            messageReplace = messageReplace.replace(
              `<id>${id}</id>`,
              UserInfo.fullname,
            );
          }
        });
        return messageReplace;
      } else {
        return item.message;
      }
    } else {
      return MESSAGES.CHAT.MSG_CHAT_TEXT_002;
    }
  }, [item.message]);

  return (
    <>
      <View style={{flex: 0.7}}>
        {/* avatar user */}
        {item.is_group == RoomChatType.INDIVIDUAL ? (
          <AvatarRes
            sizeIconLoad={16}
            uri={userFriend.avatar}
            size={50}
            showIconload={false}
          />
        ) : (
          <AvatarGroup
            sizeIconLoad={16}
            uri={item.avatar_group}
            size={50}
            showIconload={true}
          />
        )}
      </View>
      <View style={{flex: 3}}>
        {/* name user */}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            // marginBottom: 5,
          }}>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {
                flex: 1,
                fontWeight: '700',
                fontSize: 14,
                marginBottom: 7,
              },
            ]}>
            {getNameLimit(
              item.is_group == RoomChatType.INDIVIDUAL
                ? userFriend.full_name
                : item.group_name,
            )}
          </Text>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {
                color: '#ACB3BF',
                fontWeight: 'normal',
                fontSize: 11,
              },
            ]}>
            {item.create_at ? getCreateAtChatBoxView(item.create_at) : null}
          </Text>
        </View>
        <View
          style={{
            // flex: 1,
            position: 'relative',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {
                color: '#ACB3BF',
                fontWeight: 'normal',
                width: screen.width / 1.5,
                fontSize: 12,
              },
              isUnReadMessage
                ? {
                    fontWeight: '700',
                    color: '#000',
                  }
                : {},
            ]}
            numberOfLines={1}>
            {messagesText.length > 40
              ? messagesText.trim().substr(0, 40) + '...'
              : messagesText.trim()}
            {/* {messagesText.length > 40
              ? messagesText.trim().substr(0, 40) + '...'
              : messagesText.trim()} */}

            {/* {item.user_login.special_message} */}
          </Text>

          {item.is_group &&
          userLogin.user_id !== admin.user_id &&
          // item.user_login.is_join == false ? (
          false ? (
            <View style={[styles.dot, {zIndex: 10}]}>
              <BadgeText
                type={'success'}
                count={'N'}
                // count={999}
                fontSize={11}
                height={22}
                width={16}
              />
            </View>
          ) : null}
          {isUnReadMessage ? (
            <View style={[styles.dot, {zIndex: 10}]}>
              <Badge
                type={'success'}
                count={get(item, ['unread_message_stack'], 0)}
                // count={999}
                fontSize={11}
                height={22}
                width={16}
              />
            </View>
          ) : null}
        </View>
      </View>
    </>
  );
};

export default ChatBoxItem;
const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    right: 0,
  },
});
