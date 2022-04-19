import {createAction} from '.';
import {auth} from '../types';
import {LoginSericesProps, LoginServices} from '../../services/auth';
import {AppDispatch} from '../';
import AsyncStorage from '@react-native-async-storage/async-storage';
const storeData = async (accessToken: string) => {
  try {
    await AsyncStorage.setItem('@accessToken', accessToken);
  } catch (e) {
    // saving error
  }
};
export const Login = (
  data: LoginSericesProps,
  SuccessCallBack: Function,
  ErrorCallback: Function,
) => {
  return (dispatch: AppDispatch) => {
    LoginServices(data)
      .then(res => {
        const resConvert = JSON.parse(JSON.stringify(res));
        dispatch(
          createAction(
            auth.SET_CREDENTIAL_USER,
            resConvert.signInUserSession.accessToken.jwtToken,
          ),
        );
        storeData(resConvert.signInUserSession.accessToken.jwtToken);
        SuccessCallBack();
      })
      .catch(err => {
        console.log('Login', err);
        ErrorCallback();
      });
  };
};
