import CameraRoll, {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useCallback} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';

export const useGallary = () => {
  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  const getPhotos = useCallback(async (count: number) => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    return CameraRoll.getPhotos({
      first: count,
      assetType: 'Photos',
      groupTypes: 'All',
      include: ['filename'],
    });
  }, []);
  const saveImage = async (uri: string) => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    return await CameraRoll.save(uri, {
      type: 'photo',
    });
  };
  const getAlbums = useCallback(() => {
    return CameraRoll.getAlbums({
      assetType: 'Photos',
    });
  }, []);

  return {
    getPhotos,
    getAlbums,
    saveImage,
  };
};
