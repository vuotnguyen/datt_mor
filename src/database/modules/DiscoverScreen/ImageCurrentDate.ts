import {File} from '../../../models/chat';
export const NAME_SCHEMA = 'discover/ImageCurrentDateSchema';

import * as FileLocalSchemaOp from './FileLocalSchema';


export type ImageDateCurrentSchemaType = {
  id: string;
  image: Array<File>;
  lastKey: string;
};

export const imagedatecurrentSchema = {
  name: NAME_SCHEMA,
  properties: {
    id: 'string',
    image: {
      type: 'list',
      objectType: `${FileLocalSchemaOp.NAME_SCHEMA}`,
    },
    lastKey: {type: 'string', optional: true},
  },
  primaryKey: 'id',
};
