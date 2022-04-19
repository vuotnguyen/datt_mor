import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  LayoutChangeEvent,
  Platform,
  Animated,
  TouchableNativeFeedback,
} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../../stories';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
import * as globalStyles from '../../../styles';
import {AntDesign} from '../../../assets/icons';
const {height, width} = Dimensions.get('window');
import ImageZoom from 'react-native-image-pan-zoom';
import ImageResView from '../ImageResView/imageModal';
import {iconUser} from '../../../assets/images/users';
import {useS3} from '../../../hooks/aws';
import AvatarRes from '../../common/Avatar';
import {IImage} from '../../../models/image';
import {get} from 'lodash';

export default memo(function PhotoMediaScreen() {
  const {isShow, value} = useAppSelector(state => state.dataModal.modal);
  const [heightImage, setHeightImage] = useState<number>(0);
  const dispatch = useAppDispatch();
  // const imageAnimated = useMemo(() => new Animated.Value(0), []);
  // const handleImageLoad = useCallback(() => {
  //   Animated.timing(imageAnimated, {
  //     toValue: 1,
  //     useNativeDriver: false,
  //   }).start();
  // }, [imageAnimated]);
  // console.log('heightImage',heightImage);
  return isShow ? (
    <SafeAreaView>
      <Modal
        animationType="fade"
        visible={isShow}
        transparent
        onRequestClose={() => {
          dispatch(createAction(modal.SET_MODAL, {isShow: false, value: null}));
        }}>
        {/* header */}
        {value ? (
          <SafeAreaView
            style={[
              styles.centeredView,
              {
                flex: 1,
                // position: 'relative',
                backgroundColor: 'rgba(0,0,0,0.8)',
              },
            ]}>
            <View style={{flex: 1, position: 'relative', zIndex: 1}}>
              <View
                style={[
                  globalStyles.myStyles.dFlex,
                  {
                    position: 'absolute',
                    zIndex: 5,
                    top: 0,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    width: width,
                  },
                ]}>
                {value.user && (
                  <>
                    <View style={{marginRight: 10}}>
                      {/* Avatar */}
                      <AvatarRes
                        size={40}
                        uri={get(value, 'user.avatar', null)}
                      />
                    </View>

                    <View>
                      <Text
                        style={[globalStyles.text.subTitle, {color: '#fff'}]}>
                        {value.user.full_name}
                      </Text>
                      <Text style={[{fontSize: 12, color: '#fff'}]}>
                        {value.user.username}
                      </Text>
                    </View>
                  </>
                )}
                {/* button close */}
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    width: width,
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                  }}>
                  <TouchableNativeFeedback
                    style={{
                      padding: 5,
                      paddingHorizontal: 8,
                      borderRadius: 999,
                    }}
                    onPress={() => {
                      dispatch(
                        createAction(modal.SET_MODAL, {
                          isShow: false,
                          value: null,
                        }),
                      );
                      setHeightImage(0);
                    }}>
                    <AntDesign name="close" size={25} color="#fff" />
                  </TouchableNativeFeedback>
                </View>
              </View>
              {/* image zoom */}
              <View
                style={{
                  flex: 10,
                  position: 'relative',
                  zIndex: 1,
                }}>
                <ImageZoom
                  cropWidth={width}
                  cropHeight={height}
                  imageWidth={width}
                  imageHeight={
                    heightImage
                      ? heightImage > height
                        ? height
                        : heightImage
                      : height / 2
                  }
                  maxOverflow={height}
                  minScale={1}
                  enableCenterFocus={true}
                  enableSwipeDown
                  swipeDownThreshold={100}
                  onSwipeDown={() => {
                    dispatch(
                      createAction(modal.SET_MODAL, {
                        isShow: false,
                        value: null,
                      }),
                    );
                    setHeightImage(0);
                  }}
                  style={{
                    flex: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <ImageResView
                    thumbnail={value.path_file_thumb}
                    imageUri={value.path_file}
                    onLayout={e => {
                      setHeightImage(e.nativeEvent.layout.height);
                    }}
                  />
                </ImageZoom>
              </View>
            </View>
          </SafeAreaView>
        ) : null}
      </Modal>
    </SafeAreaView>
  ) : null;
});

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    height: height,
    width: width,
  },
  text: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000a0',
  },
});
