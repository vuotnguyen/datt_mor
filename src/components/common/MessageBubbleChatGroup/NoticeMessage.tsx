import React from 'react';
import {
  Dimensions,
  StyleProp,
  StyleSheet, View,
  ViewStyle
} from 'react-native';
const {height, width} = Dimensions.get('screen');
interface Props {
  styleBoxContent?: StyleProp<ViewStyle>;
  styleBoxLine?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}
const NoticeMessage: React.FC<Props> = ({
  children,
  style,
  styleBoxContent,
  styleBoxLine,
}) => {
  return (
    <View
      style={[
        {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        },
        style,
      ]}>
      <View
        style={[
          {
            backgroundColor: 'rgba(242, 242, 242,1)',
            height: 1,
            width: width * 0.8,
          },
          styleBoxLine,
        ]}
      />
      <View
        style={[
          {
            backgroundColor: 'rgba(242, 242, 242,1)',
            padding: 5,
            borderRadius: 5,
          },
          styleBoxContent,
        ]}>
        {children}
      </View>
      <View
        style={[
          {
            backgroundColor: 'rgba(242, 242, 242,1)',
            height: 1,
            width: width * 0.8,
          },
          styleBoxLine,
        ]}
      />
    </View>
  );
};
export default NoticeMessage;
const styles = StyleSheet.create({});
