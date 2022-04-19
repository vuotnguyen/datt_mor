import {DOMAIN} from '../config/Constants';
import Axios, {AxiosRequestConfig} from 'axios';
import {useAppSelector} from '../stories';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum METHOD_API {
  GET = 1,
  POST = 2,
  DELETE = 3,
  PUT = 4,
  PATCH = 5,
  UPLOAD_IMAGE = 6,
  AVATAR_IMAGE = 7,
}
export const createConnector = async (
  type: METHOD_API,
  url: string,
  data?: any,
) => {
  let token = '';
  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@accessToken');
      if (value !== null) {
        // value previously stored
        token = value;
      }
    } catch (e) {
      // error reading value
    }
  };
  await getData();
  const config: AxiosRequestConfig = {};
  if (token) {
    config.headers = {
      'x-authorization': 'Bearer ' + token,
      // 'x-authorization': 'Bearer ' + token,
    };
  }
  // let tmpToken = `Bearer eyJraWQiOiJ5NUh6c1VrRXBIbHJyclwvbDJtV3dHT05rSjZ3Q3hicEhlK3hrM215NUJ0OD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlMTIwZDJiMy0xMWE3LTQzYWYtYTJkYy1iMzNiMDM0ZmVmZjAiLCJldmVudF9pZCI6IjljMTY5NGY2LTUxNGQtNGI3ZC1hZTBiLTI1MjFkZTdlY2RiNSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MjE3OTI4NzksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1ub3J0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1ub3J0aGVhc3QtMV9OVnVUdk1Fd2MiLCJleHAiOjE2MjE4NzkyNzksImlhdCI6MTYyMTc5Mjg3OSwianRpIjoiMmQxZTBjZGItYjE4Ny00NjM0LTk5ZmQtZGNlNGIyOTgwNmRmIiwiY2xpZW50X2lkIjoiMXI5aWtzcThja2RkMzlqYTdzNjM4ZGhqM3IiLCJ1c2VybmFtZSI6ImUxMjBkMmIzLTExYTctNDNhZi1hMmRjLWIzM2IwMzRmZWZmMCJ9.l5iu_6vB-9B9koJAe_qosqgsZHo2lJGqy-5UzfKj4ic21CV2ghrd8i8ZZAISCCTm-H3BK4hd-HJDF02K4XrXewJPN9INHR7slDg43NqUPnPpGHO1FAPzD7stIZF2VJhnfx1euTsHGJBBZ9oKPfZhvIljLUgfRpKVaLnOkBFG5KXzMnFs4124EUvL9xJ1rFk-Eis4P_S9tP8KRnj7rA2DKjEic1IUocAQzrjMuPL8IEjuHHCkMOqMFfYyZld1MbZ-hVBEDn7Unp9q5DPM78hrstrccLl7L3uQBlfk9isSTOcMMViatcKyLggUMAbl0vsFXdK-ClNAedUVy8ttenH_-g`;
  // config.headers = {
  //   // 'x-authorization': 'Bearer ' + token,
  //   'x-authorization': 'Bearer ' + tmpToken,
  // };
  // return Axios.get(`${DOMAIN}/${url}`, config);
  // console.log('`${DOMAIN}/${url}`', `${DOMAIN}/${url}`);
  // console.log('token', token);

  const obAxios = {
    [METHOD_API.GET]: async () => await Axios.get(`${DOMAIN}/${url}`, config),
    [METHOD_API.POST]: async () =>
      await Axios.post(`${DOMAIN}/${url}`, data, config),
    [METHOD_API.DELETE]: async () =>
      await Axios.delete(`${DOMAIN}/${url}`, config),
    [METHOD_API.PATCH]: async () =>
      await Axios.patch(`${DOMAIN}/${url}`, data, config),
    [METHOD_API.PUT]: async () =>
      await Axios.put(`${DOMAIN}/${url}`, data, config),
    [METHOD_API.UPLOAD_IMAGE]: async () =>
      await Axios.post(`${DOMAIN}/${url}`, data, {
        headers: {
          'x-authorization': 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      }),
    [METHOD_API.AVATAR_IMAGE]: async () =>
      await Axios.put(`${DOMAIN}/${url}`, data, {
        headers: {
          'x-authorization': 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      }),
  };
  // console.log(`${DOMAIN}/${url}`);

  return await obAxios[type]();
};
