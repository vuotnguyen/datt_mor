import { common, user } from '../types';
import { IAction } from '../actions';
import { User, UserTmp } from '../../models/user';
import { PaginationFunc } from './func';
import { IImage, Avatar } from '../../models/image';

import { useS3 } from '../../hooks/aws';

const { getSignedUrl } = useS3();
interface IState {
  UserInfo: User;
  myAlbum: {
    listAll: Array<IImage>;
    listPagination: Array<IImage[]>;
    itemPerPage: number;
    listCurrent: Array<IImage>;
    totalPages: number;
  };
  wsNotice: WebSocket | null;
}

const initialState: IState = {
  // UserInfo: {
  //   id: '',
  //   album_files: [],
  //   avatar: {
  //     id: '',
  //     path_file_thumb: '',
  //     create_at: '',
  //     file_name: '',
  //     path_file: '',
  //   },
  //   username: '',
  //   address: '',
  //   fullname: '',
  //   email: '',
  // },
  wsNotice: null,
  myAlbum: {
    listAll: [],
    listPagination: [],
    itemPerPage: 50,
    listCurrent: [],
    totalPages: 0,
  },
  UserInfo: {
    SK: '',
    PK: '',
    company_id: '',
    user_id: '',
    email: '',
    username: '',
    fullname: '',
    address: '',
    create_at: '',
    special_message: '',
    is_join: false,
    user_role: '',
    album_files: [],
    avatar: ''
  }
};
const reducer = (state = initialState, { type, payload }: IAction) => {
  switch (type) {
    case user.USER_INFO: {
      // clone list payload
      let userInfo = JSON.parse(JSON.stringify(payload));
      console.log("userInfo", userInfo)

      state.UserInfo = userInfo;
      //let list = userInfo.album_files;

      // get listPagination, totalPages
      // const { totalPages, listPagination } = PaginationFunc<IImage>(
      //   list,
      //   state.myAlbum.itemPerPage,
      // );

      // update state data
        // state.myAlbum.listAll = [...list];
        // state.myAlbum.listPagination = [...listPagination];
        // state.myAlbum.totalPages = totalPages;
        // const data: Array<IImage> = [];
        // state.myAlbum.listPagination[0].map(item =>
        //   data.push({
        //     ...item,
        //     path_file: getSignedUrl(item.path_file),
        //     path_file_thumb: getSignedUrl(item.path_file_thumb),
        //   }),
        // );
        // state.myAlbum.listCurrent = data;
      // return clone state
      return { ...state };
    }
    case user.GET_ALBUM_PAGINATION: {
      if (payload < state.myAlbum.totalPages) {
        const data: Array<IImage> = [];
        state.myAlbum.listCurrent.map(item => data.push(item));
        state.myAlbum.listPagination[payload].map(item =>
          data.push({
            ...item,
            path_file: getSignedUrl(item.path_file),
            path_file_thumb: getSignedUrl(item.path_file_thumb),
          }),
        );
        state.myAlbum.listCurrent = data;
      }

      return { ...state };
    }
    case user.UPDATE_AVATAR_PROFILE: {
      console.log('case UPDATE_AVATAR_PROFILE run ');
      // payload : avatar:Avatar
      console.log(payload)
      let newAvatar: Avatar = payload;
      //state.UserInfo.avatar = newAvatar;
      return { ...state };
    }
    case common.CLEAR_DATA: {
      console.log('common.CLEAR_DATA, userReducer');
      state.UserInfo = UserTmp;
      return { ...state };
    }
    default:
      return state;
  }
};

export default reducer;
