import * as roomChatSchemaOp from './roomChatSchema';
import * as userChatSchemaOp from './userChatSchema';

export const listChatModuleArr = [
  roomChatSchemaOp.roomChatSchema,
  userChatSchemaOp.userChatSchema,
];

export {roomChatSchemaOp, userChatSchemaOp};
