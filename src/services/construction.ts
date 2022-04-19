import { WorkItem } from '../models/construction';
import { METHOD_API, createConnector } from './connector';
const prefixApi = 'api/v1';
const prefixApiV2 = 'api/v2';

/**
 * services create construction
 */
const const_CONSTRUCTION = 'construction';
const FILE = 'files';

/**
 *
 * @param data :TypeDataCreateChatGroup
 * @returns Axios Promise with token
 */
export type TypeDataCreateConstruction = {
  construction_name: string;
  construction_address: string;
  work_items: Array<any>;
  users: Array<string>;
};

export type TypeDataUpdateConstruction = {
  construction_name: string;
  construction_address: string;
  work_items: Array<any>;
  users: Array<any>;
};
export const apiCreateConstruction = (data: TypeDataCreateConstruction) =>
  createConnector(METHOD_API.POST, `${prefixApi}/${const_CONSTRUCTION}`, data);

export const apiListConstruction = (lastKey: string, sort_by: string, search: string) => {
  if (lastKey == '' && sort_by == '') {
    return createConnector(METHOD_API.GET, `${prefixApi}/${const_CONSTRUCTION}?should_format=Value&keyword=${search}`);
  } else {
    return createConnector(METHOD_API.GET,
      `${prefixApi}/${const_CONSTRUCTION}?last_key=${lastKey}&should_format=Value&sort_by=${sort_by}&keyword=${search}`);
  }
}



// export const apiGetConstructioById = (id: string, option: string) =>
//   createConnector(METHOD_API.GET, `${prefixApi}/${const_CONSTRUCTION}/${id}?${option}`);

export const apiGetConstructioById = (id: string) =>
  createConnector(METHOD_API.GET, `${prefixApi}/${const_CONSTRUCTION}/${id}?should_format=Value`);

export const apiUpdateConstruction = (
  data: TypeDataUpdateConstruction,
  id: string,
) =>
  createConnector(
    METHOD_API.PUT,
    `${prefixApi}/${const_CONSTRUCTION}/${id}`,
    data,
  );

export const apiDeleteConstruction = (id: string) =>
  createConnector(
    METHOD_API.DELETE,
    `${prefixApi}/${const_CONSTRUCTION}/${id}`,
  );

export const getWorkItems = (id: string, path = false, workItemId?: string) =>
  createConnector(
    METHOD_API.GET,
    `${prefixApi}/${const_CONSTRUCTION}/${id}/${path ? 'files' : ''
    }?should_format=true&${workItemId ? 'work_item_id=' + workItemId : ''}`,
  );

export const apiDeleteImageConstruction = (data: any) =>
  createConnector(METHOD_API.DELETE, `${prefixApiV2}/${FILE}`, data);
