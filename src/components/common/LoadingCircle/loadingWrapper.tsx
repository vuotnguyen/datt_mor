import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../../../styles';
const loadingWrapper: React.FC<{
  bg?: string;
  size?: 'large' | 'small';
  style?: StyleProp<ViewStyle>;
}> = ({bg, size, style}) => {
  return (
    <View
      style={[
        {
          position: 'absolute',
          backgroundColor: bg ? bg : colors.LOADING,
          top: 1,
          left: 0,
          right: 0,
          bottom: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingVertical: 5,
        },
        style,
      ]}>
      <ActivityIndicator size={size ? size : 'large'} color="rgba(0,0,0,0.3)" />
    </View>
  );
};
export default loadingWrapper;
const styles = StyleSheet.create({});
