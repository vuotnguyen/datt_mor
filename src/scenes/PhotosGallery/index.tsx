import React, {memo, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {File, IMessageReceiver, User} from '../../models/chat';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageResView from '../../components/organisms/ImageResView/imageModal';
const {height, width} = Dimensions.get('screen');
interface Props {
  navigation: any;
}
const PhotosGallery: React.FC<Props> = ({navigation}) => {
  const user_sender: User = navigation.getParam('user_sender');
  const img: {
    src: File;
    create_at: string;
  } = navigation.getParam('img');
  const [heightImage, setHeightImage] = useState<number>(0);
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: 'rgba(0,0,0,0.8)'}]}>
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
        // swipeDownThreshold={100}
        onSwipeDown={() => {
          setHeightImage(0);
          console.log('onSwipeDown');
          navigation.navigate('IndividualChat');
        }}
        style={{
          flex: 10,
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <ImageResView
          thumbnail={img.src.path_file_thumb}
          imageUri={img.src.path_file}
          onLayout={e => {
            console.log('nativeEvent', e.nativeEvent.layout.height);
            setHeightImage(e.nativeEvent.layout.height);
          }}
        />
      </ImageZoom>
    </SafeAreaView>
  );
};
export default memo(PhotosGallery);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
