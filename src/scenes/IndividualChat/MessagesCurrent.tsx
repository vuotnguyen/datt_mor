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
    messagesCurrent: Array<IMessageReceiver>;
    keyword?: string;
    idmessage?: string;
    infoRoom: IChat;
    connection: {
        type: NetInfoStateType;
        isConnected: boolean | null;
    };
    loadingEndToStart: boolean;
}
const MessagesCurrent: React.FC<Props> = memo(
    ({
        messagesCurrent,
        keyword,
        infoRoom,
        connection,
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
                                //key={`messagesCurrent_${index}_${new Date().getTime()}`.toString()}
                                //key={ item.id_local ? item.id_local.toString() : `messagesCurrent_${index}_${new Date().getTime()}`.toString()}
                                key={(item.id_local && item.id_message.toString() === "local") ? item.id_local.toString() : item.id_message.toString()}
                                item={item}
                                index={index}
                                isShow={false}
                                handleResendMessage={() => { }}
                                infoRoom={infoRoom}
                                connection={connection.isConnected}
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

export default memo(MessagesCurrent);