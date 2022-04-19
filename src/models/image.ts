import {InfoUser} from './user';

// export interface Avatar {
//   id: string;
//   path_file_thumb: string;
//   create_at: string;
//   user?: any;
//   file_name: string;
//   path_file: string;
// }
export interface Avatar {
  path_file: string;
  create_at: string;
  user_id: string;
  link_url_file: string | null;
}
export const AvatarTmp: Avatar = {
  // id: '',
  // path_file_thumb: '',
  // create_at: '',
  // file_name: '',
  // path_file: '',
  path_file: '',
  create_at: '',
  user_id: '',
  link_url_file: '',
};

export interface IuserImage {
  id: string;
  avatar: Avatar;
  fullname: string;
  username: string;
}
export interface IImage {
  id?: string;
  file_name: string;
  path_file: string;
  path_file_thumb: string;
  create_at: string;
  user: InfoUser;
}

export interface IImageProfile {
  id: string;
  file_name: string;
  path_file: string;
  path_file_thumb: string;
  create_at: string;
}

export const IImageTmp = {
  id: '',
  file_name: '',
  path_file: '',
  path_file_thumb: '',
  create_at: '',
  user: {
    id: '',
    avatar: AvatarTmp,
    fullname: '',
    username: '',
  },
};
