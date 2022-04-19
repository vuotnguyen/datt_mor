import Auth from '@aws-amplify/auth';
import axios from 'axios';
import {DOMAIN} from '../config/Constants';
export interface LoginSericesProps {
  email: string;
  password: string;
}
const LoginServices = ({email, password}: LoginSericesProps) => {
  return Auth.signIn(email, password);
};
type IConfirmResetPasswordData = {
  confirmation_code: string;
  new_password: string;
  email: string;
};
const ConfirmResetPassword = (data: IConfirmResetPasswordData) => {  
  return axios({
    method: 'post',
    url: `${DOMAIN}/api/v1/confirm-reset-password`,
    data,
  });
};
type IResetPasswordData = {
  email: string;
};
const ResetPassword = (data: IResetPasswordData) => {
  return axios({
    method: 'post',
    url: `${DOMAIN}/api/v1/reset-password`,
    data,
  });
};
export {LoginServices, ConfirmResetPassword,ResetPassword};
