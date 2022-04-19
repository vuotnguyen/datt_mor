import React, {memo} from 'react';
import {Dimensions, Platform, StyleSheet, Text, View} from 'react-native';
const screen = Dimensions.get('screen');

const Badge: React.FC<{
  type: 'success' | 'danger';
  count: number | string;
  height?: number;
  width?: number;
  background?: string;
  fontSize?: number;
}> = ({type, count, width, background, height, fontSize}) => {
  return count > 0 ? (
    <View
      style={[
        styles.dot,
        {
          height: height ? height : 20,
          minWidth: width ? width : count > 99 ? 24 : 18,
          backgroundColor: background
            ? background
            : type === 'success'
            ? '#4CC765'
            : '#FF344A',
          borderWidth: 1,
          borderColor: '#fff',
          paddingHorizontal: Platform.OS === 'ios' ? 4 : 3,
          position: 'relative',
        },
      ]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: fontSize ? fontSize : 12,
            width: width ? width : 20,
            fontWeight: '600',
            textAlign: 'center',
            marginRight: count > 99 ? (Platform.OS === 'ios' ? 4 : 2) : 0,
          },
        ]}>
        {count > 99 ? 99 : count}
      </Text>
      {count > 99 ? (
        <Text
          style={{
            fontSize: 8,
            color: '#fff',
            fontWeight: '500',
            position: 'absolute',
            right: 2,
          }}>
          +
        </Text>
      ) : null}
    </View>
  ) : null;
};
export const BadgeText: React.FC<{
  type: 'success' | 'danger';
  count: number | string;
  height?: number;
  width?: number;
  background?: string;
  fontSize?: number;
}> = memo(({type, count, width, background, height, fontSize}) => {
  return (
    <View
      style={[
        styles.dot,
        {
          height: height ? height : 20,
          minWidth: width ? width : count > 99 ? 24 : 18,
          backgroundColor: background
            ? background
            : type === 'success'
            ? '#4CC765'
            : '#FF344A',
          borderWidth: 1,
          borderColor: '#fff',
          paddingHorizontal: Platform.OS === 'ios' ? 4 : 3,
          position: 'relative',
        },
      ]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: fontSize ? fontSize : 12,
            width: width ? width : 20,
            fontWeight: '600',
            textAlign: 'center',
          },
        ]}>
        {count}
      </Text>
    </View>
  );
});
export default memo(Badge);
const styles = StyleSheet.create({
  dot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // paddingHorizontal: 5,
    borderRadius: screen.height,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
