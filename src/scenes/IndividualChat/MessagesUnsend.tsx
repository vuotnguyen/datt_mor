import { NetInfoStateType } from '@react-native-community/netinfo';
import React, {
    memo
} from 'react';
import {
    View
} from 'react-native';
import {
    IChat, IMessageReceiver
} from '../../models/chat';
import MessageItem from './MessageItem';

interface Props {
    messagesUnsend: Array<IMessageReceiver>;
    keyword?: string;
    idmessage?: string;
    infoRoom: IChat;
    connection: {
        type: NetInfoStateType;
        isConnected: boolean | null;
    };
    handleResendMessageMessage: (mess: IMessageReceiver) => void;
}
const MessagesCurrent: React.FC<Props> = memo(
    ({
        messagesUnsend,
        keyword,
        infoRoom,
        connection,
        handleResendMessageMessage
    }) => (

        <>

            {
                messagesUnsend.map((item, index) => {
                    return (
                        <MessageItem
                            key={`messagesCurrent_${index}_${new Date().getTime()}`.toString()}
                            item={item}
                            index={index}
                            isShow={false}
                            handleResendMessage={handleResendMessageMessage}
                            infoRoom={infoRoom}
                            connection={connection.isConnected}
                            typeMessageRender={'UNSEND'}
                        />
                    );
                })
            }
        </>
    ),
);

export default memo(MessagesCurrent);