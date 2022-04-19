import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../../styles';
const {width, height} = Dimensions.get('screen');
export default function LoadingMansoryV2() {
  return (
    <View>
      <View style={styles.wrapper}>
        <View style={[styles.card, {marginRight: 4}]}></View>
        <View style={[styles.card, {marginLeft: 4}]}></View>
      </View>
      <View style={styles.wrapper}>
        <View style={[styles.card, {marginRight: 4}]}></View>
        <View style={[styles.card, {marginLeft: 4}]}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  card: {
    position: 'relative',
    width: width / 2 - 18,
    paddingRight: 4,
    height: width / 2 - 18,
    marginBottom: 8,
    backgroundColor: colors.LOADING,
  },
});
