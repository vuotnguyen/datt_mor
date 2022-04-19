import React, {memo, useCallback, useState} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Entypo} from '../../assets/icons';
import AvatarRes from '../../components/common/Avatar';
import PopupCenter from '../../components/common/PopupCenter';
import {useAppDispatch} from '../../stories';
import SingleGalleryModal from '../../components/common/SingleGalleryModal';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {IToast, TypeToash} from '../../models/common';
import MESSAGES_const from '../../config/Messages';
import {createAction} from '../../stories/actions';
import {modal} from '../../stories/types';
import {useMedia} from '../../hooks/camera';

const AvatarConstructionHandle: React.FC<{
  fileImage: PhotoIdentifier | undefined;
  setFileImage: (file: PhotoIdentifier | undefined) => void;
}> = memo(({fileImage, setFileImage}) => {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const {captureImage} = useMedia();
  const dispatch = useAppDispatch();
  /**
   *  capture Image avatar group
   *
   */
  const _captureImage = useCallback(async () => {
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
          let img = {
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
          };
          setFileImage(img);
        }
      });
    } catch (error) {
      console.log('error _captureImage', error);
    }
  }, [fileImage]);

  return (
    <>
      <View style={styles.wrapperAvatar}>
        <TouchableOpacity
          style={{position: 'relative'}}
          onPress={() => setShowPopUp(true)}>
          <AvatarRes
            size={75}
            uri={fileImage ? `${String(fileImage.node.image.uri)}` : ''}
          />
          <View
            style={[
              {
                position: 'absolute',
                bottom: 0,
                right: 0,
                paddingHorizontal: 4,
                paddingVertical: 3.5,
              },
              styles.borderIcon,
            ]}>
            <Entypo name="camera" size={15} style={{color: 'rgba(0,0,0,0.7)'}} />
          </View>
        </TouchableOpacity>
      </View>
      <PopupCenter
        isShow={showPopUp}
        title={'アバターを更新する'}
        handleClose={() => setShowPopUp(false)}
        tabs={[
          {
            onTabPress: () => {
              _captureImage();
            },
            title: 'カメラで撮影',
            disableAutoClosed: true,
          },
          {
            onTabPress: () => setShowGalleryModal(true),
            title: '写真を選択',
          },
          {
            onTabPress: () => setFileImage(undefined),
            title: '削除',
          },
        ]}
      />
      <SingleGalleryModal
        isShow={showGalleryModal}
        handleClose={() => setShowGalleryModal(false)}
        getGallery={setFileImage}
      />
    </>
  );
});

export default memo(AvatarConstructionHandle);

const styles = StyleSheet.create({
  wrapperAvatar: {
    display: 'flex',
    justifyContent: 'center',
    marginVertical: 10,
    marginRight:15,
    // flex: 0.5,
    // width:'40%',
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
