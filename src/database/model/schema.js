import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'room',
      columns: [
        {name: 'last_message', type: 'string', isOptional: true},
        {name: 'unread', type: 'number', isOptional: true},
        {name: 'avatar_origin', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'messages',
      columns: [
        {name: 'participants', type: 'string', isOptional: true},
        {name: 'message', type: 'string', isOptional: true},
        {name: 'status', type: 'string', isOptional: true},
        {name: 'sk', type: 'string', isOptional: true},
        {name: 'pk', type: 'string', isOptional: true},
        {name: 'files', type: 'string', isOptional: true}, //TODO Change this
        {name: 'create_at', type: 'number', isOptional: true},
        {name: 'createAtFormat', type: 'string', isOptional: true},
        {name: 'room_id', type: 'string', isIndexed: true},
        {name: 'user_receiver', type: 'string', isOptional: true}, //TODO Change this
        {name: 'user_sender', type: 'string', isOptional: true}, //TODO Change this
        {name: 'isUnsend', type: 'boolean', isOptional: true},
        {name: 'isLocal', type: 'boolean', isOptional: true},
        {name: 'isCache', type: 'boolean', isOptional: true},
        {name: 'id_local', type: 'string', isOptional: true},
        {name: 'id_message', type: 'string', isOptional: true},
        {name: 'files_local', type: 'string', isOptional: true}, //TODO Change this
        {name: 'flag_request', type: 'string', isOptional: true},
        {name: 'id_message_request', type: 'string', isOptional: true},
        {name: 'is_group', type: 'boolean', isOptional: true},
      ],
    }),
  ],
});
