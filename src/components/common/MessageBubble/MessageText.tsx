import React, {memo} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {moderateScale} from 'react-native-size-matters';
import {IMessageReceiver, STATUS_MESSAGE} from '../../../models/chat';
import {useDate} from '../../../hooks/date';
import {useChatContext} from '../../../hooks/chat';
import MESSAGES from '../../../config/Messages';
import {ButtonIcon} from '../../buttons';
import {FontAwesome5, Ionicons} from '../../../assets/icons';
import TwemojiText from '../EmojiIconText';
import {Button, HStack, Popover} from 'native-base';
const screen = Dimensions.get('screen');
import {PopoverMessage} from '../ChatHelperComponents';
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
  messageItem: IMessageReceiver;
  isFailLocal: boolean;
  mine: boolean;
  onRefeshSend: (mes: IMessageReceiver) => void;
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
    // const ChannelContext = useChannelContext();
    // const chatContext = useChatContext();
    // if (!ChannelContext || !chatContext) return null;
    const {getTime} = useDate();

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
                  keywordSearch={keywork}
                  keyworkFullwidth={keyworkFullwidth}
                  keyworkHalfwidth={keyworkHalfwidth}
                  idmessageSearch={idmessage}
                  idmessage={messageItem.id_message}
                  size={13}
                  style={[
                    styles.text,
                    {
                      color: 'black',
                      fontSize: 13,
                      letterSpacing: 0.2,
                      textAlign: 'center',
                    },
                  ]}>
                  {messageItem.message}
                </TwemojiText>
              </View>
            </PopoverMessage>
          </View>
        ) : null}
        {/* createAt time */}
        <View style={{marginRight: 5, marginBottom: 5}}>
          {messageItem.files && !(messageItem.files?.length > 0) ? (
            <>
              <View>
                <Text
                  style={[styles.createAt, !mine ? {textAlign: 'right'} : {}]}>
                  {!mine
                    ? STATUS_MESSAGE.SEEN === messageItem.status
                      ? MESSAGES.COMMON.MSG_COMMON_TEXT_001
                      : ''
                    : null}
                </Text>
              </View>
              <View>
                <Text
                  style={[styles.createAt, !mine ? {textAlign: 'right'} : {}]}>
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
