import React from 'react';
import {DOMAIN_SOCKET} from '../config/Constants';
import {ITypeRoomChat} from '../models/chat';
import {InfoUser} from '../models/user';
import {RootStackNavigationProp} from '../navigations/RootStack';

export const useChat = (roomChatId: string) => {
  const ws = new WebSocket(`${DOMAIN_SOCKET}/${roomChatId}`);
  return {
    ws,
    onOpen: ws.onopen,
    onMessage: ws.onmessage,
    onError: ws.onerror,
    onClose: ws.onclose,
  };
};
export type IChatServices = {DeleteModel?: {} | null; SearchModel?: null};

type IChatContext = {
  typeChat: ITypeRoomChat;
  navigation: RootStackNavigationProp;
  infoUsers: {
    user_friend: InfoUser;
    user_login: InfoUser;
    user_sender: InfoUser;
  };
  services: IChatServices | null;
  setService: (val: IChatServices) => void;
  //   openModal: (val: IModalChatConfirm) => void;
};
export const ChatContext = React.createContext<IChatContext | null>(null);
export const useChatContext = () => React.useContext(ChatContext);

type IchannelContext = {
  handleDeleteMessage: (idMessage: string, fileName: string) => void;
};
export const ChannelContext = React.createContext<IchannelContext | null>(null);
export const useChannelContext = () => React.useContext(ChannelContext);
