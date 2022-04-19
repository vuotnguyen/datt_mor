import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../stories';
import { PhotoIdentifier } from '@react-native-community/cameraroll';
import { TypeToash } from '../../models/common';
import MESSAGES_const from '../../config/Messages';
import { User } from '../../models/chat';
import { createAction, UserAction } from '../../stories/actions';
import { dataCache, modal } from '../../stories/types';
import SearchUserList from './SearchUser';
import { apiCreateChatgroup, TypeDataCreateChatGroup } from '../../services/chat';
import { apiUploadImage, CATEGORY_TYPE } from '../../services/image';
import { getListChats } from '../../stories/actions/chat';
import HeaderGroupCreate from './HeaderGroupCreate';
import AvatarGroupHandle from './AvatarGroupHandle';
import InputGroupNameHandle from './InputGroupNameHandle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigations/RootStack';
import {
  getAllGroupInfo,
  syncDataInfoGroup,
} from '../../stories/actions/infoAllGroup';
import { TYPE_DISPATCH } from '../../stories/actions/chat';

import { Avatar } from '../../models/image';
import * as apiChat from '../../services/chat';

const { height } = Dimensions.get('screen');

const CreateGroupScreen = (): JSX.Element => {
  const [groupName, setGroupName] = useState<string>('');
  const [selected, setselected] = useState<Array<User>>([]);
  const [fileImage, setFileImage] = useState<PhotoIdentifier>();
  const [AdminId, setAdminId] = useState<string>('');
  let userAuth = useAppSelector(state => state.dataUser.UserInfo);
  const navigation = useNavigation<RootStackNavigationProp>();
  useEffect(() => {
    AsyncStorage.getItem('@userid').then(res => {
      console.log('res @userid :', res);
      if (res) {
        setAdminId(res);
      } else {
        if (!userAuth.user_id) {
          const callback = () => { };
          dispatchThunk(UserAction.GetUserInfo(callback, callback, callback));
        } else {
          setAdminId(userAuth.user_id);
        }
      }
    });
  }, [userAuth.user_id]);
  let disabledButtonCreate = useMemo(() => {
    if (groupName && selected && selected.length > 0) {
      return false;
    }
    return true;
  }, [groupName, selected]);
  const dispatch = useAppDispatch();
  const dispatchThunk = useDispatch();

  const handleGoback = () => navigation.goBack();

  // console.log(groupName, 'groupname index');
  /**
   *  create new group chat
   *
   *  CALLBACK HELLLLLLLL !!!
   *
   */
  const handleCreateGroupChat = async () => {
    let isAllowCreateGroup = true;
    dispatch(createAction(dataCache.LOADING_START, null));
    let data: TypeDataCreateChatGroup = {
      admin_id: AdminId,
      avatar_group: '',
      group_name: groupName,
      participants_id: selected.map(s => s.user_id),
    };

    if (isAllowCreateGroup) {
      await apiCreateChatgroup(data)
        .then(res => {
          let resData = JSON.parse(JSON.stringify(res.data));
          let roomID = resData.room_id;
          let groupName = resData.group_name;
          // console.log(fileImage, 'file image ???');
          if (fileImage) {
            isAllowCreateGroup = false;
            // upload avatar group if choosed
            let formUpload = new FormData();
            const { filename, uri } = fileImage.node.image;
            let image = {
              uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
              name: filename,
              type: fileImage.node.type,
            };
            formUpload.append('file', image);
            formUpload.append('object_type', 'GR');
            formUpload.append('object_id', roomID);

            //========== UPLOAD IMAGE AFTER GET ROOM ID !! ====================
            let uploadImageHandle = async () => {
              if (formUpload) {
                try {
                  await apiUploadImage(CATEGORY_TYPE.AVATAR, formUpload)
                    .then(res => {
                      const resData = res.data;
                      // console.log(resData, 'data upload avt ok ???');
                      if (resData) {
                        // delete resData[0].user;
                        // data.avatar_group = resData[0];
                        // console.log('data avatar_group', data.avatar_group);
                        // isAllowCreateGroup = true;
                        const avatarGroup: Avatar = {
                          path_file: resData.path_file,
                          create_at: resData.create_at,
                          user_id: resData.user_id,
                          link_url_file: resData.link_url_file,
                        };
                        const dataUpdate: apiChat.TypeDataUpdateChatGroup = {
                          room_id: roomID,
                          group_name: groupName,
                          avatar_group: avatarGroup.link_url_file,
                        };
                        const updateAvatarGroupHandle = async () => {
                          try {
                            await apiChat
                              .apiUpdateChatGroup(dataUpdate)
                              .then(res => {
                                const resDataUpdate = JSON.parse(
                                  JSON.stringify(res.data),
                                );
                                // console.log(
                                //   resDataUpdate,
                                //   'data update avt success???',
                                // );
                                // isAllowCreateGroup = true;
                                console.log('update avatar group ok ???');
                              })
                              .catch(error => {
                                console.log(
                                  error,
                                  'update avt group not ok???',
                                );
                              });
                          } catch (error) {
                            console.log(error, 'update avatar group error ???');
                          }
                        };
                        updateAvatarGroupHandle();
                      }
                    })
                    .catch(error => {
                      console.log(error, 'upload image fail ??');
                      // isAllowCreateGroup = false;
                      let payload = {
                        isShow: true,
                        type: TypeToash.ERROR,
                        message: 'can not upload avatar, try again',
                        title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
                      };
                      dispatch(createAction(modal.SET_TOASH, payload));
                    });
                } catch (error) {
                  console.log(
                    error,
                    'upload image create group chat error ???',
                  );
                }
              }

              // dispatchThunk(
              //   syncDataInfoGroup(roomID, 'ADD_NEW_GROUP', info => {
              //     let payload = {
              //       isShow: true,
              //       type: TypeToash.SUCCESS,
              //       message:
              //         // 'success create group chat',
              //         'グループを作成できました。',
              //       title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_SUCCESS,
              //     };
              //     dispatch(createAction(modal.SET_TOASH, payload));
              //     dispatch(createAction(dataCache.LOADING_FINISH, null));
              //     navigation.replace('ChatGroup', {
              //       infoRoom: info,
              //       isRouteGroupChat: true,
              //     });
              //   }),
              // );
            };
            uploadImageHandle();
          }
          else {
            dispatchThunk(
              syncDataInfoGroup(roomID, 'ADD_NEW_GROUP', info => {
                let payload = {
                  isShow: true,
                  type: TypeToash.SUCCESS,
                  message:
                    // 'success create group chat',
                    'グループを作成できました。',
                  title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_SUCCESS,
                };
                dispatch(createAction(modal.SET_TOASH, payload));
                dispatch(createAction(dataCache.LOADING_FINISH, null));
                navigation.replace('ChatGroup', {
                  infoRoom: info,
                  isRouteGroupChat: true,
                });
              }),
            );
          }
          /////////////////////////////////////////////////////////////////////
          dispatchThunk(
            syncDataInfoGroup(roomID, 'ADD_NEW_GROUP', info => {
              let payload = {
                isShow: true,
                type: TypeToash.SUCCESS,
                message:
                  // 'success create group chat',
                  'グループを作成できました。',
                title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_SUCCESS,
              };
              dispatch(createAction(modal.SET_TOASH, payload));
              dispatch(createAction(dataCache.LOADING_FINISH, null));
              navigation.replace('ChatGroup', {
                infoRoom: info,
                isRouteGroupChat: true,
              });
            }),
          );
        })
        .catch(error => {
          console.log(error, 'error apiCreateChatgroup');
          let payload = {
            isShow: true,
            type: TypeToash.ERROR,
            message:
              // 'can`t create group , try again',
              'グループを作成できません。もう一度やり直してください',
            title: MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
          };
          dispatch(createAction(dataCache.LOADING_FINISH, null));
          dispatch(createAction(modal.SET_TOASH, payload));
        });
    } else {
      dispatch(createAction(dataCache.LOADING_FINISH, null));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
          enabled>
          <HeaderGroupCreate
            disabledButtonCreate={disabledButtonCreate}
            handleCreateGroupChat={handleCreateGroupChat}
            handleGoback={handleGoback}
            loading={AdminId ? false : true}
          />
          <View style={{ padding: 4, marginBottom: 5 }}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                marginTop: height * 0.02,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AvatarGroupHandle
                  fileImage={fileImage}
                  setFileImage={setFileImage}
                />
                <InputGroupNameHandle setGroupName={setGroupName} />
              </View>
            </View>
          </View>

          {/* handle list user */}
          <View style={{ position: 'relative', zIndex: 1 }}>
            <SearchUserList selected={selected} setSelected={setselected} listUserOld={AdminId ? [AdminId] : []} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default memo(CreateGroupScreen);

const screen = Dimensions.get('screen');

const styles = StyleSheet.create({
  wrapperAvatar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    flex: 0.5,
  },
  wrapperInput: {
    flex: 1.5,
    paddingLeft: 10,
    overflow: 'hidden',
    height: 101,
    paddingRight: 5,
    paddingTop: 10,
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  avatarGroup: {},
  wrapperBox: {
    borderStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
  },
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  avatarUser: {
    width: screen.width * 0.15,
    height: screen.width * 0.15,
    borderRadius: (screen.width * 0.15) / 2,
  },
  iconBack: {
    position: 'absolute',
    left: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconNewGroup: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    // height: 25,
    // width: 25,
    paddingVertical: 4,
    paddingHorizontal: 4.5,
    backgroundColor: 'rgba(0,0,0,1)',
    borderRadius: 20 / 2,
    transform: [{ translateY: -1 }, { translateX: 8 }],
    // borderColor: '#fff',
    // borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inpWrapper: {
    // width: width,
    flex: 1,
    paddingHorizontal: 5,
    borderBottomColor: 'transparent',
    backgroundColor: 'rgba(230,230,230,0.5)',
    borderRadius: 10,
    paddingVertical: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {},
  input: {
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  borderIcon: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 50,
  },
});
