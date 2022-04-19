export const NAME_SCHEMA = 'profile/ProfileSchema';
import * as AvatarLocalSchemaOp from '../DiscoverScreen/AvatarLocalSchema';
import * as AlbumFileschemaOp from './albumfilesSchema';
import { Avatar, IImageProfile} from '../../../models/image';


export type ProfileSchemaType = {
  id: string;
  email: string;
  fullname: string;
  username: string;
  avatar: Avatar;
  address: string;
  create_at: string;
  album_files: Array<IImageProfile>;
  lastKey: string;
};


export const profileSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: { type: 'string', optional: true },
    email: { type: 'string', optional: true },
    fullname: { type: 'string', optional: true },
    username: { type: 'string', optional: true },
    avatar: { type: 'object', objectType: `${AvatarLocalSchemaOp.NAME_SCHEMA}` },
    address: { type: 'string', optional: true },
    create_at: { type: 'string', optional: true },
    album_files: { 
      type: 'list', objectType: `${AlbumFileschemaOp.NAME_SCHEMA}` 
    },
    lastKey: {type: 'string', optional: true},
  },
  primaryKey: 'id'
};


