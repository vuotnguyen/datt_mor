import React, {
    memo
} from 'react';
import MessageBubble, {
    TYPE_MESSAGES_RENDER
} from '../../components/common/MessageBubbleChatGroup';
import {
    IChat, IMessageGroupChatReceiver
} from '../../models/chat';

interface Props {
    item: IMessageGroupChatReceiver;
    handleResendMessage: (mess: IMessageGroupChatReceiver) => void;
    infoRoom: IChat;
    connection: boolean | null;
    isShow: boolean;
    typeMessageRender: TYPE_MESSAGES_RENDER;
    keywork?: string;
    keyworkFullwidth?: string;
    keyworkHalfwidth?: string;
    idmessage?: string;
}
const MessageItem: React.FC<Props> = memo(
    ({
        item,
        handleResendMessage,
        infoRoom,
        connection,
        typeMessageRender,
        isShow,
        keywork,
        keyworkFullwidth,
        keyworkHalfwidth,
        idmessage
    }) => (
        <>
            <MessageBubble
                onRefeshSend={handleResendMessage}
                item={item}
                showDate={isShow}
                infoRoom={infoRoom}
                isConnected={connection ? true : false}
                typeMessageRender={typeMessageRender}
                keywork={keywork}
                keyworkFullwidth={keyworkFullwidth}
                keyworkHalfwidth={keyworkHalfwidth}
                idmessage={idmessage}
            />
        </>
    ),
);

export default memo(MessageItem);