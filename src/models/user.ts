import { IImage, Avatar, AvatarTmp } from './image';

export interface User {
  PK: string;
  SK: string;
  company_id: string;
  user_id: string;
  email: string;
  username: string;
  fullname: string;
  address: string;
  create_at: string;
  special_message: string;
  is_join: boolean
  user_role: string;
  album_files: Array<IImage>;
  avatar : string
}



export const UserTmp = {
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
  avatar : ''
};

export interface InfoUser {
  avatar: string;
  create_at: string;
  SK: string;
  username: string;
  address: string;
  full_name: string;
  PK: string;
  email: string;
  user_role: string;
  company_id: string;
  user_id: string;
}

export const InfoUserTmp: InfoUser = {
  avatar: '',
  create_at: '',
  SK: '',
  username: '',
  address: '',
  full_name: '',
  PK: '',
  email: '',
  user_role: '',
  company_id: '',
  user_id: '',
};
