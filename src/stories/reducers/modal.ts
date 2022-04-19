import {common, modal} from '../types';
import {IAction} from '../actions';
import {ISliderItem} from '../../models/sliderItem';
import {IImage} from '../../models/image';
import {
  DropdownAlertType,
  DropdownAlertProps,
} from 'react-native-dropdownalert';
import {IToast, TypeToash} from '../../models/common';
interface IState {
  modal: {
    isShow: boolean;
    value: IImage | null;
  };
  alertToast: IToast;
}

const initialState: IState = {
  modal: {
    isShow: false,
    value: null,
  },
  alertToast: {
    isShow: false,
    type: 'custom',
    title: '',
    message: '',
  },
};

const reducer = (state = initialState, {type, payload}: IAction) => {
  switch (type) {
    case modal.SET_MODAL: {
      state.modal = payload;
      return {...state};
    }
    case modal.SET_TOASH: {
      state.alertToast = payload;
      return {...state};
    }
    case common.CLEAR_DATA: {
      state.modal = {
        isShow: false,
        value: null,
      };
      state.alertToast = {
        isShow: false,
        type: 'custom',
        title: '',
        message: '',
      };
      console.log('common.CLEAR_DATA, modal');
      return {...state};
    }
    default:
      return state;
  }
};

export default reducer;
