import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {ButtonIcon} from '../../components/buttons';
import {FontAwesome5, Foundation, Ionicons} from '../../assets/icons';
// custom styles
import * as stylesGlobal from '../../styles';
import AvatarRes from '../../components/common/Avatar';
import {useAppDispatch} from '../../stories';
import {createAction} from '../../stories/actions';
import {chat} from '../../stories/types';
import {TypeToash} from '../../models/common';
import MESSAGES_const from '../../config/Messages';
import * as apiChat from '../../services/chat';
import {getUserByChatRoomID} from '../../services/user';
import {IGroupChatInfo} from '../../models/chat';
import ModalListUser from './ModalListUser';
import DropdownAlertComponent from 'react-native-dropdownalert';
import ModalConfirm from '../../components/common/ModalConfirm/ModalConfirmV2';
import LoadingModal from './LoadingModal';
import TabComponent, {statusTab, TabType, type_tab} from './TabComponent';
import {sortBy} from 'lodash';
import {useChatContext} from '../../hooks/chat';

type IUserGroupChatInfo = {
  avatar: string | any;
  create_at: string;
  is_join: boolean;
  SK: string;
  username: string;
  address: string;
  full_name: string;
  user_role: string;
  email: string;
  PK: string;
  company_id: string;
  user_id: string;
};

const GroupTabHandle: React.FC<{
  isAdmin: boolean;
  loading: boolean;
  infoRoom: IGroupChatInfo | undefined;
  setInfoRoom: any;
  textGroupName: string;
  handleUpdateInfoRoom: (infoRoomParam: IGroupChatInfo) => void;
  refDropDownAlert: React.MutableRefObject<DropdownAlertComponent | null>;
}> = memo(
  ({
    infoRoom,
    setInfoRoom,
    loading,
    isAdmin,
    handleUpdateInfoRoom,
    refDropDownAlert,
    textGroupName,
  }) => {
    const chatContext = useChatContext();
    if (!chatContext) return null;
    const {typeChat} = chatContext;
    const [showListUser, setShowListUser] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<{
      isShow: boolean;
      text: string;
      confirm: () => void;
    }>({
      isShow: false,
      text: '',
      confirm: () => {},
    });
    // loading state
    const [loadingApi, setloadingApi] = useState<boolean>(false);
    const [listUsers, setListUsers] = useState<IUserGroupChatInfo[]>();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    // console.log(infoRoom, 'info RoomGroup Tab Handle???');

    // --------------------------------get all user in group-------------------------
    // console.log(listUsers, 'list users ??? up');
    const handleFetchUser = useCallback(async room_id => {
      try {
        const response = await getUserByChatRoomID(room_id);
        setloadingApi(false);
        setListUsers(JSON.parse(JSON.stringify(response.data)));
      } catch (error: any) {
        setloadingApi(false);
        console.log(error, 'getUserByChatRoomID error???');
      }
    }, []);
    useEffect(() => {
      if (infoRoom?.room_id) {
        const formattedRoomId = infoRoom.room_id.replace(/#/g, '%23');
        handleFetchUser(formattedRoomId);
        // console.log(listUsers, 'list users');
      }
    }, [infoRoom]);
    /**
     * ------------------------- handle list users ---------------------------
     */
    /**
     * handle add new users
     */
    const handleApiAddNewUsers = useCallback(
      (listAddNew: string[]) => {
        setloadingApi(true);
        if (infoRoom && listAddNew.length > 0) {
          apiChat
            .apiAddNewMemberGroupChat({
              room_id: infoRoom.room_id,
              users_id: listAddNew,
            })
            .then(res => {
              const resData = JSON.parse(JSON.stringify(res.data));
              // console.log(
              //   resData[1].map((user: string | any) => user.PK),
              //   'resData add user ????',
              // );
              setInfoRoom({
                ...infoRoom,
                participants_id: [...infoRoom.participants_id, ...listAddNew],
              });
              // console.log(infoRoom, 'info room update new user ???');
              // handleUpdateInfoRoom(resData);
            })
            .catch(error => {
              console.log(error, 'apiAddNewMemberGroupChat error');

              refDropDownAlert.current?.alertWithType(
                TypeToash.ERROR,
                MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
                // can`t not add new users , please try again
                '新しいユーザーを追加できません。もう一度やり直してください',
              );
            })
            .finally(() => setloadingApi(false));
        }
      },
      [infoRoom],
    );

    // ------------remove user --------------------
    const handleRemoveUser = useCallback(
      (id: string, name: string) => () => {
        if (infoRoom) {
          setShowConfirm({
            isShow: true,
            text:
              // `delete ${name}'s invitaion to the group`,
              `${name} をグループから削除しますか？`,
            confirm: () => {
              setloadingApi(true);
              let data: apiChat.TypeDataUserRemove = {
                room_id: infoRoom.room_id,
                users_id: [id],
              };
              setShowConfirm({
                isShow: false,
                confirm: () => {},
                text: '',
              });
              apiChat
                .apiRemoveUserGroupChat(data)
                .then(res => {
                  const resData = JSON.parse(JSON.stringify(res.data));
                  // console.log(resData, 'resData remove user ????');
                  let resDataClone = resData.toString();
                  setInfoRoom({
                    ...infoRoom,
                    participants_id: infoRoom.participants_id.filter(
                      userId => userId !== resDataClone,
                    ),
                  });

                  // handleUpdateInfoRoom(resData);
                })
                .catch(error => {
                  console.log(error, 'apiRemoveUserGroupChat error');

                  refDropDownAlert.current?.alertWithType(
                    TypeToash.ERROR,
                    MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
                    // 'can`t not remove this user, try again',
                    'このユーザーを削除できません。もう一度やり直してください',
                  );
                })
                .finally(() => {
                  setloadingApi(false);
                });
            },
          });
        }
      },
      [infoRoom, textGroupName],
    );

    /**
     * handle remove group by admin
     */
    const handleApiLeaveGroupChat = useCallback(
      (userRemoveId?: string) => {
        if (infoRoom) {
          if (userRemoveId !== infoRoom.admin_id) {
            // user remove room

            let data = {
              room_id: infoRoom.room_id,
            };
            // console.log(data, 'case user leave room ???');
            setShowConfirm({
              isShow: true,
              text:
                // "if you leave this chat, you'll lose its entire chat history, Leave the chat?",
                'グループ退出するとメッセージ履歴は全て削除されます。退出しますか？',
              confirm: () => {
                setloadingApi(true);
                setShowConfirm({
                  isShow: false,
                  confirm: () => {},
                  text: '',
                });
                apiChat
                  .apiUserJoinOutGroup(data)
                  .then(res => {
                    const resData = JSON.parse(JSON.stringify(res.data));
                    // console.log('res', resData);
                    dispatch(
                      createAction(chat.DELETE_CHAT_GROUP, {
                        room_id: infoRoom.room_id,
                      }),
                    );
                    navigation.goBack();
                  })
                  .catch(error => {
                    // console.log('apiUserJoinOutGroup error', error);

                    refDropDownAlert.current?.alertWithType(
                      TypeToash.ERROR,
                      MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
                      // 'can`t not leave room , try again',
                      'できません。もう一度やり直してください',
                    );
                  })
                  .finally(() => setloadingApi(false));
              },
            });
          } else {
            // admin remove room
            console.log('case admin leave room');
            setShowConfirm({
              isShow: true,
              text:
                // "if you leave this group, you'll no longer be able to see its member list or chat history Continue?",
                'グループを退出すると、グループメンバーリストとグループメッセージの履歴が全て削除されます。グループを退出しますか？',
              confirm: () => {
                setloadingApi(true);
                setShowConfirm({
                  isShow: false,
                  confirm: () => {},
                  text: '',
                });
                apiChat
                  .apiRemoveChatGroup(infoRoom.room_id.replace(/#/g, '%23'))
                  .then(res => {
                    const resData = JSON.parse(JSON.stringify(res.data));
                    // console.log(resData, 'res data admin out group???');
                    dispatch(
                      createAction(chat.DELETE_CHAT_GROUP, {
                        room_id: infoRoom.room_id,
                      }),
                    );
                    navigation.goBack();
                  })
                  .catch(error => {
                    console.log(error, 'apiRemoveChatGroup error');

                    refDropDownAlert.current?.alertWithType(
                      TypeToash.ERROR,
                      MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
                      // 'can`t not leave group chat, try again',
                      'できません。もう一度やり直してください',
                    );
                  })
                  .finally(() => setloadingApi(false));
              },
            });
          }
        }
      },
      [infoRoom, navigation],
    );

    /**
     * get tab action :
     */
    let groupTabs: Array<type_tab> = useMemo(() => {
      const accountTab: type_tab = {
        isExpanded: false,
        isUseExpanded: true,
        isTab: TabType.ListUser,
        title: `メンバー一覧 ${
          infoRoom?.participants_id && infoRoom?.participants_id?.length > 0
            ? `(${infoRoom?.participants_id.length})`
            : ''
        }`,
        onPress: () => setShowListUser(true),
        Icon: (
          <FontAwesome5 name={'users'} size={25} color={'rgba(0,0,0,0.7)'} />
        ),
        statusTab: statusTab.Normal,
        children: (
          <View style={{zIndex: 5, position: 'relative'}}>
            <FlatList
              // data={infoRoom?.participants_id?.sort((u1, u2) =>
              //   u1.user_id === infoRoom.admin?.user_id ? -1 : 1,
              // )}
              data={sortBy(listUsers, ['user_role'])}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => `user_${index}`}
              scrollToOverflowEnabled={false}
              renderItem={({item}) => (
                <View
                  style={{
                    flexDirection: 'row',
                    marginVertical: 5,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: '15%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <AvatarRes
                      // uri={item.avatar ? item.avatar.path_file_thumb : null}
                      uri={item.avatar ?? null}
                      // uri={null}
                      size={40}
                    />
                    {/* {console.log(item, 'user info group tab handle ???')} */}
                  </View>
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    {/* <Text>{item.user_friend.fullname}</Text> */}
                    <View
                      style={{
                        position: 'relative',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text>{item.full_name}</Text>
                      {/* {item.user_id == infoRoom?.admin?.user_id ? ( */}
                      {item.user_role === 'Admin' ? (
                        <View
                          style={{
                            position: 'absolute',
                            right: 0,
                            transform: [{translateX: 15}],
                          }}>
                          <Foundation name={'star'} size={13} color={'green'} />
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View
                    style={{
                      marginRight: 5,
                      display: isAdmin ? 'flex' : 'none',
                    }}>
                    {/* {item.user_id !== infoRoom?.admin?.user_id ? ( */}
                    {item.user_role !== 'Admin' ? (
                      <ButtonIcon
                        onPress={handleRemoveUser(
                          item.user_id,
                          item.full_name,
                        )}>
                        <View
                          style={{paddingHorizontal: 5, paddingVertical: 4}}>
                          <Ionicons
                            name={'md-exit-outline'}
                            size={20}
                            color={'rgba(0,0,0,0.7)'}
                          />
                        </View>
                      </ButtonIcon>
                    ) : null}
                  </View>
                </View>
              )}
            />
          </View>
        ),
      };
      const removeTab: type_tab = {
        isExpanded: false,
        isUseExpanded: false,
        isTab: TabType.LeaveRoom,
        // disabled: typeChat == 'groupConstruction' && !isAdmin,
        disabled: typeChat == 'groupConstruction',
        // disabled:true,
        title: '退出',
        onPress: () => {
          // let params = isAdmin ? undefined : infoRoom?.user_login;
          let params = infoRoom?.user_login;
          // console.log(
          //   params === infoRoom?.admin_id,
          //   'params groupTab handle???',
          // );
          handleApiLeaveGroupChat(params);
        },
        Icon: (
          <Ionicons
            name={'md-exit-outline'}
            style={{paddingLeft: 5}}
            size={25}
            color={stylesGlobal.colors.DANGER}
          />
        ),
        statusTab: statusTab.Warning,
        color: '',
        children: null,
      };
      /**
       * group chat users
       *  Admin : remove member, outgroup
       *  user: outgroup
       *
       * group construction
       *  Admin : remove member, outgroup
       *  User: cant out group
       */
      // if (typeChat == 'groupConstruction') {
      //   return [accountTab]
      // }
      if(typeChat == 'groupConstruction'){
        return [accountTab];  
      }
      return [accountTab, removeTab];
    }, [infoRoom, isAdmin, listUsers]);

    return (
      <>
        {groupTabs.map((item, index) => (
          <TabComponent
            loading={loading}
            tab={item}
            key={`tab_${index}`}
            isAdmin={isAdmin}
          />
        ))}
        {infoRoom ? (
          <ModalListUser
            isShow={showListUser}
            handleClose={() => setShowListUser(false)}
            listOldMembers={infoRoom.participants_id}
            handleAddNew={handleApiAddNewUsers}
          />
        ) : null}
        <ModalConfirm
          isShow={showConfirm.isShow}
          messages={showConfirm.text}
          handleConfirm={showConfirm.confirm}
          handleClose={() =>
            setShowConfirm({
              isShow: false,
              text: '',
              confirm: () => {},
            })
          }
        />
        <LoadingModal loading={loadingApi} />
      </>
    );
  },
);
export default memo(GroupTabHandle);

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
