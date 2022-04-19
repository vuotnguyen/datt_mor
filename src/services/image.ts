import {METHOD_API, createConnector} from './connector';

export const getListImageCurrentDate = () => {
  return createConnector(METHOD_API.GET, 'api/v1/images-date-current');
};

export const getListImageBeforePagingDate = (lastKey: string) => {
  let appendUri = lastKey ? `?last_key=${lastKey}` : '';

  return createConnector(
    METHOD_API.GET,
    `api/v1/images-date-before/${appendUri}`,
  );
};

export const getListImageCurrentPagingDate = (lastKey: string) => {
  let appendUri = lastKey ? `?last_key=${lastKey}` : '';

  return createConnector(
    METHOD_API.GET,
    `api/v1/images-date-current/${appendUri}`,
  );
};

export const getListImageDayBefore = () => {
  return createConnector(METHOD_API.GET, 'api/v1/images-date-before');
};

export enum CATEGORY_TYPE {
  AVATAR = 1,
  ALBUM = 2,
  CHAT = 3,
}

export const apiUploadImage = (
  codeCategoryType: CATEGORY_TYPE,
  data: FormData,
) => {
  console.log('code_category_type', codeCategoryType);
  console.log('data upload  :', data);

  return createConnector(
    METHOD_API.UPLOAD_IMAGE,
    // `api/v1/user/upload/images?code_category_type=${String(codeCategoryType)}`,
    `api/v2/upload`,
    data,
  );
};
