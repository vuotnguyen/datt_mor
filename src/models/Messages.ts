import { IMessageReceiver, LastEvaluatedKey } from "./chat";

export interface Reply {
  title: string;
  value: string;
  messageId?: any;
}

export interface QuickReplies {
  type: 'radio' | 'checkbox';
  values: Reply[];
  keepIt?: boolean;
}
export interface Image{
  
}
export interface IMessage<U> {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: U;
  images?: string[];
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  quickReplies?: QuickReplies;
}


export interface IRoomMessages{
  room_id: string;
  messages: IMessageReceiver[];
  lastKey: LastEvaluatedKey;
}