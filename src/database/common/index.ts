import * as UserSchemaOp from './UserSchema';
import * as FileSchemaOp from './FileSchema';
import * as AvatarSchemaOp from './AvatarSchema';
export const commonSchemaArr = [
  UserSchemaOp.userSchema,
  FileSchemaOp.fileSchema,
  AvatarSchemaOp.avatarSchema,
];
export {UserSchemaOp, FileSchemaOp, AvatarSchemaOp};
