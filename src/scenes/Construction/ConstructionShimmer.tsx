import SkeletonPlaceholder from "./AnimationShimer";
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import * as stylesGlobal from '../../styles';

const image = [0, 1, 2, 3]
const { width } = Dimensions.get('screen');
const IMAGE_SIZE = (width - 20) / 4;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

type Props = {
  myID?: string
};
const ConstructionShimmer: React.FC<Props> = (myID) => {

  const runAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(
      runAnim,
      {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false
      }

    ).start();
  }, [runAnim])

  return (
    <SkeletonPlaceholder>


      <View
        style={{

          borderStyle: 'solid',
          borderBottomColor: 'rgba(0,0,0,0.1)',
          borderBottomWidth: 1,
          padding: 5

        }}>
        <View style={{
          backgroundColor: stylesGlobal.colors.LOADING,
          marginBottom: 4,
          height: 40,
          
        }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
          {image.map((index) =>
            <View
              key = {index}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                marginHorizontal: 2,
                borderRadius: 6,
                marginBottom: 4
              }}
            />

          )}
        </View>

      </View>
    </SkeletonPlaceholder>
  )
};

export default ConstructionShimmer



