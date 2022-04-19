import {common, image} from '../types';
import {IAction} from '../actions';
import {IImage} from '../../models/image';
import {ImagePickerResponse} from 'react-native-image-picker';
import {PaginationFunc} from './func';
import {useS3} from '../../hooks/aws';

const {getSignedUrl} = useS3();
interface IState {
  ImageCurrentDay: {
    listAll: Array<IImage>;
    listPagination: Array<IImage[]>;
    itemPerPage: number;
    listCurrent: Array<IImage>;
    totalPages: number;
  };

  ImageDayBefore: {
    listAll: Array<IImage>;
    listPagination: Array<IImage[]>;
    itemPerPage: number;
    listCurrent: Array<IImage>;
    totalPages: number;
  };

  captureImage: {
    show: boolean;
    file: ImagePickerResponse;
  };
}

const initialState: IState = {
  ImageCurrentDay: {
    listAll: [],
    listPagination: [],
    itemPerPage: 10,
    listCurrent: [],
    totalPages: 0,
  },
  ImageDayBefore: {
    listAll: [],
    listPagination: [],
    itemPerPage: 50,
    listCurrent: [],
    totalPages: 0,
  },
  captureImage: {
    show: false,
    file: {},
  },
};
const reducer = (state = initialState, {type, payload}: IAction) => {
  switch (type) {
    case image.FETCH_DATA_LIST_IMAGE_CURRENT_DAY: {
      // clone list payload
      let list = JSON.parse(JSON.stringify(payload));
      // get listPagination, totalPages
      const {totalPages, listPagination} = PaginationFunc<IImage>(
        list,
        state.ImageCurrentDay.itemPerPage,
      );
      // // update state data
      // console.log('payload current length', list.length);

      const data: Array<IImage> = [];
      (list as Array<IImage>).map(item =>
        data.push({
          ...item,
          path_file: getSignedUrl(item.path_file),
          path_file_thumb: getSignedUrl(item.path_file_thumb),
        }),
      );
      state.ImageCurrentDay.listAll = data;
      console.log(
        'state.ImageCurrentDay.listAll',
        state.ImageCurrentDay.listAll.length,
      );
      state.ImageCurrentDay.listPagination = [...listPagination];
      state.ImageCurrentDay.totalPages = totalPages;

      if(state.ImageCurrentDay.listPagination[0]){
        state.ImageCurrentDay.listCurrent = [
          ...state.ImageCurrentDay.listPagination[0],
        ];
      }
      // state.ImageCurrentDay.listCurrent = [
      //   ...state.ImageCurrentDay.listPagination[0],
      // ];
      // return clone state
      return {...state};
    }
    case image.FETCH_DATA_LIST_IMAGE_DAY_BEFORE: {
      // clone list payload

      let list = JSON.parse(JSON.stringify(payload));
      console.log('payload image day before', list.length);
      // get listPagination, totalPages
      const {totalPages, listPagination} = PaginationFunc<IImage>(
        list,
        state.ImageDayBefore.itemPerPage,
      );
      // update state data

      state.ImageDayBefore.listAll = [...list];
      console.log(
        'state.ImageDayBefore.listAll',
        state.ImageDayBefore.listAll.length,
      );

      state.ImageDayBefore.listPagination = [...listPagination];
      state.ImageDayBefore.totalPages = totalPages;

      const data: Array<IImage> = [];
      state.ImageDayBefore.listPagination[0].map(item =>
        data.push({
          ...item,
          path_file: getSignedUrl(item.path_file),
          path_file_thumb: getSignedUrl(item.path_file_thumb),
        }),
      );
      state.ImageDayBefore.listCurrent = data;
      // state.ImageDayBefore.listCurrent = [];
      // return clone state
      return {...state};
    }
    case image.GET_LIST_DAY_BEFORE_PAGINATION: {
      console.log(
        'state.ImageDayBefore.listCurrent  before pazi',
        state.ImageDayBefore.listCurrent.length,
      );
      console.log(
        'payload < state.ImageDayBefore.listPagination.length',
        payload < state.ImageDayBefore.listPagination.length,
      );

      if (payload < state.ImageDayBefore.totalPages) {
        console.log('pagez', payload);
        const data: Array<IImage> = [];
        state.ImageDayBefore.listCurrent.map(item => data.push(item));
        state.ImageDayBefore.listPagination[payload].map(item =>
          data.push({
            ...item,
            path_file: getSignedUrl(item.path_file),
            path_file_thumb: getSignedUrl(item.path_file_thumb),
          }),
        );
        state.ImageDayBefore.listCurrent = data;
      }

      return {...state};
    }
    case image.CAPTURE_IMAGE: {
      state.captureImage = payload;
      console.log('state.captureImage', state.captureImage);

      return {...state};
    }
    case common.CLEAR_DATA: {
      // state = {...initialState};
      state.ImageCurrentDay = {
        listAll: [],
        listPagination: [],
        itemPerPage: 10,
        listCurrent: [],
        totalPages: 0,
      };
      state.ImageDayBefore = {
        listAll: [],
        listPagination: [],
        itemPerPage: 10,
        listCurrent: [],
        totalPages: 0,
      };
      state.captureImage = {
        show: false,
        file: {},
      };
      console.log('common.CLEAR_DATA, image');
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
