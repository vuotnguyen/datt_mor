import { AppDispatch } from '..';
import { IRoomMessages } from '../../models/Messages';
import { message } from '../types';
import {createAction} from './index';
export const fetchMessageLocalStorages = (room:IRoomMessages) => (dispatch:AppDispatch) =>{

     console.log('fetchMessageLocalStorages');
     
     dispatch(createAction(message.FETCH_DATA_ROOM_MESSAGE,room));
}
export const getCurrentRoomLocalStorages = (room_id:string) =>(dispatch:AppDispatch) =>{
     dispatch(createAction(message.GET_MESSAGE_ROOM,room_id));
}