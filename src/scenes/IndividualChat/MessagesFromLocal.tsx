import { NetInfoStateType } from '@react-native-community/netinfo';
import React, {
    memo
} from 'react';
import {
    Dimensions, View
} from 'react-native';
import { useDate } from '../../hooks/date';
import {
    IChat, IMessageReceiver
} from '../../models/chat';
import MessageItem from './MessageItem';
const { compareDate } = useDate();
const { height } = Dimensions.get('screen');

interface Props {
    messageLocalDB: Array<IMessageReceiver>;
    keyword?: string;
    keyworkFullwidth?: string;
    keyworkHalfwidth?: string;
    idmessage?: string;
    infoRoom: IChat;
    connection: {
        type: NetInfoStateType;
        isConnected: boolean | null;
    };
    date: string;
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
        date,
        scrollRef,
        isFirstGotoDataSearch,
        setisFirstCallGotoSearchMessage,
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
                                idmessage={idmessage}
                                keyworkFullwidth={keyworkFullwidth}
                                keyworkHalfwidth={keyworkHalfwidth}
                            />
                        </View>
                    );
                })
            }
        </>
    ),
);

export default memo(MessagesFromLocal);