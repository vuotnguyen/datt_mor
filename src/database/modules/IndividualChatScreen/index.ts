import * as MessageSchemaOp from './messageSchema';
import * as MessagePagiSchemaOp from './messagePagiSchema';
import * as FileLocalSchemaOp from './FileLocalSchema';
import * as RoomChatIndOp from './roomChatSchema';
import * as ObdateOp from './obDate';
export const IndividualChatModuleArr = [
  MessageSchemaOp.messageSchema,
  MessagePagiSchemaOp.messagePagiSchema,
  FileLocalSchemaOp.fileLocalSchema,
  RoomChatIndOp.roomChatSchema,
  ObdateOp.ObDateSchema,
];

export {
  MessageSchemaOp,
  MessagePagiSchemaOp,
  RoomChatIndOp,
  FileLocalSchemaOp,
  ObdateOp,
};
