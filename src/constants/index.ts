import {Platform, StatusBar, Dimensions} from 'react-native';
import DeviceInfoModule from 'react-native-device-info';

export const DEVICE_HAS_NOTCH = DeviceInfoModule.hasNotch();

export const isIphoneX = () =>
  Platform.OS === 'ios' &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  DEVICE_HAS_NOTCH;

export const STATUS_BAR_HEIGHT = Platform.select({
  ios: isIphoneX() ? 44 : 20,
  android: StatusBar.currentHeight,
});

export const FIX_IPHONE_X_BOTTOM_SPACE = isIphoneX() ? 34 : 0;

export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;

export const PHOTOP_TYPE_ACCEPT = ['jpeg','JPEG' ,'heic',"HEIC", 'png','PNG', 'jpg','JPG'];