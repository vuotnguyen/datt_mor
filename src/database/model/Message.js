import {Model} from '@nozbe/watermelondb';
import {field, relation, date, json} from '@nozbe/watermelondb/decorators';

import {sanitizer} from './utils';

export default class Message extends Model {
  static table = 'messages';

  static associations = {
    room: {type: 'belongs_to', key: 'room_id'},
  };

  @json('participants', sanitizer) participants;

  @field('message') message;

  @field('status') status;

  @field('sk') sk;

  @field('pk') pk;

  @json('files', sanitizer) attachments;

  @date('create_at') _createAt;

  @field('createAtFormat') createAtFormat;

  @field('room_id') room_id;

  @field('user_receiver') userReceiver;

  @field('user_sender') userSender;

  @field('isUnsend') isUnsend;

  @field('isLocal') isLocal;

  @field('isCache') isCache;

  @field('id_local') idLocal;

  @field('id_message') id_message; 

  @json('files_local', sanitizer) filesLocal;

  @field('flag_request') flagRequest;

  @field('id_message_request') idMessageRequest;

  @field('is_group') is_group; 
}
