import { IMessageReceiver } from '../../../models/chat';
import * as messagesOp from './messageSchema';
export const NAME_SCHEMA = 'IndividualChat/RoomChatSchema';
export type RoomChatType = {
  room_id: string;
  messages: Array<IMessageReceiver>;
  lastKey: string;
};

export type RoomChatSchemaType = {
  room_id: string;
  messages: Array<IMessageReceiver>;
  messages_Unsend: Array<IMessageReceiver>;
  message_cache: IMessageReceiver | null;
};
export const roomChatSchema = {
  name: NAME_SCHEMA,
  properties: {
    room_id: 'string',
    messages: {
      type: 'list',
      objectType: `${messagesOp.NAME_SCHEMA}`,
    },
    messages_Unsend: {
      type: 'list',
      objectType: `${messagesOp.NAME_SCHEMA}`,
    },
    message_cache: {
      type: `${messagesOp.NAME_SCHEMA}`,
      optional: true,
    },
  },
  primaryKey: 'room_id',
};
