import React, {
    memo
} from 'react';
import MessageBubble, {
    TYPE_MESSAGES_RENDER
} from '../../components/common/MessageBubble';
import {
    IChat, IMessageReceiver
} from '../../models/chat';

interface Props {
    item: IMessageReceiver;
    index: number;
    handleResendMessage: (mess: IMessageReceiver) => void;
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
        index,
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
                idmessage={idmessage}
                keyworkFullwidth={keyworkFullwidth}
                keyworkHalfwidth={keyworkHalfwidth}
            />
        </>
    ),
);

export default memo(MessageItem);