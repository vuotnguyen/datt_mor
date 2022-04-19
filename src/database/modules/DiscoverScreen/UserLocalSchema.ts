export const NAME_SCHEMA = 'discover/UserLocalSchema';
import * as AvatarLocalSchemaOp from './AvatarLocalSchema';

export const userLocalSchema = {
  name: NAME_SCHEMA,

  properties: {
    id: {type: 'string', optional: true},
    username: {type: 'string', optional: true},
    fullname: {type: 'string', optional: true},
    avatar: {
        type: 'object',
        objectType: `${AvatarLocalSchemaOp.NAME_SCHEMA}`
    },
  },
};