import {AppDispatch} from '../';
import {IImage} from '../../models/image';
import {
  getListImageCurrentDate,
  getListImageDayBefore,
  apiUploadImage,
  CATEGORY_TYPE,
} from '../../services/image';
import {createAction} from '../actions';
import {dataCache, image} from '../types';

export const GetListImageCurrentDate = (
  SuccessCallBack: Function,
  ErrorCallback: Function,
  FinallyCallback: Function,
) => {
  return (dispatch: AppDispatch) => {
    // dispatch(createAction(dataCache.LOADING_START, null));
    getListImageCurrentDate()
      .then(res => {
        const resConvert = JSON.parse(JSON.stringify(res.data));
        dispatch(
          createAction(image.FETCH_DATA_LIST_IMAGE_CURRENT_DAY, resConvert),
        );
        SuccessCallBack();
      })
      .catch(err => {
        console.log('GetListImageCurrentDate error', err);
        ErrorCallback();
      })
      .finally(() => {
        FinallyCallback();
      });
  };
};

export const GetListImageDayBefore = (
  SuccessCallBack: Function,
  ErrorCallback: Function,
  FinallyCallback: Function,
) => {
  return (dispatch: AppDispatch) => {
    //  dispatch(createAction(dataCache.LOADING_START, null));
    getListImageDayBefore()
      .then(res => {
        const resConvert = JSON.parse(JSON.stringify(res.data));
        dispatch(
          createAction(image.FETCH_DATA_LIST_IMAGE_DAY_BEFORE, resConvert),
        );
        SuccessCallBack();
      })
      .catch(err => {
        console.log('getListImageDayBefore error', err);
        ErrorCallback();
      })
      .finally(() => {
        FinallyCallback();
      });
  };
};

export const fetchImageBeforeDateLocalStorages = (data: Object) => (
  dispatch: AppDispatch,
) => {
  let list = JSON.parse(JSON.stringify(data));
  if (list.length > 0) {
    dispatch(createAction(image.FETCH_DATA_LIST_IMAGE_DAY_BEFORE, data));
  }
};

export const fetchImageCurrentDateLocalStorages = (data: Object) => (
  dispatch: AppDispatch,
) => {
  let list = JSON.parse(JSON.stringify(data));
  if (list.length > 0) {
    dispatch(createAction(image.FETCH_DATA_LIST_IMAGE_CURRENT_DAY, data));
  }
};

export const uploadImage = (
  codeCategoryType: CATEGORY_TYPE,
  data: FormData,
) => {
  return (dispatch: AppDispatch) => {
    apiUploadImage(codeCategoryType, data)
      .then(res => {
        console.log('res success', res);
      })
      .catch(err => console.log('uploadImage', err))
      .finally(() => {});
  };
};
