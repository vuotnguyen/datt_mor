import React from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
const {height, width} = Dimensions.get('screen');
import COLORS from '../../../styles/colors';
const colorLoading = COLORS.LOADING;
export default function loadingSilderItem() {
  return (
    <View style={styles.cardView}>
      {/* <SkeletonPlaceholder speed={1000}>
        <View style={[styles.image]} />
      </SkeletonPlaceholder> */}
      <View style={[styles.image, {backgroundColor: colorLoading}]} />
      <View
        style={{
          marginVertical: 15,
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}>
        {/* <SkeletonPlaceholder speed={1000}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 40, height: 40, borderRadius: 40 / 2}} />
            <View style={{marginLeft: 10}}>
              <View style={{width: 80, height: 15, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 75, height: 15, borderRadius: 4}}
              />
            </View>
          </View>
        </SkeletonPlaceholder> */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 40 / 2,
              backgroundColor: colorLoading,
            }}
          />
          <View style={{marginLeft: 10}}>
            <View
              style={{
                width: 80,
                height: 15,
                borderRadius: 4,
                backgroundColor: colorLoading,
              }}
            />
            <View
              style={{
                marginTop: 6,
                width: 75,
                height: 15,
                borderRadius: 4,
                backgroundColor: colorLoading,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardView: {
    width: width,
    backgroundColor: 'transparent',
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  textView: {
    position: 'absolute',
    bottom: 10,
    margin: 10,
    left: 5,
  },
  image: {
    width: '100%',
    height: height / 3,
    borderRadius: 5,
    marginHorizontal: 'auto',
  },
  itemTitle: {
    color: '#fff',
    fontSize: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0.8,
      height: 0.8,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    marginBottom: 5,
    fontWeight: 'bold',
    elevation: 5,
  },
  itemDescription: {
    color: '#fff',
    fontSize: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0.8,
      height: 0.8,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
});
