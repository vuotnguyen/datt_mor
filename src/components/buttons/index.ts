import {StyleProp, ViewStyle} from 'react-native';
import CustomButton from './customButton';
import ButtonIcon from './buttonIcon';
export interface IButton {
  title: string;
  onPress: Function;
  colorButton?: string;
  outlined?: boolean;
  textColor?: string;
  borderColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  colorDisabled?: string;
}
export {CustomButton,ButtonIcon};
