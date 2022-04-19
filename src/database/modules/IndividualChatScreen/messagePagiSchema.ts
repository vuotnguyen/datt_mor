import {IMessageReceiver} from '../../../models/chat';
import {connect} from '../../index';
import * as MessageSchemaOp from './messageSchema';
export const NAME_SCHEMA = 'IndividualChat/MessagePagiSchema';
export type messagePagiSchemaType = {
  id: number;
  messages: IMessageReceiver[];
};
export const messagePagiSchema = {
  name: NAME_SCHEMA,
  embedded: true,
  properties: {
    id: 'int',
    messages: {
      type: 'list',
      objectType: MessageSchemaOp.NAME_SCHEMA,
    },
  },
};
