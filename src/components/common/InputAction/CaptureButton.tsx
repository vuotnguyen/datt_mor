import React, {memo, useCallback} from 'react';
import {Dimensions, StyleSheet, View, Platform} from 'react-native';
import {Entypo} from '../../../assets/icons';
import {useAppDispatch} from '../../../stories';
import {ButtonIcon} from '../../buttons';
import MESSAGES_const from '../../../config/Messages';
import {useMedia} from '../../../hooks/camera';
import {createAction} from '../../../stories/actions';
import {modal} from '../../../stories/types';
import {IToast, TypeToash} from '../../../models/common';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {useGallary} from '../../../hooks/gallery';
import Messages from '../../../config/Messages';
import {KeyboardComponentType} from './KeyboardServices';
const {height} = Dimensions.get('screen');
const limitedCount = 50;
const CaptureButton: React.FC<{
  setKeyBoardComponent: (type: KeyboardComponentType | null) => void;
  navigation?: any;
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        img: PhotoIdentifier;
        active: boolean;
        count: number | null;
        disabled: boolean;
      }[]
    >
  >;
  files: {
    img: PhotoIdentifier;
    active: boolean;
    count: number | null;
    disabled: boolean;
  }[];
  refreshGallery: boolean;
  setRefreshGallery: (val: boolean) => void;
}> = memo(
  ({
    setKeyBoardComponent,
    navigation,
    setFiles,
    files,
    refreshGallery,
    setRefreshGallery,
  }) => {
    const dispatch = useAppDispatch();
    const {captureImage} = useMedia();
    const {saveImage} = useGallary();

    const _captureImage = useCallback(async () => {
      let key = new Date().getTime();
      try {
        await captureImage('photo', async response => {
          let payload: IToast;
          if (response.didCancel) {
            // navigation?.goBack('IndividualChat');

            return;
          } else if (response.errorCode == 'camera_unavailable') {
            payload = {
              isShow: true,
              type: TypeToash.INFO,
              message: MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_002,
              title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
            };
            dispatch(createAction(modal.SET_TOASH, payload));
            return;
          } else if (response.errorCode == 'permission') {
            payload = {
              isShow: true,
              type: TypeToash.INFO,
              message: MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_003,
              title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
            };
            dispatch(createAction(modal.SET_TOASH, payload));
            return;
          } else if (response.errorCode == 'other') {
            payload = {
              isShow: true,
              type: TypeToash.ERROR,
              message: 'Permission not satisfied',
              title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
            };
            dispatch(createAction(modal.SET_TOASH, payload));

            return;
          }

          let file = response;

          if (
            file.uri &&
            file.type &&
            file.fileName &&
            file.height &&
            file.width
          ) {
            let ImageCapture: {
              img: PhotoIdentifier;
              active: boolean;
              count: number | null;
              disabled: boolean;
            } = {
              img: {
                node: {
                  image: {
                    fileSize: null,
                    filename: file.fileName,
                    height: file.height,
                    uri: file.uri,
                    playableDuration: null,
                    width: file.width,
                  },
                  group_name: '',
                  location: null,
                  timestamp: 0,
                  type: file.type,
                },
              },
              active: true,
              count: -1,
              disabled: false,
            };
            saveImage(file.uri)
              .then(res => {
                if (Platform.OS == 'ios' && res) {
                  ImageCapture.img.node.image.uri = res;
                }
                if (files.length < limitedCount) {
                  let data = [...files, ImageCapture];
                  setFiles(data);
                } else {
                  let payload: IToast = {
                    isShow: true,
                    title: Messages.COMMON.MSG_COMMON_TEXT_WARN,
                    type: TypeToash.WARN,
                    message: `${limitedCount}枚までしか送信できません`,
                  };
                  dispatch(createAction(modal.SET_TOASH, payload));
                }

                setKeyBoardComponent(KeyboardComponentType.GallaryKB);
                setRefreshGallery(!refreshGallery);
              })
              .finally(() => {});
          }
        });
      } catch (error) {
        console.log('error _captureImage', error);
      }
    }, [files, refreshGallery]);
    return (
      <ButtonIcon onPress={() => _captureImage()}>
        <View
          style={[
            {
              paddingHorizontal: 9.5,
              paddingVertical: 9,
              // paddingBottom: 9,
            },
            styles.centerAlign,
          ]}>
          <Entypo name="camera" size={20} style={{color: '#000'}} />
        </View>
      </ButtonIcon>
    );
  },
);
export default CaptureButton;
const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,

    elevation: 0,
  },
  groupActions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    // paddingVertical: 5,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  btnAttach: {
    // backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  input: {
    backgroundColor: 'rgba(229,229,229,0.5)',
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
    // flexWrap: 'wrap',
    fontSize: 13,
  },
  ImagePickerDiv: {
    position: 'relative',
    margin: 2,
    paddingVertical: 4,
  },
  deleteDot: {
    position: 'absolute',
    top: 4,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{translateY: -5}],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnSend: {
    backgroundColor: 'blue',
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
  },
  centerAlign: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  wrapperKeyboardBottom: {
    position: 'relative',
    zIndex: 55,
    height: height / 3,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
});
