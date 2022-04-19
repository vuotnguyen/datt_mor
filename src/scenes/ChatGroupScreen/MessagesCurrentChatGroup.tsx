import { NetInfoStateType } from '@react-native-community/netinfo';
import React, {
    memo
} from 'react';
import {
    View, Text
} from 'react-native';
import {
    IChat, IMessageGroupChatReceiver
} from '../../models/chat';
import MessageItem from './MessageItemChatGroup';

interface Props {
    messagesCurrent: Array<IMessageGroupChatReceiver>;
    keyword?: string;
    idmessage?: string;
    infoRoom: IChat;
    isConnected: boolean | null;
    loadingEndToStart: boolean
}
const MessagesCurrentChatGroup: React.FC<Props> = memo(
    ({
        messagesCurrent,
        keyword,
        infoRoom,
        isConnected,
        loadingEndToStart
    }) => (
        <>
            {
                messagesCurrent.map((item, index) => {
                    return (
                        <View
                            key={(item.id_local && item.id_message.toString() === "local") ? item.id_local.toString() : item.id_message.toString()}
                            style={{
                                display: (!loadingEndToStart) ? 'flex' : 'none',
                            }}
                        >
                            <MessageItem
                                // key={`messagesCurrent_${index}_${new Date().getTime()}`.toString()} item.id_message.toString()
                                key={(item.id_local && item.id_message.toString() === "local") ? item.id_local.toString() : item.id_message.toString()}
                                item={item}
                                isShow={false}
                                handleResendMessage={() => { }}
                                infoRoom={infoRoom}
                                connection={isConnected}
                                typeMessageRender={
                                    item.create_at ? 'SUCCESS' : item.status == -1 ? 'UNSEND' : 'SENDING'
                                }
                            />
                        </View>

                    );
                })
            }
        </>
    ),
);

export default memo(MessagesCurrentChatGroup);

