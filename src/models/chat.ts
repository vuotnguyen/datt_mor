import {PhotoIdentifier} from '@react-native-community/cameraroll';

import {Avatar, AvatarTmp} from './image';

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  username: string;
  avatar: string;
  address: string;
  create_at: string;
  is_join?: boolean;
  special_message?: string;
  SK?: string;
  user_role?: string;
}
export const UserTmp: User = {
  user_id: '',
  email: '',
  full_name: '',
  username: '',
  avatar: '',
  address: '',
  create_at: '',
};
export interface IGroupChatInfo {
  room_id: string;
  group_name: string;
  // avatar_group: Avatar;
  avatar_group: string;
  admin_id: string;
  user_login: string;
  participants_id: string[];
  create_at: string;
}
export interface IChatRes {
  id_message: string;
  message: string;
  message_status: string | number;
  room_id: string;
  user_login: string;
  user_friend: string;
  user_sender: string;
  create_at: string;
  unread_message_stack: number;
  is_group: number;
}
export interface IChat {
  id_message: string;
  message: string;
  message_status: string | number;
  room_id: string;
  user_login: string;
  user_friend: string;
  user_sender: string;
  group_name: string;
  admin_id: string;
  avatar_group: string;
  participants: string[];
  create_at: string;
  unread_message_stack: number;
  is_group: number;
}

export interface IChatResutlMessageSearch {
  id_message: string;
  message: string;
  room_id: string;
  user_sender: string;
  create_at: string;
}

export const IChatTmp: IChat = {
  id_message: '',
  message: '',
  message_status: '',
  room_id: '',
  user_login: '',
  user_friend: '',
  user_sender: '',
  group_name: '',
  admin_id: '',
  avatar_group: '',
  participants: [],
  create_at: '',
  unread_message_stack: 0,
  is_group: 0,
};
export const IRoomChatTmp = {
  infoRoom: IChatTmp,
  messages: [],
};
export type IRoomChatGroup = {
  ws: WebSocket;
  wsStatus: WebSocket;
  isSocketClosed: boolean;
  timerCheck: NodeJS.Timeout | null;
};
export type IRoomChat = {
  ws: WebSocket;
  wsStatus: WebSocket;
  info_room: IChat;
  count_cache: number;
  isSocketClosed: boolean;
  timerCheck: NodeJS.Timeout | null;
};
type objUser = {
  id: string;
  fullname: string;
  avatar: Avatar;
  username?: string;
};
export type IFileObject = {
  file_name: string;
  link_url: string;
  path: string;
  payload: any;
};
export interface ImessageChat {
  message: string; //content message
  chat_room_id: string;
  user_sender: string;
  user_receiver: string;
  // files?: Array<File> | Array<PhotoIdentifier> | null;
  files: IFileObject[];
  id_local?: string;
}

export interface ImessageChatGroup {
  message: string; //content message
  chat_room_id: string; // id chat room
  user_sender: string; // info user sender
  // files?: Array<File> | Array<PhotoIdentifier> | null;
  files: IFileObject[];
  id_local?: string;
}

export interface FileUpload {
  create_at: string;
  link_url_file: string;
  path_file: string;
  user_id: string;
}

export interface File {
  id?: string;
  file_name?: string;
  path_file?: string;
  path_file_thumb?: string;
  create_at?: string;
  user?: User;
}
export enum StatusImage {
  sending = 1,
  fail = 2,
}
export interface FileLocal {
  file_name?: string;
  uri?: string;
  width?: number;
  height?: number;
  type?: string;
  status?: StatusImage;
  isImage?: boolean;
  size?: number;
}

export interface Participant {
  code_status: number | null;
  user_id: string;
}

export interface IMessageUpdateStatusChatGroup {
  files: File[] | null;
  id_message: string;
  message: string | null;
  participants_code_status: Array<string>;
  room_id: string;
}

export interface IMessageReceiver {
  filesLocal?: Array<FileLocal> | null;
  status: number;
  is_delete?: boolean;
  message: string;
  room_id: string;
  id_local?: string;
  id_message: string;
  is_first_message_in_date?: boolean; // is message frist of date
  is_localMessage?: string;
  PK?: string;
  SK?: string;
  create_at?: string;
  // Temp
  files?: IFileObject[] | null;
  flag_request?: string;
  id_message_request?: string;
  participants?: null;
  user_receiver: string;
  user_sender: string;
}

export interface IMessageGroupChatReceiver {
  participants: Array<Participant>;
  message: string;
  status: number;
  SK: string;
  PK: string;
  // files?: File[] | null;
  files?: IFileObject[] | null;
  create_at: string;
  room_id: string;
  user_receiver?: string;
  user_sender: string;
  isUnsend?: boolean;
  isLocal?: boolean;
  isCache?: boolean;
  id_local?: string;
  id_message: string;
  filesLocal?: Array<FileLocal> | null;
  flag_request?: string;
  id_message_request?: string;
  is_group?: boolean;
}

export const IMessageGroupChatReceiverTmp: IMessageGroupChatReceiver = {
  user_sender: '',
  create_at: '',
  status: 0,
  SK: '',
  message: '',
  room_id: '',
  id_message: '',
  user_receiver: '',
  PK: '',
  participants: [],
  files: [],
  filesLocal: [],
  isCache: false,
  isLocal: false,
  isUnsend: false,
  is_group: true,
};

export interface LastEvaluatedKeyImage {
  id: string;
  gsi: string;
  create_at: string;
}

export interface LastEvaluatedKey {
  room_id: string;
  create_at: string;
  id_message: string;
}

export enum STATUS_MESSAGE {
  SEND = 1,
  SEEN = 2,
}
export type IchatRes = {
  unread_chatroom: number;
  chat_rooms: Array<IChat>;
};

export type ITypeRoomChat = 'individual' | 'groupUser' | 'groupConstruction';

export type IGroupInfo = {
  room_id: string;
  group_name: string;
  avatar_group: string;
  admin_id: string;
  user_login: string;
  create_at: string;
  participants_id: string[];
};

export const RoomChatType = {
  INDIVIDUAL: 0,
  GROUP_USER: 1,
  GROUP_CONSTRUCTION: 2,
};

export const IGroupInfoTemp: IGroupInfo = {
  room_id: '',
  group_name: '',
  avatar_group: '',
  admin_id: '',
  user_login: '',
  create_at: '',
  participants_id: [],
};
