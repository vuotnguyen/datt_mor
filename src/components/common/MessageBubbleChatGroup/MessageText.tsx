import React, {memo, useMemo} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import Svg, {Path} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MESSAGES from '../../../config/Messages';
import {useDate} from '../../../hooks/date';
import {IMessageGroupChatReceiver, STATUS_MESSAGE} from '../../../models/chat';
import {InfoUser, InfoUserTmp} from '../../../models/user';
import {useAppSelector} from '../../../stories';
import {ButtonIcon} from '../../buttons';
import TwemojiText from '../EmojiIconText';
import {PopoverMessage} from '../ChatHelperComponents';
import {get} from 'lodash';
import {GetAllUserInfo} from '../../../stories/actions/infoallUser';
import {useDispatch} from 'react-redux';

const screen = Dimensions.get('screen');

const SvgTail: React.FC<{mine: boolean}> = memo(({mine}) => {
  return mine ? (
    <View style={[{position: 'absolute', top: 0, left: 0}]}>
      <Svg width="10" height="12" viewBox="0 0 7.803 11.131">
        <Path
          d="M105.641,407.656l2.2,10.741,1.056-2.377,2.187-2.265,2.2-1.669-1.942.46-1.172-.312-1.594-1.109Z"
          transform="translate(-105.543 -407.592)"
          stroke={'#E5E5E5'}
          fill={'#E5E5E5'}
          stroke-width="0.2"
        />
      </Svg>
    </View>
  ) : (
    <View style={{position: 'absolute', top: 0, right: 1}}>
      <Svg width="10" height="12" viewBox="0 0 7.703 10.74">
        <Path
          d="M0,10.741,2.2,0,3.255,2.377,5.442,4.641,7.7,6.678l-2-.828-1.172.313-.407.188-.405.187-.781.734Z"
          transform="translate(7.703 10.741) rotate(-180)"
          fill="#67E753"
        />
      </Svg>
    </View>
  );
});
const MessageText: React.FC<{
  messageItem: IMessageGroupChatReceiver;
  isFailLocal: boolean;
  mine: boolean;
  onRefeshSend: (mes: IMessageGroupChatReceiver) => void;
  keywork?: string;
  keyworkFullwidth?: string;
  keyworkHalfwidth?: string;
  idmessage?: string;
}> = memo(
  ({
    messageItem,
    isFailLocal,
    mine,
    onRefeshSend,
    keywork,
    keyworkFullwidth,
    keyworkHalfwidth,
    idmessage,
  }) => {
    const {getTime} = useDate();
    const dispatchThunk = useDispatch();
    const AllUserInfo = useAppSelector(state => state.dataAllUser.AllUserInfo);
    const {UserInfo} = useAppSelector(state => state.dataUser);
    // console.log(AllUserInfo, 'AllUserInfo');

    // get info user !!
    const getUserInfo = (id: string | null): InfoUser => {
      if (id) {
        return get(AllUserInfo, [id], InfoUserTmp);
      }
      return InfoUserTmp;
    };

    let readMessage = () => {
      if (
        messageItem &&
        messageItem.participants &&
        !messageItem.message.includes('SpecialMessage:')
      ) {
        let countRead = 0;
        messageItem.participants.map(m => {
          if (m.code_status === 2 && m.user_id !== messageItem.user_sender) {
            countRead++;
          }
        });
        return countRead;
      }
      return 0;
    };

    // React.useEffect(() => {
    //   const callback = () => {};
    //   dispatchThunk(GetAllUserInfo(callback, callback, callback));
    //   console.log('running !');
    // }, [AllUserInfo]);

    // SPECIAL MESSAGE !!!
    let MessageNotice = useMemo(() => {
      if (messageItem.message.includes('SpecialMessage:')) {
        let messageReplace = messageItem.message;
        messageReplace = messageReplace.replace('SpecialMessage: ', '');

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
        //'SpecialMessage: <id>USER#cbc5d229-afbc-4139-9e08-321a7234b102</id>が<id>USER#0ed7af9a-fbe0-47ae-9b46-002117b9439b</id>をグループから削除しました'
        idUser.map(id => {
          let user = getUserInfo(id);
          if (user.user_id) {
            messageReplace = messageReplace.replace(
              `<id>${id}</id>`,
              user.full_name,
            );
          } else {
            messageReplace = messageReplace.replace(
              `<id>${id}</id>>`,
              UserInfo.fullname,
            );
          }
        });
        return messageReplace;
      }
      // return 'Van test';
      return '';
    }, [messageItem]);

    return (
      <View
        style={[
          {display: 'flex'},
          mine ? styles.view_mine_message : styles.view_not_mine_message,
          mine ? {marginTop: 20} : {},
        ]}>
        {messageItem.message ? (
          <View
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            {/* status bar */}
            {!mine && isFailLocal && messageItem.filesLocal?.length == 0 ? (
              <ButtonIcon
                onPress={() => onRefeshSend(messageItem)}
                style={{marginBottom: 5, marginRight: 5}}>
                <View
                  style={{
                    paddingHorizontal: 3.5,
                    borderColor: 'rgba(0,0,0,0.6)',
                    borderWidth: 1,
                    borderRadius: 50,
                    paddingVertical: 3,
                  }}>
                  <Ionicons
                    name="refresh"
                    size={12}
                    style={{color: 'rgba(0,0,0,0.6)', fontWeight: 'bold'}}
                  />
                </View>
              </ButtonIcon>
            ) : null}
            {messageItem.message.includes('SpecialMessage:') ? (
              <View
                style={[
                  styles.cloud,
                  {
                    backgroundColor: '#E5E5E5',
                    maxWidth: screen.width * 0.9,
                    marginRight: 5,
                    borderRadius: 10,
                    position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                  }}>
                  <Text>
                    {messageItem.create_at
                      ? getTime(messageItem.create_at)
                      : isFailLocal
                      ? ''
                      : '...'}
                  </Text>
                </View>
                <TwemojiText
                  isMessage={true}
                  size={13}
                  keywordSearch={keywork}
                  keyworkFullwidth={keyworkFullwidth}
                  keyworkHalfwidth={keyworkHalfwidth}
                  idmessage={idmessage}
                  style={[
                    styles.text,
                    {
                      color: 'black',
                      fontSize: 13,
                      letterSpacing: 0.2,
                    },
                  ]}>
                  {MessageNotice}
                </TwemojiText>
              </View>
            ) : (
              <PopoverMessage messageItem={messageItem} mine={mine}>
                <View
                  style={[
                    styles.cloud,
                    {
                      backgroundColor: mine ? '#E5E5E5' : '#67E753',
                      maxWidth: screen.width * 0.7,
                      marginRight: 5,
                      minWidth: 40,
                      borderRadius: 25,
                      position: 'relative',
                    },
                  ]}>
                  {/* svg  */}
                  <SvgTail mine={mine} />
                  <TwemojiText
                    isMessage={true}
                    size={13}
                    keywordSearch={keywork}
                    keyworkFullwidth={keyworkFullwidth}
                    keyworkHalfwidth={keyworkHalfwidth}
                    idmessageSearch={idmessage}
                    idmessage={messageItem.id_message}
                    style={[
                      styles.text,
                      {
                        color: 'black',
                        fontSize: 13,
                        letterSpacing: 0.2,
                      },
                    ]}>
                    {messageItem.message}
                  </TwemojiText>
                </View>
              </PopoverMessage>
            )}
          </View>
        ) : null}
        {/* createAt time */}
        {!messageItem.message.includes('SpecialMessage:') ? (
          <View style={{marginRight: 5, marginBottom: 5}}>
            {messageItem.files && !(messageItem.files?.length > 0) ? (
              <>
                <View>
                  <Text
                    style={[
                      styles.createAt,
                      !mine ? {textAlign: 'right'} : {},
                    ]}>
                    {!mine
                      ? readMessage() !== 0
                        ? `${
                            MESSAGES.COMMON.MSG_COMMON_TEXT_001
                          } ${readMessage()}`
                        : ' '
                      : null}
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.createAt,
                      !mine ? {textAlign: 'right'} : {},
                    ]}>
                    {messageItem.create_at
                      ? getTime(messageItem.create_at)
                      : isFailLocal
                      ? ''
                      : '...'}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  },
);
export default MessageText;
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
