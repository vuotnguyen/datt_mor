import {FileSchemaOp, UserSchemaOp} from '../../common';
import * as FileLocalSchemaOp from './FileLocalSchema';
export const NAME_SCHEMA = 'IndividualChat/MessageSchema';
export const messageSchema = {
  name: NAME_SCHEMA,
  // embedded: true,
  properties: {
    // id_message: 'string',
    // message: {type: 'string', optional: true},
    // status: {type: 'int', optional: true},
    // files: {type: 'list', objectType: FileSchemaOp.NAME_SCHEMA}, // 'string[File_id],'
    // create_at: {type: 'string', optional: true},
    // room_id: {type: 'string', optional: true},
    // is_delete: {type: 'bool', optional: true},
    // user_receiver: {type: 'string', optional: true},
    // user_sender: {type: 'string', optional: true},
    // is_first_message_in_date: {type: 'bool', optional: true}, // is message frist of date
    // is_localMessage: {type: 'string', optional: true},
    // id_local: {type: 'string', optional: true},
    // flag_request: {type: 'string', optional: true},
    // id_message_request: {type: 'string', optional: true},

    filesLocal: {type: 'list', objectType: FileLocalSchemaOp.NAME_SCHEMA},
    status: {type: 'int', optional: true},
    is_delete: {type: 'bool', optional: true},
    message: {type: 'string', optional: true},
    room_id: {type: 'string', optional: true},
    id_local: {type: 'string', optional: true},
    id_message: 'string',
    is_first_message_in_date: {type: 'bool', optional: true}, // is message frist of date
    is_localMessage: {type: 'string', optional: true},
    PK: {type: 'string', optional: true},
    SK: {type: 'string', optional: true},
    create_at: {type: 'string', optional: true},
    files: {type: 'list', objectType: FileSchemaOp.NAME_SCHEMA}, // 'string[File_id],'
    flag_request: {type: 'string', optional: true},
    id_message_request: {type: 'string', optional: true},
    participants: {type: 'string', optional: true},
    user_receiver: {type: 'string', optional: true},
    user_sender: {type: 'string', optional: true},
  },
};
