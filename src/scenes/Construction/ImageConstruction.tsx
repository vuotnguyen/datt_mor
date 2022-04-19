import { transform } from "@babel/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View } from "native-base";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Pressable, StyleSheet, TextInputBase, TouchableHighlight } from "react-native";
import { Text } from "react-native-animatable";
import FastImage from 'react-native-fast-image';
import { MaterialCommunityIcons } from '../../assets/icons';
import { useAppDispatch, useAppSelector } from '../../stories';
import { createAction } from '../../stories/actions';
import { dataCache } from '../../stories/types';
import {useS3} from '../../hooks/aws';
const {getSignedUrl} = useS3();

const AnimationFastImage = Animated.createAnimatedComponent(FastImage)


const { width } = Dimensions.get('screen');
const IMAGE_SIZE = (width - 10) / 4;

type Props = {
  show: any;
  item: any,
  fadeAnim: any;
};
const ImageConstruction: React.FC<Props> = ({ show, item, fadeAnim }) => {
  const [isPress, setIsPress] = useState(false)
  const dispatchLocal = useAppDispatch();
  const { isLongPressImage } = useAppSelector((state) => state.dataCache);
  
  useEffect(() => {
    if (isLongPressImage == false) {
      setIsPress(false)
    }
  }, [isLongPressImage]);

  const renderCheckBox = useCallback(() => {
    if (isLongPressImage == true) {
      return (
        isPress == false ?
          null
          :
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name={'checkbox-marked-circle'}
              size={20} color={'#0295FF'} />
          </View>
      )
    } else {
      // setIsPress(false)
      return null
    }
  }, [isLongPressImage, isPress])

  const longClick = async () => {
    let roleuser = await AsyncStorage.getItem('@userRole');
    if (roleuser == 'Admin') {
      setIsPress(true)
      dispatchLocal(createAction(dataCache.LIST_IMAGE_DELELE, {id: item.SK, isDel: true}))
      dispatchLocal(createAction(dataCache.IS_LONGPRESS_IMAGE, true))
    }
  }

  return (
    <Pressable
      onPress={() => {
        if (isLongPressImage == true) {
          dispatchLocal(createAction(dataCache.LIST_IMAGE_DELELE, {id: item.SK, isDel: !isPress}))
          setIsPress(!isPress)
        }
      }}
      onLongPress={longClick}
    >
      <AnimationFastImage
        onLoadStart={show}
        source={{ uri: getSignedUrl(item?.path_file_thumb)}}

        style={[styles.image, {
          opacity: fadeAnim
        }]} />
      {renderCheckBox()}
    </Pressable >
  )
};

export default memo(ImageConstruction);
const styles = StyleSheet.create({
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginHorizontal: 2,
    borderRadius: 6,
    marginBottom: 4
  },
  icon: {
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    right: 0
  }
});
