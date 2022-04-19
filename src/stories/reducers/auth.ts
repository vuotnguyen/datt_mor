import {auth, common} from '../types';
import {IAction} from '../actions';
interface IState {
  user: {
    id: string;
    fullname: string;
    email: string;
    access_token: string;
    role: string
  };
  token: string;
}

const initialState: IState = {
  user: {
    id: '',
    fullname: '',
    email: '',
    access_token: '',
    role: ''
  },
  token: '',
};

const reducer = (state = initialState, {type, payload}: IAction) => {
  switch (type) {
    case auth.SET_CREDENTIAL_USER: {
      state.token = payload;
      return {...state};
    }
    case common.CLEAR_DATA: {
      state.user = {
        id: '',
        fullname: '',
        email: '',
        access_token: '',
        role: ''
      };
      state.token = '';
      console.log('common.CLEAR_DATA, auth');
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
