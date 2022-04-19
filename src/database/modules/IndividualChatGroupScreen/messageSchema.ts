import { FileSchemaOp } from '../../common';
import * as FileLocalSchemaOp from '../IndividualChatScreen/FileLocalSchema';
import * as ParticipantSchemaOp from './participantSchema';
export const NAME_SCHEMA = 'IndividualChatGroup/MessageSchema';

export const messageSchema = {
  name: NAME_SCHEMA,
  properties: {
    id_message: 'string',
    message: { type: 'string', optional: true },
    status: { type: 'int', optional: true },
    files: {type: 'list', objectType: FileSchemaOp.NAME_SCHEMA},
    create_at: { type: 'string', optional: true },
    room_id: { type: 'string', optional: true },
    SK: { type: 'string', optional: true },
    PK: { type: 'string', optional: true },
    user_receiver: { type: 'string', optional: true },
    user_sender: { type: 'string', optional: true },
    is_first_message_in_date: { type: 'bool', optional: true },
    is_localMessage: { type: 'string', optional: true },
    id_local: { type: 'string', optional: true },
    filesLocal: { type: 'list', objectType: FileLocalSchemaOp.NAME_SCHEMA },
    participants: { type: 'list', objectType: ParticipantSchemaOp.NAME_SCHEMA },
    flag_request: { type: 'string', optional: true },
    id_message_request: { type: 'string', optional: true },
  },
};