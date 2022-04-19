import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoIdentifier } from '@react-native-community/cameraroll';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import AvatarRes from '../../components/common/Avatar/avatarSetting';
import LoadingModal from '../../components/common/LoadingModal';
import PopupCenter from '../../components/common/PopupCenter';
import SingleGalleryModal from '../../components/common/SingleGalleryModal';
import MESSAGES from '../../config/Messages';
import { connectDB } from '../../database';
import { UserLocalSchemaOp } from '../../database/modules/DiscoverScreen';
import { ProfileSchemaOp } from '../../database/modules/ProfileScreen';
import { ProfileSchemaType } from '../../database/modules/ProfileScreen/profileSchema';
import { useMedia } from '../../hooks/camera';
import { User } from '../../models/chat';
import { IToast, TypeToash } from '../../models/common';
import { Avatar } from '../../models/image';
import { apiRemoveAvatar, uploadAvatarUser } from '../../services/user';
import { useAppDispatch, useAppSelector } from '../../stories';
import { createAction } from '../../stories/actions';
import { modal, user, infoalluser } from '../../stories/types';
import {useDispatch} from 'react-redux';
import { ImageDateCurrentSchemaType } from '../../database/modules/DiscoverScreen/ImageCurrentDate';
import { ImageSchemaOp } from '../../database/modules/DiscoverScreen';
import { GetAllUserInfo } from '../../stories/actions/infoallUser';

type AvatarHandleProps = {
  size: number;
  avatar: Avatar;
};
const AvatarHandle = React.memo(({ size, avatar }: AvatarHandleProps) => {

  const [showPopUp, setShowPopUp] = React.useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = React.useState<boolean>(
    false,
  );
  const [loadingApi, setloadingApi] = React.useState<boolean>(false);
  const { captureImage } = useMedia();
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();
  const { ImageCurrentDay } = useAppSelector(
    state => state.dataImage,
  );
  /**
   * handle update avatar in local db
   */
  const handleUpdateAvatarInLocal = async (newAvatar: Avatar) => {
    let idUser = '';
    const getUserID = async () => {
      try {
        const value = await AsyncStorage.getItem('@userid');
        if (value !== null) {
          idUser = value;
        }
      } catch (e) {
      }
    };
    await getUserID();
    const realmOpen = await connectDB();
    const allUsers = realmOpen.objects<User>(UserLocalSchemaOp.NAME_SCHEMA);

    const checkImage = ImageCurrentDay.listAll.findIndex( m => m.user.id === idUser);
    if(checkImage!==-1){
      ImageCurrentDay.listAll.map( m => {
        if(m.user.id === idUser){
            m.user.avatar = newAvatar
        }
      });
    }

    realmOpen.write(() => {
      const profileLocal = realmOpen.objectForPrimaryKey<ProfileSchemaType>(
        ProfileSchemaOp.NAME_SCHEMA,
        idUser,
      );
      if (profileLocal) {
        profileLocal.avatar = newAvatar;
      }
      if(allUsers){
        allUsers.map((user: User, index: number) => {
          if (user.id === idUser) {
            allUsers[index].avatar = newAvatar
          }
        })
      }

      const imageDateCurrentLocal = realmOpen.objectForPrimaryKey<ImageDateCurrentSchemaType>(
        ImageSchemaOp.NAME_SCHEMA,
        'ImageDateCurrentID',
      );

      if (imageDateCurrentLocal) {
        imageDateCurrentLocal.image = [];
      }
    })
  }
  /**
   * handle call api update avatar
   */
  const handleUpdateAvatar = async (file: {
    uri: string;
    type: string;
    fileName: string;
  }) => {
    let formUpload = new FormData();
    const { uri, type, fileName } = file;
    let image = {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: fileName,
      type: type,
    };
    formUpload.append('avatar', image);
    setloadingApi(true);
    await uploadAvatarUser(formUpload)
      .then(async res => {
        const resData = JSON.parse(JSON.stringify(res.data));
        let newAvatar: Avatar = resData.avatar;
        //update avatar db local
        handleUpdateAvatarInLocal(newAvatar);
        //update avatar redux
        dispatch(createAction(user.UPDATE_AVATAR_PROFILE, newAvatar));
        const callback = () => {};
        dispatchThunk(GetAllUserInfo(callback, callback, callback));

      })
      .catch(error => {
        console.log('error uploadAvatarUser', error);
        let payload: IToast;
        payload = {
          isShow: true,
          type: TypeToash.ERROR,
          //   Unable to update avatar. Please try again
          message: 'アバターを更新できません。もう一度やり直してください',
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_ERROR,
        };
        dispatch(createAction(modal.SET_TOASH, payload));
      })
      .finally(() => {
        setloadingApi(false);
      });

  };
  /**
   * handle avatar
   */
  // capture image
  const handleCaptureImage = React.useCallback(async () => {
    try {
      await captureImage('photo', async response => {
        let payload: IToast;
        if (response.didCancel) {
          console.log(
            'User cancelled camera picker',
            MESSAGES.CAMERA.MSG_CAMERA_TEXT_001,
          );
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
        let file = response;
        if (file.uri && file.type && file.fileName) {
          await handleUpdateAvatar({
            uri: file.uri,
            fileName: file.fileName,
            type: file.type,
          });
        }
      });
    } catch (error) {
      console.log('error handleCaptureImage', error);
    }
  }, []);

  // choose image from gallery
  const handleChooseGallery = async (f: PhotoIdentifier) => {
    if (f.node.image && f.node.image.filename) {
      await handleUpdateAvatar({
        uri: f.node.image.uri,
        type: f.node.type,
        fileName: f.node.image.filename,
      });
    }
  };

  // remove avatar
  const handleRemoveAvatar = async () => {
    setloadingApi(true);
    await apiRemoveAvatar()
      .then(async res => {
        let resData = JSON.parse(JSON.stringify(res.data));
        console.log('resData clear avatar', resData);
        //update avatar db local
        let newAvatar: Avatar = {
          id: '',
          path_file_thumb: '',
          create_at: '',
          file_name: '',
          path_file: '',
        };
        handleUpdateAvatarInLocal(newAvatar);
        //update avatar redux
        dispatch(createAction(user.UPDATE_AVATAR_PROFILE, newAvatar));
      })
      .catch(error => {
        console.log('error apiRemoveAvatar', error);
        let payload: IToast;
        payload = {
          isShow: true,
          type: TypeToash.ERROR,
          //   Unable to update avatar. Please try again
          message: 'アバターを更新できません。もう一度やり直してください',
          title: MESSAGES.COMMON.MSG_COMMON_TEXT_ERROR,
        };
        dispatch(createAction(modal.SET_TOASH, payload));
      })
      .finally(() => setloadingApi(false));
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShowPopUp(true)}>
        <AvatarRes
          size={size}
          uri={(avatar && avatar.path_file_thumb) ?? ''}
          style={{}}
        />
        <View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              right: 10,
              paddingHorizontal: 4,
              paddingVertical: 3.5,
            },
            styles.borderIcon,
          ]}>
          <Entypo name="camera" size={15} style={{ color: '#000' }} />
        </View>
      </TouchableOpacity>
      <PopupCenter
        isShow={showPopUp}
        title={'アバターを更新する'}
        handleClose={() => setShowPopUp(false)}
        tabs={[
          {
            onTabPress: handleCaptureImage,
            title: 'カメラで撮影',
            disableAutoClosed: true
          },
          {
            onTabPress: () => setShowGalleryModal(true),
            title: '写真を選択',
          },
          {
            onTabPress: handleRemoveAvatar,
            title: '削除',
          },
        ]}
      />
      <SingleGalleryModal
        isShow={showGalleryModal}
        handleClose={() => setShowGalleryModal(false)}
        getGallery={handleChooseGallery}
      />
      <LoadingModal loading={loadingApi} />
    </>
  );
});
export default AvatarHandle;
const styles = StyleSheet.create({
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
