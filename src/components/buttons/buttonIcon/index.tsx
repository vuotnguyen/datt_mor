import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableHighlight,
  View,
  ViewStyle,
} from 'react-native';

const ButtonIcon: React.FC<{
  borderRadius?: number;
  onPress: Function;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({children, borderRadius, onPress, disabled, style}) => (
  <View
    style={[
      {
        borderRadius: borderRadius ? borderRadius : 500,
        overflow: 'hidden',
      },
      style,
    ]}>
    <TouchableNativeFeedback
      // underlayColor={'rgba(0,0,0,0.2)'}
      onPress={() => onPress()}
      disabled={disabled ? disabled : false}>
      {children}
    </TouchableNativeFeedback>
  </View>
);
export default ButtonIcon;
const styles = StyleSheet.create({});
