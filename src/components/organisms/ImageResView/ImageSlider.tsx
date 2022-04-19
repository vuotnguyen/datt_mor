import React, {memo, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
// error because this library not support type for typescript !
import {useResponsiveImageView} from 'react-native-responsive-image-view';
import {colors} from '../../../styles';

interface Props {
  imageUri: string;
  thumbnail: string;
  styles?: StyleMedia;
  onLayout?: Function;
  height?: number;
}
const ImageView: React.FC<Props> = ({imageUri, height}) => {
  const {getViewProps, getImageProps} = useResponsiveImageView({
    source: {uri: imageUri},
  });
  const [isloaded, setLoaded] = useState<boolean>(false);

  return (
    <View {...getViewProps()}>
      <View
        style={
          !isloaded
            ? {
                padding: 0,
                backgroundColor: colors.LOADING,
                position: 'relative',
              }
            : {}
        }>
        <Image
          {...getImageProps()}
          height={height}
          progressiveRenderingEnabled
          blurRadius={isloaded ? 0 : 10}
          onLoad={() => {
            setLoaded(true);
          }}
        />
        {!isloaded ? (
          <View style={styles.centerView}>
            <ActivityIndicator size="large" color="rgba(0,0,0,0.3)" />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerView: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    bottom: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
export default memo(ImageView);
