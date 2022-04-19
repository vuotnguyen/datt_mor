import * as MessageSchemaOp from './messageSchema';
import * as RoomChatIndOp from './roomChatGroupSchema';
import * as ParticipantOp from './participantSchema';

export const IndividualChatModuleArr = [
  MessageSchemaOp.messageSchema,
  RoomChatIndOp.roomChatSchema,
  ParticipantOp.participantSchema,
];

export {
  MessageSchemaOp,
  RoomChatIndOp,
  ParticipantOp,
};
