import { NetInfoStateType } from '@react-native-community/netinfo';

import React, {
    memo
} from 'react';
import {
    Dimensions, View
} from 'react-native';
import { useDate } from '../../hooks/date';
import {
    IChat, IChatResutlMessageSearch, IMessageGroupChatReceiver
} from '../../models/chat';
import MessageItem from './MessageItemChatGroup';
const { compareDate } = useDate();
const { height } = Dimensions.get('screen');


interface Props {
    messageLocalDB: Array<IMessageGroupChatReceiver>;
    keyword?: string;
    keyworkFullwidth?: string;
    keyworkHalfwidth?: string;
    idmessage?: string;
    infoRoom: IChat;
    date: string;
    connection: {
        type: NetInfoStateType;
        isConnected: boolean | null;
    };
    scrollRef: React.MutableRefObject<any>;
    isFirstGotoDataSearch?: boolean;
    setisFirstCallGotoSearchMessage?: (isFirstGotoDataSearch: boolean) => void;
}
const MessagesFromLocal: React.FC<Props> = memo(
    ({
        messageLocalDB,
        keyword,
        keyworkFullwidth,
        keyworkHalfwidth,
        idmessage,
        infoRoom,
        connection,
        scrollRef,
        isFirstGotoDataSearch,
        setisFirstCallGotoSearchMessage,
        date
    }) => (
        <>
            {
                messageLocalDB.map((item, index) => {
                    let isShow: boolean = false;
                    if (compareDate(date, item.create_at)) {
                        isShow = false;
                    } else {
                        isShow = true;
                        date = item.create_at;
                    }
                    return (

                        <View
                            key={item.id_message.toString()}
                            onLayout={(event) => {
                                const layout = event.nativeEvent.layout;
                                //move to message keyword highlight
                                if (keyword) {
                                    if (item.id_message === idmessage && !isFirstGotoDataSearch) {
                                        scrollRef.current.scrollTo({
                                            x: 0,
                                            y: layout.y - height / 2
                                        })
                                        if (setisFirstCallGotoSearchMessage) {
                                            setTimeout(() => {
                                                setisFirstCallGotoSearchMessage(true);
                                            }, 500);
                                        }
                                    }
                                }
                            }}>
                            <MessageItem
                                key={item.id_message.toString()}
                                item={item}
                                index={index}
                                isShow={isShow}
                                handleResendMessage={() => { }}
                                infoRoom={infoRoom}
                                connection={connection.isConnected}
                                typeMessageRender={'SUCCESS'}
                                keywork={keyword}
                                keyworkFullwidth={keyworkFullwidth}
                                keyworkHalfwidth={keyworkHalfwidth}
                                idmessage={idmessage}
                            />
                        </View>
                    );
                })
            }
        </>
    ),
);

export default memo(MessagesFromLocal);