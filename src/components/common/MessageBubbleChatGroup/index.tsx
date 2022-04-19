import React, { memo } from 'react';
import { Text, View } from 'react-native';
import MESSAGES from '../../../config/Messages';
import { useDate } from '../../../hooks/date';
import { IChat, IMessageGroupChatReceiver } from '../../../models/chat';
import MessageItem from './MessageItem';
import NoticeMessage from './NoticeMessage';
export type TYPE_MESSAGES_RENDER = 'SUCCESS' | 'SENDING' | 'ERROR' | 'UNSEND';
interface Props {
  item: IMessageGroupChatReceiver;
  onRefeshSend: (messageItem: IMessageGroupChatReceiver) => void;
  infoRoom: IChat;
  typeMessageRender: TYPE_MESSAGES_RENDER;
  showDate: boolean;
  isConnected: boolean;
  keywork?: string;
  keyworkFullwidth?: string;
  keyworkHalfwidth?: string;
  idmessage?: string;
}
const MessageBubble: React.FC<Props> = ({
  item,
  onRefeshSend,
  infoRoom,
  typeMessageRender,
  showDate,
  isConnected,
  keywork,
  keyworkFullwidth,
  keyworkHalfwidth,
  idmessage
}) => {
  const { getCreateAtHead } = useDate();
  let isUnRead =
    infoRoom?.user_login !== item.user_sender && item.status === 1;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={[
          { height: showDate ? undefined : 0 },
          showDate ? {} : { display: 'none' },
        ]}>
        <NoticeMessage>
          <Text
            style={[
              { textAlign: 'center', fontSize: 10 },
              isUnRead ? { fontWeight: 'bold' } : {},
            ]}>
            {isUnRead
              ? MESSAGES.CHAT.MSG_CHAT_TEXT_009
              : item.create_at
                ? getCreateAtHead(item.create_at)
                : null}
          </Text>
        </NoticeMessage>
      </View>

      <MessageItem
        onRefeshSend={onRefeshSend}
        messageItem={item}
        infoRoom={infoRoom}
        typeMessageRender={typeMessageRender}
        isConnected={isConnected}
        keywork={keywork}
        keyworkFullwidth={keyworkFullwidth}
        keyworkHalfwidth={keyworkHalfwidth}
        idmessage={idmessage}
      />
    </View>
  );
};

export default memo(MessageBubble);
