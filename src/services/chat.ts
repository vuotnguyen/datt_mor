import {Avatar} from '../models/image';
import {METHOD_API, createConnector} from './connector';
const prefixApi = 'api/v1';

export const apiGetListChats = (key_word?: string) => {
  let appendUri = key_word ? `?keyword=${key_word}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat/list-chat-by-user${appendUri}`,
  );
};

export const apiGetChatByUserID = (user_id: string, lastKey: string) => {
  let appendUri = lastKey ? `?last_key=${lastKey}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat/${user_id}${appendUri}`,
  );
};

export const apiGetChatIndivial = (
  room_id: string,
  condition_get_message_old_or_new?: string,
  last_key?: string,
) => {
  let appendUri_condition_get_message_old_or_new = condition_get_message_old_or_new
    ? `&condition_get_message_old_or_new=${condition_get_message_old_or_new}`
    : '';
  let appendUri_last_key = last_key ? `&last_key=${last_key}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat?room_id=${room_id}${appendUri_condition_get_message_old_or_new}${appendUri_last_key}`,
  );
};

export const apiGetChatGroupByRoomID = (
  chat_group_id: string,
  condition_get_message_old_or_new?: string,
  last_key?: string,
) => {
  let appendUri_condition_get_message_old_or_new = condition_get_message_old_or_new
    ? `?condition_get_message_old_or_new=${condition_get_message_old_or_new}`
    : '';
  let appendUri_last_key = last_key ? `&last_key=${last_key}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat-group/${chat_group_id}${appendUri_condition_get_message_old_or_new}${appendUri_last_key}`,
  );
};

export const apiUpdateStatusMessages = (
  room_id: string,
  data: Array<string>,
) => {
  let appendUri = `?room_id=${room_id}&status_code=2`;
  return createConnector(
    METHOD_API.PUT,
    `${prefixApi}/chat/messages/update-status${appendUri}`,
    data,
  );
};

export const apiGetMessageStack = (room_id: string, user_id: string) => {
  let appendUri = `/${room_id}/${user_id}`;
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/end-message/unread-message${appendUri}`,
  );
};

/**
 *
 * @param room_id :string, key_word :string
 * @returns Axios Promise with token
 */
export const apiSearchMessage = (
  room_id: string,
  key_word: string,
  page?: number,
) => {
  let appendUriPage = page ? `&page=${page}` : '';
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat/${room_id}/search-message?keyword_message=${key_word}${appendUriPage}`,
  );
};

/**
 * services chat group here
 */
const const_CHAT_GROUP = 'chat-group';

/**
 *
 * @param data :TypeDataCreateChatGroup
 * @returns Axios Promise with token
 */
export type TypeDataCreateChatGroup = {
  group_name: string;
  admin_id: string;
  avatar_group: {} | Avatar;
  participants_id: Array<string>;
};
export const apiCreateChatgroup = (data: TypeDataCreateChatGroup) =>
  createConnector(METHOD_API.POST, `${prefixApi}/${const_CHAT_GROUP}`, data);

/**
 *
 * @param room_id :string
 * @returns Axios Promise with token
 */
export const apiGetInfoGroupChat = (room_id: string) =>
  createConnector(
    METHOD_API.GET,
    `${prefixApi}/${const_CHAT_GROUP}/info-group-chat?room_id=${room_id}`,
  );

export const apiGetChatDetailByKeyworkSearch = (
  room_id: string,
  create_at: string,
  id_message: string,
) =>
  createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat/${room_id}/near-the-id-message?create_at=${create_at}&id_message=${id_message}`,
  );

export type TypeDataUpdateChatGroup = {
  group_name: string;
  // admin_id: string;
  // avatar_group: {} | Avatar;
  avatar_group: string | undefined | null;
  // participants_id: string[];
  room_id: string;
};
/**
 *
 * @param data :TypeDataUpdateChatGroup
 * @returns Axios promise with token
 */
export const apiUpdateChatGroup = (data: TypeDataUpdateChatGroup) => {
  return createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CHAT_GROUP}/info-group-chat`,
    data,
  );
};

export type TypeDataUserAddNew = {
  users_id: Array<string>;
  room_id: string;
};
export const apiAddNewMemberGroupChat = (data: TypeDataUserAddNew) => {
  console.log(data, 'data apiAddNewMemberGroupChat');
  return createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CHAT_GROUP}/add-new-users`,
    data,
  );
};

/**
 *
 * @param room_id string
 * @returns
 */
export const apiRemoveChatGroup = (room_id: string) =>
  createConnector(
    METHOD_API.DELETE,
    `${prefixApi}/${const_CHAT_GROUP}/${room_id}`,
  );

/**
 *
 */
export type TypeDataUserRemove = {
  users_id: Array<string>;
  room_id: string;
};
export const apiRemoveUserGroupChat = (data: TypeDataUserRemove) =>
  createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CHAT_GROUP}/remove-user`,
    data,
  );

/**
 * user out group
 *
 */
export type TypeApiUserJoinOutGroup = {
  room_id: string | undefined;
};
export const apiUserJoinOutGroup = (data: TypeApiUserJoinOutGroup) =>
  createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CHAT_GROUP}/out-group`,
    data,
  );

/**
 * get chat box detail by id
 *
 */
export enum TypeRoomAPI {
  INDIVIDUAL = 0,
  GROUP = 1,
}
export const apiGetChatDetail = (roomId: string, isGroup: boolean) => {
  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat-detail?chat_room_id=${roomId.replace(
      /#/g,
      '%23',
    )}`,
  );
};

/**
 * api update is_join user chat group
 */

export const apiUpdateIsJoinUserChatGroup = (room_id: string) =>
  createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CHAT_GROUP}/update-is-join`,
    {
      room_id: room_id,
    },
  );

/**
 * api get all info group chat
 */

export const apiGetInfoGroups = () =>
  createConnector(METHOD_API.GET, `${prefixApi}/${const_CHAT_GROUP}`);

/**
 * api delete messages
 *
 */

export const apiDeleteMessage = (idMessage: string, roomId: string) =>
  createConnector(
    METHOD_API.DELETE,
    `${prefixApi}/chat/delete/${idMessage}?room_id=${roomId.replace(
      /#/g,
      '%23',
    )}`,
  );

export const getInfoGroup = (group_id: string) => {
  const roomId = `room_id=${group_id.replace(/#/g, '%23')}`;

  return createConnector(
    METHOD_API.GET,
    `${prefixApi}/chat-group/info-group-chat?${roomId}`,
  );
};
