import React, {memo, useMemo} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  ImageBackground,
} from 'react-native';
import {useDate} from '../../../hooks/date';
import {IChatResutlMessageSearch} from '../../../models/chat';
import {useAppSelector} from '../../../stories';
import * as stylesGlobal from '../../../styles';
import AvatarGroup from '../../common/Avatar/avatarSetting';
import reactStringReplace from 'react-string-replace';
import {emojiUnicode} from '../../common/EmojiIconText/util';
import regexifyString from 'regexify-string';
import {InfoUser, InfoUserTmp} from '../../../models/user';
import {get} from 'lodash';
const screen = Dimensions.get('screen');
const EMOJI_REGEX = /([^\u3000-\u303F]\[^\u3040-\u309F]\[^\u30A0-\u30FF]\[^\uFF00-\uFFEF]\[^\u4E00-\u9FAF]\[^\u2605-\u2606]\[^\u2190-\u2195]\[^\u203B]|\ud83e[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83c[\ud000-\udfff])/g;

interface Props {
  item: IChatResutlMessageSearch;
  keyworkFullwidth: string;
  keyworkHalfwidth: string;
}
const ChatBoxItemSearchMessage: React.FC<Props> = ({
  item,
  keyworkFullwidth,
  keyworkHalfwidth,
}) => {
  const {AllUserInfo} = useAppSelector(state => state.dataAllUser);
  const {UserInfo} = useAppSelector(state => state.dataUser);
  const {getCreateAtChatBoxView} = useDate();
  const highlightMessage: any[] = [];

  const getUserInfo = (id: string | null): InfoUser => {
    if (id) {
      return get(AllUserInfo, [id], InfoUserTmp);
    }
    return InfoUserTmp;
  };

  let infoUser = useMemo(() => {
    if (item) {
      return getUserInfo(item.user_sender);
    }
    return null;
  }, [item]);

  const parts = reactStringReplace(item.message, EMOJI_REGEX, (emoji, i) => (
    <View key={`emoji-view-${i}`} style={styles.emoij}>
      <ImageBackground
        testID={emoji}
        style={styles.emoijBackgroud}
        resizeMethod={'auto'}
        resizeMode={'center'}
        source={{
          uri: `https://twemoji.maxcdn.com/2/72x72/${emojiUnicode(emoji)}.png`,
        }}
      />
    </View>
  ));

  let messageSearch = useMemo(() => {
    if (item && item.message) {
      parts.map(async part => {
        if (typeof part === 'string') {
          const regexKeywork = part.includes(keyworkFullwidth)
            ? keyworkFullwidth
            : keyworkHalfwidth;
          const regex = new RegExp(`${regexKeywork}`, `gim`);
          const result = regexifyString({
            pattern: regex,
            decorator: (match, index) => {
              return (
                <Text key={index} style={styles.messageHighLight}>
                  {match}
                </Text>
              );
            },
            input: part,
          });
          highlightMessage.push(result, '');
        } else {
          highlightMessage.push(part, '');
        }
      });
      return highlightMessage ? highlightMessage : item.message;
    }
    return null;
  }, [item]);

  return (
    <>
      <View style={styles.avatar}>
        {/* avatar user */}
        <AvatarGroup
          sizeIconLoad={16}
          uri={infoUser ? infoUser.avatar : null}
          size={50}
          showIconload={true}
        />
      </View>
      <View style={styles.viewUserName}>
        {/* name user */}
        <View style={styles.viewTitleUsername}>
          <Text style={[stylesGlobal.text.subTitle, styles.titleUsername]}>
            {infoUser?.full_name}
          </Text>
          <Text style={[stylesGlobal.text.subTitle, styles.createAtMessage]}>
            {item.message && item.create_at
              ? getCreateAtChatBoxView(item.create_at)
              : null}
          </Text>
        </View>
        <View style={styles.viewMessage}>
          <Text
            style={[stylesGlobal.text.subTitle, styles.textMessage]}
            numberOfLines={1}>
            {messageSearch}
          </Text>
        </View>
      </View>
    </>
  );
};

export default memo(ChatBoxItemSearchMessage);
const styles = StyleSheet.create({
  textMessage: {
    color: '#000000',
    fontWeight: 'normal',
    width: screen.width / 1.5,
    fontSize: 12,
  },
  viewUserName: {
    flex: 3,
  },
  emoij: {
    paddingTop: Platform.OS === 'ios' ? (true ? 4 : 6) : true ? 8 : 0,
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
  },
  emoijBackgroud: {
    width: 13,
    height: 13,
    alignItems: 'center',
  },
  messageHighLight: {
    color: '#00CC00',
  },
  viewMessage: {
    position: 'relative',
    alignItems: 'center',
    flexDirection: 'row',
  },
  createAtMessage: {
    color: '#ACB3BF',
    fontWeight: 'normal',
    fontSize: 11,
  },
  titleUsername: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 7,
  },
  viewTitleUsername: {
    display: 'flex',
    flexDirection: 'row',
  },
  avatar: {
    flex: 0.7,
  },
});
