import React, {useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {RNCamera, TakePictureResponse} from 'react-native-camera';
import {FontAwesome5} from '../../assets/icons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import {useAppSelector} from '../../stories';
import MESSAGES_const from '../../config/Messages';
// @ts-ignore
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {FIX_IPHONE_X_BOTTOM_SPACE, STATUS_BAR_HEIGHT} from '../../constants';
import {MediaStackNavigationProp} from '../../navigations/Stacks/MediaStack';

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera permission',
          buttonPositive: '',
        },
      );
      // If CAMERA Permission is granted
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const MediaScreen = () => {
  const navigation = useNavigation<MediaStackNavigationProp>();
  const cameraRef = useRef<RNCamera>(null);
  const lastScreen = useAppSelector(state => state.dataCache.currentScreen);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(true);
  const [enableFlash, setEnableFlash] = useState<boolean>(false);
  const [isFocused, setScreenFocused] = useState<boolean>(false);
  const [cameraType, setCameraType] = useState<any>(
    RNCamera.Constants.Type.back,
  );

  useEffect(() => {
    requestCameraPermission().then(value => {
      setHasCameraPermission(value);
    });
  }, []);
  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
    }, []),
  );
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setScreenFocused(false);
    });
    return unsubscribe;
  }, [navigation]);
  const takePicture = async () => {
    if (cameraRef.current) {
      const data: TakePictureResponse = await cameraRef.current.takePictureAsync(
        {quality: 1},
      );
      if (data.uri) {
        navigation.navigate('DrawPhotoScreen', {imageData: data});
      }
    }
  };
  //for flash change
  const onChangeFlash = () => {
    setEnableFlash(!enableFlash);
  };
  // for switch camera button
  const onChangeCameraType = () => {
    const nextType =
      cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back;
    setCameraType(nextType);
  };
  // for cancel button
  const onCancel = () => {
    console.log('lastScreen', lastScreen);
    if (lastScreen) {
      // @ts-ignore
      navigation.navigate(lastScreen);
    } else {
      navigation.goBack();
    }
  };
  if (!isFocused) {
    return <View />;
  }
  // console.log('hasCameraPermission', hasCameraPermission);
  //
  if (!hasCameraPermission) {
    return (
      <View style={styles.container}>
        <Text>Null camera permissions</Text>
      </View>
    );
  }
  //
  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={cameraType}
        flashMode={
          enableFlash
            ? RNCamera.Constants.FlashMode.on
            : RNCamera.Constants.FlashMode.off
        }
        captureAudio={false}
        useNativeZoom={true}
      />
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.rightCircleButton}
          onPress={onChangeFlash}>
          <IonIcon
            name={enableFlash ? 'flash' : 'flash-off'}
            color="white"
            size={24}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.footerLeft}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelText}>
              {MESSAGES_const.COMMON.BUTTON.CANCEL_002}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePicture} style={styles.circleButton} />
        </View>
        <View style={styles.footerRight}>
          <TouchableOpacity onPress={onChangeCameraType}>
            <View style={styles.rightCircleButton}>
              <FontAwesome5
                name={'sync-alt'}
                size={17}
                style={{color: 'white'}}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MediaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    alignItems: 'center',
  },
  topContainer: {
    position: 'absolute',
    // @ts-ignore
    marginTop: STATUS_BAR_HEIGHT + 20,
    margin: 20,
  },
  capture: {
    flex: 0,
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    backgroundColor: 'white',
  },
  buttonContainer: {
    width: 58,
    height: 58,
    borderRadius: 58 / 2,
    backgroundColor: 'transparent',
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'white', // TODO change to 'black' when done task
  },
  footerContainer: {
    bottom: 0 + FIX_IPHONE_X_BOTTOM_SPACE,
    position: 'absolute',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  rightCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: '#1a1818',
    opacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    marginVertical: 12,
    color: 'white',
    fontSize: 18,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
