import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import {
  CameraOptions,
  ImagePickerResponse,
  iOSVideoOptions,
  launchCamera,
  launchImageLibrary,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
const {height, width} = Dimensions.get('screen');

const useMedia = () => {
  const requestCameraPermission = async () => {
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
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
            buttonPositive: '',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        Alert.alert('Write permission err', err);
      }
      return false;
    } else return true;
  };
  type typeFunc = (response: ImagePickerResponse) => any;
  const captureImage = async (type: MediaType, callback: typeFunc) => {
    const quality: PhotoQuality = 1;
    const videoQuality: 'low' | 'high' | 'medium' | undefined = 'high';
    let options: CameraOptions = {
      // maxWidth: width,
      // maxHeight: height,
      mediaType: type,
      quality,
      videoQuality,
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: false,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      return launchCamera(options, callback);
    }
    // return null;
  };

  const chooseFile = (type: MediaType) => {
    const quality: PhotoQuality = 1;
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        // Alert.alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        // Alert.alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        // Alert.alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'other') {
        // Alert.alert(String(response.errorMessage));
        return;
      }
      // setFilePath(response);
      return response;
    });
  };
  return {chooseFile, captureImage};
};
export {useMedia};
