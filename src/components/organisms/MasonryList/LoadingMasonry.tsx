import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {SafeAreaView} from 'react-native-safe-area-context';
const {height, width} = Dimensions.get('window');
import COLORS from '../../../styles/colors';
const colorLoading = COLORS.LOADING;
export default function LoadingMasonry() {
  return (
    <SafeAreaView
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 14,
      }}>
      <View style={{display: 'flex', width: width / 2 - 18}}>
        {/* <SkeletonPlaceholder>
          <View
            style={[styles.image, {height: 125, marginBottom: 8}]}
          />
          <View style={[styles.image, {height: 100, marginBottom: 8}]} />
        </SkeletonPlaceholder> */}
        <View
          style={[
            styles.image,
            {height: 200, marginBottom: 8, backgroundColor: colorLoading},
          ]}
        />
        <View
          style={[
            styles.image,
            {height: 200, marginBottom: 8, backgroundColor: colorLoading},
          ]}
        />
      </View>
      <View style={{display: 'flex', width: width / 2 - 18}}>
        {/* <SkeletonPlaceholder>
          <View style={[styles.image, {height: 100, marginBottom: 8}]} />
          <View
            style={[styles.image, {height:200, marginBottom: 8}]}
          />
        </SkeletonPlaceholder> */}
        <View
          style={[
            styles.image,
            {height: 200, marginBottom: 8, backgroundColor: colorLoading},
          ]}
        />
        <View
          style={[
            styles.image,
            {height: 200, marginBottom: 8, backgroundColor: colorLoading},
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: width / 2 - 18,
  },
});
