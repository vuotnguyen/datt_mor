import React, {memo, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useAppDispatch} from '../../../stories';
import {createAction} from '../../../stories/actions';
import {individualChat} from '../../../stories/types';
import ImageResView from '../ImageResView/imageModal';
import LoadingWrapper from '../../common/LoadingCircle/loadingWrapper';
const {height, width} = Dimensions.get('screen');

interface Prop {
  item: {
    img: PhotoIdentifier;
    active: boolean;
    count: number | null;
  };
  handleChooseImage: (filename: string, uri: string) => void;
}
const ImageGallery: React.FC<Prop> = ({item, handleChooseImage}) => {
  // const [active, setActive] = useState<boolean>(false);
  const [isloaded, setLoaded] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  return (
    <TouchableOpacity
      onPress={() => {
        // setActive(!active);
        if (item.img.node.image.filename && item.img.node.image.uri) {
          handleChooseImage(
            item.img.node.image.filename,
            item.img.node.image.uri,
          );
        }
      }}>
      <View
        style={[
          styles.box,
          {
            zIndex: 1,
            padding: 2,
          },
        ]}>
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderColor: 'rgba(230,230,230,0.8)',
            borderWidth: 1,
          }}>
          <Image
            resizeMode="cover"
            style={{
              width: '100%',
              height: '100%',
            }}
            source={{uri: item.img.node.image.uri}}
            onLoad={() => {
              setLoaded(true);
            }}
          />
          {!isloaded ? (
            <LoadingWrapper size={'small'} style={{top: 0, bottom: 0}} />
          ) : null}
          {item.active ? (
            <View style={[styles.dot, {zIndex: 10}]}>
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 10,
                }}>
                {item.count ? item.count : ''}
              </Text>
            </View>
          ) : null}
          {item.active ? <View style={styles.bg}></View> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  box: {
    width: width / 3,
    height: width / 3,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 5,
    right: 7,
    height: 25,
    minWidth: 25,
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5,
    borderRadius: height,
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
});
export default ImageGallery;
