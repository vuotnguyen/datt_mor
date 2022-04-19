import { Dimensions } from 'react-native';
import { common, dataCache } from '../types';
import { IAction } from '../actions';
import { Construction1 } from '../../models/construction';
interface IState {
  dimensions: {
    window: {
      height: number;
      width: number;
    };
    screen: {
      height: number;
      width: number;
    };
  };
  loading: {
    value: boolean;
  };
  currentScreen: string | null;
  networkStatusConnect: boolean;
  isLoadConstruction: boolean;
  isLongPressImage: boolean
  listImageDelete: Array<string>
}
const initialState: IState = {
  dimensions: {
    window: {
      height: 0,
      width: 0,
    },
    screen: {
      height: 0,
      width: 0,
    },
  },
  loading: {
    value: false,
  },
  currentScreen: null,
  networkStatusConnect: true,
  isLoadConstruction: true,
  isLongPressImage: false,
  listImageDelete: []
};

const reducer = (state = initialState, { type, payload }: IAction) => {
  switch (type) {
    case dataCache.GET_DIMENSIONS_DEVICE: {
      const window = Dimensions.get('window');
      const screen = Dimensions.get('screen');
      state.dimensions = { window, screen };
      return { ...state };
    }
    case dataCache.LOADING_START: {
      state.loading.value = true;
      return { ...state };
    }
    case dataCache.LOADING_FINISH: {
      state.loading.value = false;
      return { ...state };
    }
    case dataCache.SET_SCREEN_NAVIGATION: {
      state.currentScreen = payload;
      return { ...state };
    }
    case dataCache.FETCH_NETWORK_STATUS: {
      //payload :{connect:boolean}
      state.networkStatusConnect = payload.connect;
      return { ...state };
    }
    case common.CLEAR_DATA: {
      return { ...state };
    }
    case dataCache.IS_LOAD_CONSTRUCTION: {
      state.isLoadConstruction = payload
      return { ...state };
    }
    case dataCache.IS_LONGPRESS_IMAGE: {
      state.isLongPressImage = payload
      return { ...state };
    }
    case dataCache.LIST_IMAGE_DELELE: {
      // console.log(payload);

      if (payload.isDel == true) {
        state.listImageDelete.push(payload.id)
      } else {
        const index = state.listImageDelete.indexOf(payload.id);
        if (index > -1) {
          state.listImageDelete.splice(index, 1);
        }
      }
      return { ...state }
    }

    default:
      return state;
  }
};

export default reducer;
