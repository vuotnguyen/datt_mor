import React, {memo, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
import {FontAwesome, EvilIcons} from '../../../assets/icons';
import {useAppSelector} from '../../../stories';
interface Props {
  style: StyleProp<ImageStyle>;
  uri: string;
}
const ImageItem: React.FC<Props> = ({style, uri}) => {
  // const [isloaded, setLoaded] = useState<boolean>(false);
  const [url, setUrl] = useState<string>(uri);
  const [errored, setErrored] = useState<boolean>(false);
  const [noInternet, setNoInternet] = useState<boolean>(false);
  const isConnectNetwork = useAppSelector(
    state => state.dataCache.networkStatusConnect,
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Image.prefetch(uri)
      .then(statusLoading => {
        // setUrl(uri);
        if (statusLoading) {
          setUrl(uri);
        } else {
          setErrored(!errored);
        }
      })
      .catch(error => {
        console.log('error');
        if (isConnectNetwork) {
          setTimeout(() => {
            setErrored(!errored);
          }, 1000);
        } else setNoInternet(true);
      });
  }, [uri, errored]);
  const startLoading = () => {
    // console.log('startLoading');
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
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 1,
            left: 1,
            right: 1,
            bottom: 1,
            zIndex: 10,
            // display: 'flex',
            opacity: fadeAnim,
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            borderColor: 'rgba(230,230,230,0.5)',
            borderWidth: 1,
          },
          // !isloaded ? {} : {},
        ]}>
        {isConnectNetwork ? (
          <ActivityIndicator size={'small'} color="rgba(0,0,0,0.6)" />
        ) : (
          <EvilIcons name={'image'} size={40} color="rgba(0,0,0,0.4)" />
        )}
      </Animated.View>
      {/* {console.log(' render')} */}
      <FastImage
        style={style}
        source={{
          uri: url,
          priority: FastImage.priority.normal,
        }}
        key={url + Date.now()}
        resizeMode={FastImage.resizeMode.cover}
        onLoadStart={startLoading}
        // onProgress={closeLoading}
        onLoad={closeLoading}
        // onError={handleError}
      />
    </>
  );
};
export default memo(ImageItem);
const styles = StyleSheet.create({});
