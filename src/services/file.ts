import {METHOD_API, createConnector} from './connector';

export enum OBJECT_TYPE {
  AVATAR = 'AVATAR',
  ROOM_CHAT = 'GR',
}

export const apiUploadFile = (data: FormData) => {
  return createConnector(METHOD_API.UPLOAD_IMAGE, `api/v2/upload`, data);
};

// upload-multiple-files
export const apiUploadMultipleFile = (data: FormData) => {
  return createConnector(
    METHOD_API.UPLOAD_IMAGE,
    `api/v2/upload-multiple-files`,
    data,
  );
};
