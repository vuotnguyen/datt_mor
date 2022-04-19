import React, {memo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  Animated,
} from 'react-native';
const {width, height} = Dimensions.get('screen');
import colors from '../../../styles/colors';
const ImageMasonry: React.FC<{
  uri: string;
  indexItem: number;
  styleWrapper?: StyleProp<ViewStyle>;
  style?: StyleProp<ImageStyle>;
}> = ({uri, style, indexItem, styleWrapper}) => {
  // const [isloaded, setLoaded] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const startLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const closeLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  return (
    <View
      style={[
        {
          //   flex: 0.5,
          position: 'relative',
          width: width / 2 - 14,
        },
        indexItem % 2 == 0 ? {paddingRight: 4} : {paddingLeft: 4},
      ]}>
      <View style={{backgroundColor: colors.LOADING}}>
        <Image
          source={{
            uri: uri,
            height: width / 2 - 14,
          }}
          resizeMode={'cover'}
          resizeMethod={'auto'}
          style={[{width: '100%'}, style]}
          // onLoad={() => {
          //   setLoaded(true);
          // }}
          onLoadStart={startLoading}
          onLoad={closeLoading}
        />
        {/* {!isloaded ? (
          <View
            style={[
              styles.wapperLoading,
              indexItem % 2 == 0 ? {right: 4} : {left: 4},
            ]}>
            <ActivityIndicator size="large" color="rgba(0,0,0,0.3)" />
          </View>
        ) : null} */}
        <Animated.View
          style={[
            styles.wapperLoading,
            indexItem % 2 == 0 ? {right: 4} : {left: 4},
            {opacity: fadeAnim},
          ]}>
          <ActivityIndicator size="large" color="rgba(0,0,0,0.3)" />
        </Animated.View>
      </View>
    </View>
  );
};
export default ImageMasonry;
const styles = StyleSheet.create({
  wapperLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 5,
  },
});
