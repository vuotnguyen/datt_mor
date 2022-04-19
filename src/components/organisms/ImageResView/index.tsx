import React, {memo, useCallback, useMemo, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  Modal,
} from 'react-native';
// error because this library not support type for typescript !
import {useResponsiveImageView} from 'react-native-responsive-image-view';
import {NoImage} from '../../../assets/images/other';
import {colors} from '../../../styles';

interface Props {
  imageUri: string;
  thumbnail: string;
  styles?: StyleMedia;
  onLayout?: Function;
  height?: number;
}
const screen = Dimensions.get('screen');
const ImageView: React.FC<Props> = ({
  imageUri,
  styles,
  onLayout,
  height,
  thumbnail,
}) => {
  const {getViewProps, getImageProps} = useResponsiveImageView({
    source: {uri: imageUri},
  });
  const [isloaded, setLoaded] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);
  return (
    // <ImageBackground
    //   {...getViewProps()}
    //   onLayout={onLayout}
    //   source={NoImage}
    //   blurRadius={isloaded ? 0 : 3}>

    // </ImageBackground>
    <View {...getViewProps()}>
      <View
        style={[
          {flex: 1, position: 'relative'},
          !isloaded
            ? {
                backgroundColor: colors.LOADING,
                height: screen.height / 3,
                overflow: 'hidden',
              }
            : {},
        ]}>
        <View style={!isloaded ? {padding: 8} : {}}>
          {height ? (
            <Image
              {...getImageProps()}
              height={height}
              progressiveRenderingEnabled
              blurRadius={isloaded ? 0 : 10}
              onLoad={() => { 
                setLoaded(true);
              }}
            />
          ) : (
            <Image
              {...getImageProps()}
              blurRadius={isloaded ? 0 : 10}
              onLoad={() => {
                setLoaded(true);
              }}
            />
          )}
        </View>
        {!isloaded ? (
          <View
            style={{
              position: 'absolute',
              backgroundColor: colors.LOADING,
              top: 1,
              left: 0,
              right: 0,
              bottom: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              paddingVertical: 5,
            }}>
            <ActivityIndicator size="large" color="rgba(0,0,0,0.3)" />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    padding: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
export default memo(ImageView);
