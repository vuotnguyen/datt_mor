import { IMessageGroupChatReceiver } from '../../../models/chat';
import * as messagesOp from './messageSchema';
export const NAME_SCHEMA = 'IndividualChatGroup/RoomChatSchema';

export type RoomChatType = {
  room_id: string;
  messages: Array<IMessageGroupChatReceiver>;
  lastKey: string;
};

export type RoomChatSchemaType = {
  room_id: string;
  messages_Unsend: Array<IMessageGroupChatReceiver>;
  message_local: Array<IMessageGroupChatReceiver>;
  message_cache: IMessageGroupChatReceiver | null;
};

export const roomChatSchema = {
  name: NAME_SCHEMA,
  properties: {
    room_id: 'string',
    messages_Unsend: {
      type: 'list',
      objectType: `${messagesOp.NAME_SCHEMA}`,
    },
    message_cache: {
      type: `${messagesOp.NAME_SCHEMA}`,
      optional: true,
    },
    message_local: {
      type: 'list',
      objectType: `${messagesOp.NAME_SCHEMA}`,
    },
  },
  primaryKey: 'room_id',
};
