import {METHOD_API, createConnector} from './connector';
const prefixApi = 'api/v1';

export const getUserInfo = () => {
  return createConnector(METHOD_API.GET, `${prefixApi}/user?last_key=''`);
};

export const getUserInfoPaging = (lastKey: string) => {
  let appendUri = lastKey ? `?last_key=${lastKey}` : '';

  return createConnector(METHOD_API.GET, `${prefixApi}/user/${appendUri}`);
};

export const apiUserUploadImages = (codeCategoryType: number, params: any) => {
  return createConnector(
    METHOD_API.UPLOAD_IMAGE,
    `${prefixApi}/user/upload/images?code_category_type=${codeCategoryType}`,
    params,
  );
};

export const uploadAvatarUser = (params: any) => {
  return createConnector(
    METHOD_API.AVATAR_IMAGE,
    `${prefixApi}/user/update-avatar`,
    params,
  );
};
export const apiRemoveAvatar = () => {
  return createConnector(METHOD_API.PUT, `${prefixApi}/user/remove-avatar`);
};
export const getAllUsers = (key_word?: string) => {
  let appendUri = key_word ? `?keyword=${key_word}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/company/users${appendUri}`,
  );
};

export const getUserByChatRoomID = (keyword: string) => {
  return createConnector(METHOD_API.GET, `${prefixApi}/users/${keyword}`);
};
