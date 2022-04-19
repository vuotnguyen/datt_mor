export const NAME_SCHEMA = 'discover/FileLocalSchema';

import * as UserLocalSchemaOp from './UserLocalSchema';

export const fileLocalSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: {type: 'string', optional: true},
    file_name: {type: 'string', optional: true},
    path_file: {type: 'string', optional: true},
    path_file_thumb: {type: 'string', optional: true},
    create_at: {type: 'string', optional: true},
    user: {
        type: 'object',
        objectType: `${UserLocalSchemaOp.NAME_SCHEMA}`
    },
  },
};