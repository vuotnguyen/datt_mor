import {Model} from '@nozbe/watermelondb';
import {field, json} from '@nozbe/watermelondb/decorators';
import {sanitizer} from './utils';

export default class Room extends Model {
  static table = 'room';
  static associations = {
    messages: {type: 'has_many', foreignKey: 'room_id'},
  };

  @json('last_message', sanitizer) lastMessage;

  @field('unread') unread;

  @field('avatar_origin') avatarOrigin;
}
