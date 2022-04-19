import React, {memo, useEffect, useState} from 'react';
// Import required components
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
  Pressable,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Button} from 'native-base';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageResView from '../../components/organisms/ImageResView';
import {useDispatch} from 'react-redux';
import {dataCache, image, modal} from '../../stories/types';
import {createAction, ImageAction, UserAction} from '../../stories/actions';
import {CATEGORY_TYPE} from '../../services/image';
import ModalConfirm from '../../components/common/ModalConfirm';
import * as Modals from '../../stories/types/modal';
import MESSAGES from '../../config/Messages';
import {colors} from '../../styles';
import {
  NavigationActions,
  StackActions,
  withNavigationFocus,
} from 'react-navigation';
import {useAppDispatch, useAppSelector} from '../../stories';
import {IToast, TypeToash} from '../../models/common';
import axios from 'axios';
import {apiUploadImage} from '../../services/image';
import {useMedia} from '../../hooks/camera';
const {width, height} = Dimensions.get('screen');
interface Props {
  navigation: any;
  isFocused: boolean;
}
const PhotoMedia: React.FC<Props> = ({navigation, isFocused}) => {
  // const {show, file} = useAppSelector(state => state.dataImage.captureImage);
  const [modalConfirm, setModalConfirm] = useState<boolean>(false);
  const [isShow, setShow] = useState<boolean>(false);
  const [file, setFilePath] = useState<ImagePickerResponse>({});
  const [loading, setLoading] = useState<boolean>(false);
  const lastScreen = useAppSelector(state => state.dataCache.currentScreen);
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();
  const {captureImage} = useMedia();
  const _captureImage = async () => {
    await captureImage('photo', response => {
      let payload: IToast;
      if (response.didCancel) {
        // Alert.alert('User cancelled camera picker');
        console.log(
          'User cancelled camera picker',
          MESSAGES.CAMERA.MSG_CAMERA_TEXT_001,
        );
        // setFilePath({});
        if (lastScreen) {
          navigation.navigate(lastScreen);
        } else {
          navigation.goBack();
        }

        return;
      } else if (response.errorCode == 'camera_unavailable') {
        console.log(
          'Camera not available on device',
          MESSAGES.CAMERA.MSG_CAMERA_TEXT_002,
        );
        payload = {
          isShow: true,
          type: TypeToash.INFO,
          message: MESSAGES.CAMERA.MSG_CAMERA_TEXT_002,
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_WARN,
        };
        dispatch(createAction(modal.SET_TOASH, payload));
        return;
      } else if (response.errorCode == 'permission') {
        console.log(
          'Permission not satisfied',
          MESSAGES.CAMERA.MSG_CAMERA_TEXT_003,
        );
        payload = {
          isShow: true,
          type: TypeToash.INFO,
          message: MESSAGES.CAMERA.MSG_CAMERA_TEXT_003,
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_WARN,
        };
        dispatch(createAction(modal.SET_TOASH, payload));
        return;
      } else if (response.errorCode == 'other') {
        // Alert.alert(String(response.errorMessage));
        payload = {
          isShow: true,
          type: TypeToash.ERROR,
          message: 'Permission not satisfied',
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_ERROR,
        };
        dispatch(createAction(modal.SET_TOASH, payload));
        return;
      }
      setShow(true);
      console.log('!!!!  Image after resize !!!!!');
      // console.log('!!!!  Image origin !!!!!');
      console.log('---------------------------width -> ', response.width);
      console.log('---------------------------height -> ', response.height);
      console.log('---------------------------fileSize -> ', response.fileSize);
      setFilePath(response);
      setModalConfirm(true);
    }).then(() => {});
  };
  useEffect(() => {
    navigation.setParams({
      captureImage: _captureImage,
    });
  }, []);

  const handleUploadImage = async () => {
    console.log('handleUploadImage');
    let data = new FormData();
    if (file.uri) {
      console.log('file.uri', file.uri);

      data.append('files', {
        uri:
          Platform.OS === 'android'
            ? file.uri
            : file.uri.replace('file://', ''),
        name: file.fileName,
        type: file.type,
      });
      console.log('Image PhotoMedia', {
        uri:
          Platform.OS === 'android'
            ? file.uri
            : file.uri.replace('file://', ''),
        name: file.fileName,
        type: file.type,
      });
    }
    // dispatch(createAction(dataCache.LOADING_START, null));
    setLoading(true);
    await apiUploadImage(CATEGORY_TYPE.ALBUM, data)
      .then(res => {
        let payload: IToast = {
          isShow: true,
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_SUCCESS,
          type: TypeToash.SUCCESS,
          message: MESSAGES.CAMERA.MSG_CAMERA_TEXT_004,
        };
        dispatch(createAction(Modals.SET_TOASH, payload));
        navigation.navigate('Discover');
        dispatchThunk(
          UserAction.GetUserInfo(
            () => {},
            () => {},
            () => {},
          ),
        );
      })
      .catch(error => {
        // console.log('error', error);
        navigation.goBack();
        let payload: IToast = {
          isShow: true,
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_ERROR,
          type: TypeToash.ERROR,
          message: MESSAGES.COMMON.MSG_COMMON_ERROR_001,
        };
        dispatch(createAction(Modals.SET_TOASH, payload));
      })
      .finally(() => {
        setFilePath({});
        setShow(false);
        // if (lastScreen) {
        //   navigation.navigate(lastScreen);
        // } else {
        //   navigation.goBack();
        // }
        setLoading(false);
      });
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <Modal
        animationType="none"
        presentationStyle="overFullScreen"
        transparent
        visible={isShow}>
        <SafeAreaView style={{flex: 1, backgroundColor: 'transparent'}}>
          {isShow ? (
            <View
              style={{
                flex: 1,
                backgroundColor: '#000',
                position: 'relative',
                zIndex: 1,
              }}>
              {/* header */}
              <View
                style={{
                  position: 'absolute',
                  zIndex: 5,
                  top: 0,
                  left: 0,
                  right: 0,
                  justifyContent: 'flex-end',
                  flexDirection: 'row',
                  padding: 5,
                }}>
                <Button
                  rounded
                  light
                  transparent
                  style={{padding: 5, paddingHorizontal: 8}}
                  onPress={() => {
                    setShow(false);
                    setFilePath({});
                    if (lastScreen) {
                      navigation.navigate(lastScreen);
                    } else {
                      navigation.goBack();
                    }
                  }}>
                  <AntDesign name="close" size={25} color="#fff" />
                </Button>
              </View>
              <View
                style={[
                  {
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  },
                ]}>
                <View style={{width: width}}>
                  <ImageResView
                    thumbnail={String(file.uri)}
                    imageUri={String(file.uri)}
                    // onLayout={({nativeEvent}: LayoutChangeEvent) => {
                    //   setHeightImage(nativeEvent.layout.height);
                    // }}
                  />
                </View>
              </View>
              <ModalConfirm
                visible={modalConfirm}
                setVisible={setModalConfirm}
                handleConfirm={async () => await handleUploadImage()}
                disableTitle={true}
                message={MESSAGES.DIALOG.MSG_DIALOG_TEXT_002}
                buttonClose={{
                  color: colors.DANGER,
                  text: MESSAGES.COMMON.BUTTON.CANCEL,
                }}
                buttonConfirm={{
                  color: colors.SUCCESS,
                  text: MESSAGES.COMMON.BUTTON.CONFIRM,
                }}
                disableFeedback={true}
              />
            </View>
          ) : null}

          <Modal
            animationType="fade"
            presentationStyle="overFullScreen"
            transparent
            visible={loading}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size="small" color="#999999" />
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default withNavigationFocus(memo(PhotoMedia));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,
    color: 'black',
    textAlign: 'center',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 5,
    marginVertical: 10,
    width: 250,
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
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
