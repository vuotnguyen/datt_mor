import React, {memo, useCallback, useState} from 'react';
import {Platform, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Entypo} from '../../assets/icons';
import AvatarGroup from '../../components/common/Avatar/avatarSetting';
import PopupCenter from '../../components/common/PopupCenter';
import {useMedia} from '../../hooks/camera';
import SingleGalleryModal from '../../components/common/SingleGalleryModal';
import {PhotoIdentifier} from '@react-native-community/cameraroll';
import {IToast, TypeToash} from '../../models/common';
import MESSAGES_const from '../../config/Messages';
import {IGroupChatInfo} from '../../models/chat';
import {Avatar} from '../../models/image';
import {apiUploadImage, CATEGORY_TYPE} from '../../services/image';
import DropdownAlertComponent from 'react-native-dropdownalert';
import LoadingModal from './LoadingModal';

const AvatarGroupHandle: React.FC<{
  loading: boolean;
  isAdmin: boolean;
  textGroupName: string;
  fileImage: // | {
  //     file_name: string;
  //     uri: string;
  //     type?: string;
  //   }
  string | undefined;
  refDropDownAlert: React.MutableRefObject<DropdownAlertComponent | null>;
  infoRoom: IGroupChatInfo | undefined;
  handleApiUpdateInfoGroupChat: (
    infoRoomParam: IGroupChatInfo,
    dataUpdating: {
      textName: string;
      // avatarGroup?: Avatar | {};
      avatarGroup?: string | null | undefined;
    },
    CancelLoading: () => void,
  ) => void;
}> = memo(
  ({
    loading,
    textGroupName,
    isAdmin,
    fileImage,
    refDropDownAlert,
    infoRoom,
    handleApiUpdateInfoGroupChat,
  }) => {
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
    const [loadingApi, setloadingApi] = useState<boolean>(false);
    const {captureImage} = useMedia();
    /**
     * ----------------handles avatar group chat-----------------------------------------------
     */
    // handle api upload avatar
    const handleApiUploadAvatar = useCallback(
      (file: {uri: string; type: string; fileName: string}) => {
        // console.log(infoRoom, 'info room avt group handle ???');

        let formUpload = new FormData();
        const {uri, type, fileName} = file;
        let image = {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: fileName,
          // name: undefined,
          type: type,
        };
        // console.log(image, 'image avt group handle???');
        formUpload.append('file', image);
        formUpload.append('object_type', 'GR');
        formUpload.append('object_id', infoRoom?.room_id);
        console.log(formUpload, 'form upload');
        setloadingApi(true);
        apiUploadImage(CATEGORY_TYPE.AVATAR, formUpload)
          .then(res => {
            const resData = res.data;
            // console.log(res.data, 'upload success avatar ???');
            // setloadingApi(false);
            if (resData) {
              //   let avatarGroup: Avatar = {
              //     id: resData[0].id,
              //     create_at: resData[0].create_at,
              //     file_name: resData[0].file_name,
              //     path_file: resData[0].path_file,
              //     path_file_thumb: resData[0].path_file_thumb,
              //   };
              let avatarGroup: Avatar = {
                path_file: resData.path_file,
                create_at: resData.create_at,
                user_id: resData.user_id,
                link_url_file: resData.link_url_file,
              };

              let avatarGroupUrl = avatarGroup.link_url_file;

              if (infoRoom) {
                console.log('run update');

                handleApiUpdateInfoGroupChat(
                  infoRoom,
                  {
                    textName: textGroupName,
                    // avatarGroup: avatarGroup,
                    avatarGroup: avatarGroupUrl,
                  },
                  () => setloadingApi(false),
                );
              } else {
                console.log('not run update');
              }
            }
          })
          .catch(error => {
            console.log('apiUploadImage error', error);

            refDropDownAlert.current?.alertWithType(
              TypeToash.ERROR,
              MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
              // can`t not update group's avatar, please try again
              'グループのアバターを更新できません。もう一度やり直してください',
            );
            setloadingApi(false);
          });
      },
      [textGroupName, infoRoom],
    );

    // --------------capture image ---------------------
    const handleCaptureImage = useCallback(async () => {
      try {
        await captureImage('photo', async response => {
          console.log('captureImage');
          let payload: IToast;
          if (response.didCancel) {
            console.log('didCancel');

            return;
          } else if (response.errorCode == 'camera_unavailable') {
            refDropDownAlert.current?.alertWithType(
              TypeToash.INFO,
              MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_002,
              MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
            );
            return;
          } else if (response.errorCode == 'permission') {
            refDropDownAlert.current?.alertWithType(
              TypeToash.INFO,
              MESSAGES_const.CAMERA.MSG_CAMERA_TEXT_003,
              MESSAGES_const.COMMON.MSG_COMMON_TEXT_WARN,
            );
            return;
          } else if (response.errorCode == 'other') {
            refDropDownAlert.current?.alertWithType(
              TypeToash.ERROR,
              'Permission not satisfied',
              MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
            );
            return;
          }

          let file = response;
          // console.log(file, 'file capture ???');
          if (file.uri && file.type && file.fileName) {
            handleApiUploadAvatar({
              uri: file.uri,
              type: file.type,
              fileName: file.fileName,
            });
          }
        });
      } catch (error) {
        console.log('error handleCaptureImage', error);
      }
    }, [fileImage, textGroupName, infoRoom]);

    // -------------choose image from gallery -----------
    const handleChooseGallery = useCallback(
      (f: PhotoIdentifier) => {
        if (f.node.image && f.node.image.filename) {
          console.log(f, 'file gallery ??');
          handleApiUploadAvatar({
            uri: f.node.image.uri,
            type: f.node.type,
            fileName: f.node.image.filename,
          });
        }
      },
      [infoRoom],
    );

    // --------------delete image -----------------------
    const handleRemoveAvatar = useCallback(() => {
      if (infoRoom) {
        setloadingApi(true);
        handleApiUpdateInfoGroupChat(
          infoRoom,
          {
            textName: textGroupName,
            // avatarGroup: {},
            avatarGroup: '',
          },
          () => setloadingApi(false),
        );
      }
    }, [textGroupName, infoRoom]);

    return (
      <>
        <TouchableOpacity
          style={{position: 'relative'}}
          disabled={!isAdmin}
          onPress={() => {
            setShowPopUp(true);
          }}>
          {/* {console.log('render AvatarHandle')} */}
          <View style={{position: 'relative'}}>
            <AvatarGroup
              // uri={fileImage ? `${String(fileImage.uri)}` : null}
              uri={String(fileImage) ?? ''}
              size={70}
              sizeIconLoad={12}
            />
            {loading ? (
              <View
                style={{
                  backgroundColor: '#f2f2f2',
                  width: 70,
                  height: 70,
                  borderRadius: 70,
                  position: 'absolute',
                }}
              />
            ) : null}
          </View>

          {/* icon */}
          {isAdmin && !loading ? (
            <View
              style={[
                styles.borderIcon,
                {
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  paddingHorizontal: 4,
                  paddingVertical: 3.5,
                },
              ]}>
              <Entypo
                name="camera"
                size={12}
                style={{
                  color: '#000',
                }}
              />
            </View>
          ) : null}
        </TouchableOpacity>

        <PopupCenter
          isShow={showPopUp}
          title={'アバターを更新する'}
          handleClose={() => setShowPopUp(false)}
          tabs={[
            {
              onTabPress: handleCaptureImage,
              title: 'カメラで撮影',
              disableAutoClosed: true,
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
  },
);

export default memo(AvatarGroupHandle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerHorizontalView: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
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
