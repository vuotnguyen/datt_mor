import {IMessageReceiver} from '../../../models/chat';
import {connect} from '../../index';
import {FileLocal} from '../../../models/chat';
import * as MessageSchemaOp from './messageSchema';
export const NAME_SCHEMA = 'IndividualChat/FileLocalSchema';

export const fileLocalSchema = {
  name: NAME_SCHEMA,
  embedded: true,
  properties: {
    uri: {type: 'string', optional: true},
    file_name: {type: 'string', optional: true},
    type: {type: 'string', optional: true},
    width: {type: 'int', optional: true},
    height: {type: 'int', optional: true},
    status: {type: 'int', optional: true},
  },
};
