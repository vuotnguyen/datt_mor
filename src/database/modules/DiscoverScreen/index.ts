import * as ImageSchemaOp from './ImageSchema';
import * as ImageCurrentDateOp from './ImageCurrentDate';

import * as AvatarLocalSchemaOp from './AvatarLocalSchema';
import * as UserLocalSchemaOp from './UserLocalSchema';
import * as FileLocalSchemaOp from './FileLocalSchema';

export const discoverModuleArr = [
    ImageSchemaOp.imagedatebeforeSchema,
    ImageCurrentDateOp.imagedatecurrentSchema,
    AvatarLocalSchemaOp.avatarLocalSchema,
    UserLocalSchemaOp.userLocalSchema,
    FileLocalSchemaOp.fileLocalSchema
]; //define new schema for discoverscreen
export { ImageSchemaOp, AvatarLocalSchemaOp, UserLocalSchemaOp, FileLocalSchemaOp, ImageCurrentDateOp };
