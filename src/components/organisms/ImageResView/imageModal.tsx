import React, {memo, useCallback, useMemo, useState} from 'react';
import {
  Image,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  LayoutChangeEvent,
  ImageBackground,
} from 'react-native';
// error because this library not support type for typescript !
import ResponsiveImageView, {
  useResponsiveImageView,
} from 'react-native-responsive-image-view';
import {colors} from '../../../styles';
import LoadingWrapper from '../../common/LoadingCircle/loadingWrapper';

interface Props {
  imageUri: string;
  thumbnail: string;
  styles?: StyleMedia;
  onLayout?: (event: LayoutChangeEvent) => void;
  height?: number;
}
const screen = Dimensions.get('screen');
const ImageView: React.FC<Props> = ({imageUri, onLayout}) => {
  // const {getViewProps, getImageProps} = useResponsiveImageView({
  //   source: {uri: imageUri},
  // });
  const [isloaded, setLoaded] = useState<boolean>(false);
  return (
    // <View style={{}}>
    //   <View
    //     style={[{position: 'relative'}, !isloaded ? {padding: 8} : {}]}
    //     {...getViewProps()}>
    //     <ImageBackground
    //       {...getImageProps()}
    //       blurRadius={isloaded ? 0 : 10}
    //       onLoad={() => {
    //         setLoaded(true);
    //       }}
    //       onLayout={onLayout}
    //     />
    //     {!isloaded ? <LoadingWrapper bg={'rgba(255,255,255,0.5)'} /> : null}
    //   </View>
    // </View>
    <View style={{position: 'relative'}}>
      <ResponsiveImageView source={{uri: imageUri}}>
        {({getViewProps, getImageProps}) => (
          <View {...getViewProps()}>
            <Image
              {...getImageProps()}
              // blurRadius={isloaded ? 0 : 10}
              onLoad={() => {
                setLoaded(true);
              }}
              onLayout={onLayout}
            />
            {!isloaded ? <LoadingWrapper bg={'rgba(255,255,255,0.5)'} /> : null}
          </View>
        )}
      </ResponsiveImageView>
    </View>
  );
};

export default ImageView;
