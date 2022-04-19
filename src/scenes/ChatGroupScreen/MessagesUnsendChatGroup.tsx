import {NetInfoStateType} from '@react-native-community/netinfo';
import React, {memo} from 'react';
import {View} from 'react-native';
import {IChat, IMessageGroupChatReceiver} from '../../models/chat';
import MessageItem from './MessageItemChatGroup';

interface Props {
  messagesUnsend: Array<IMessageGroupChatReceiver>;
  keyword?: string;
  idmessage?: string;
  infoRoom: IChat;
  connection: {
    type: NetInfoStateType;
    isConnected: boolean | null;
  };
  handleResendMessageMessage: (mess: IMessageGroupChatReceiver) => void;
}
const MessagesCurrent: React.FC<Props> = memo(
  ({
    messagesUnsend,
    keyword,
    infoRoom,
    connection,
    handleResendMessageMessage,
  }) => (
    <>
      {messagesUnsend.map((item, index) => {
        return (
          <MessageItem
            key={item.id_local?.toString()}
            item={item}
            index={index}
            isShow={false}
            handleResendMessage={handleResendMessageMessage}
            infoRoom={infoRoom}
            connection={connection.isConnected}
            typeMessageRender={'UNSEND'}
          />
        );
      })}
    </>
  ),
);

export default memo(MessagesCurrent);
