import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DropdownAlertComponent from 'react-native-dropdownalert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '../../assets/icons';
import { ButtonIcon } from '../../components/buttons';
import MESSAGES_const from '../../config/Messages';
import { IGroupChatInfo } from '../../models/chat';
import { TypeToash } from '../../models/common';
import * as apiChat from '../../services/chat';
import {
  apiGetConstructioById, apiUpdateConstruction
} from '../../services/construction';
import { useAppDispatch } from '../../stories';
import { createAction } from '../../stories/actions';
import { chat } from '../../stories/types';
// custom styles
import * as stylesGlobal from '../../styles';
import AvatarGroupHandle from './AvatarGroupHandle';
import GroupTabHandle from './GroupTabHandle';
import InputNameHandle from './InputNameHandle';


type Props = {
  room_id: string;
  handleClose: (v: string) => void;
  is_group: number;
};
const SettingGroupScreen: React.FC<Props> = ({ room_id, handleClose, is_group }) => {
  let refDropDownAlert = useRef<DropdownAlertComponent | null>(null);
  // State
  // console.log('CR%23GROUP%23' + room_id, 'room_id ???');
  let room_idClone = is_group === 1 ? `CR%23GROUP%23${room_id}` : `CS%23${room_id}`;
  // const [fileImage, setFileImage] = useState<{
  // file_name: string;
  // uri: string;
  // type?: string;
  // }>();
  const [fileImage, setFileImage] = useState('');

  // loading state
  const [loading, setLoading] = useState<boolean>(false);

  // data state
  const [infoRoom, setinfoRoom] = useState<IGroupChatInfo>();
  const [textGroupName, setTextGroupName] = useState<string>('');
  // console.log(infoRoom, 'info room index setting ???');
  // Variables
  let isAdmin = useMemo(() => {
    // return infoRoom?.user_login.user_id == infoRoom?.admin?.user_id;
    return infoRoom?.user_login == infoRoom?.admin_id;
    // return false;
  }, [infoRoom]);

  const dispatch = useAppDispatch();
  const handleUpdateInfoRoom = useCallback((resData: IGroupChatInfo) => {
    // setFileImage({
    //   // file_name: resData.avatar_group?.file_name ?? '',
    //   // uri: resData.avatar_group?.path_file_thumb ?? '',
    //   // type: 'api',
    //   ...fileImage,
    //   link_url_file: resData.avatar_group,
    // });
    setFileImage(resData.avatar_group);
    setTextGroupName(resData.group_name ?? '');
    setinfoRoom(resData);
    // console.log(resData, 'resData index ???!');
  }, []);
  // hooks lifecycles
  useEffect(() => {
    setLoading(true);
    if (room_id) {
      apiChat
        .apiGetInfoGroupChat(room_idClone)
        .then(res => {
          const resData: IGroupChatInfo = JSON.parse(JSON.stringify(res.data));
          // console.log(resData, 'resData update info room ???');
          handleUpdateInfoRoom(resData);
        })
        .catch(error => console.log(error, 'apiGetInfoGroupChat error:'))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [room_id]);
  /**
   * --------------------handle cal api here-----------------------------
   */

  /**
   * handle API update info group
   */
  // console.log(room_id, 'room_id setting group index???');
  const handleApiUpdateInfoGroupChat = useCallback(
    (
      infoRoomParam: IGroupChatInfo,
      dataUpdating: {
        textName: string;
        // avatarGroup?: Avatar | {};
        avatarGroup?: string | null | undefined;
      },
      CancelLoading: () => void,
    ) => {
      if (
        infoRoomParam &&
        infoRoomParam.admin_id &&
        infoRoomParam.participants_id &&
        infoRoomParam?.participants_id.length > 0
      ) {
        // console.log(dataUpdating, 'data updating ???!');
        let data: apiChat.TypeDataUpdateChatGroup = {
          room_id: infoRoomParam.room_id,
          group_name: dataUpdating.textName ?? textGroupName,
          avatar_group: dataUpdating.avatarGroup ?? '',
          // dataUpdating.avatarGroup ?? infoRoomParam?.avatar_group ?? {},
          // dataUpdating.avatarGroup ?? infoRoomParam?.avatar_group ?? '',
        };
        console.log(data, 'data setting group chat ???');
        apiChat
          .apiUpdateChatGroup(data)
          .then(async res => {
            const resData = JSON.parse(JSON.stringify(res.data));
            console.log('update info group success');
            handleUpdateInfoRoom(resData);

            if (is_group === 2) {
              let value = await apiGetConstructioById(infoRoomParam.room_id.replace(/CS#/g, ''));

              let data = {
                construction_name: dataUpdating.textName ?? textGroupName,
                construction_address: value.data.data.construction_address,
                work_items: value.data.data.work_items,
                users: value.data.data.users
              };
              await apiUpdateConstruction(data, infoRoomParam.room_id.replace(/CS#/g, ''))
                .then(res1 => {
                  console.log('res1');

                })
                .catch(error => {
                  console.log('error 1111', error);
                })
                .finally(() => { });
            }

            dispatch(
              createAction(chat.UPDATE_CHAT_GROUP, {
                dataUpdating: {
                  room_id: infoRoomParam.room_id,
                  avatar: resData.avatar_group,
                  group_name: resData.group_name,
                },
              }),
            );
          })
          .catch(error => {
            console.log('apiUpdateChatGroup error', error);

            refDropDownAlert.current?.alertWithType(
              TypeToash.ERROR,
              MESSAGES_const.COMMON.MSG_COMMON_TEXT_ERROR,
              // 'can`t update group's information , please try again',
              'グループの情報を更新できません。もう一度やり直してください',
            );
            CancelLoading();
          });
        //.finally(CancelLoading);
      }
      CancelLoading();
    },
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {/* header */}
      <DropdownAlertComponent
        updateStatusBar={false}
        ref={refDropDownAlert}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
      />
      <Header
        handleClose={handleClose}
        isAdmin={isAdmin}
        textGroupName={textGroupName}
      />

      {/* avatar, group name */}
      <View>
        <View
          style={[
            styles.centerHorizontalView,
            { paddingVertical: 20, backgroundColor: '#fff', marginBottom: 5 },
          ]}>
          <View>
            {/* avatar group */}
            <View style={[styles.centerHorizontalView]}>
              <AvatarGroupHandle
                loading={loading}
                fileImage={fileImage}
                isAdmin={isAdmin}
                textGroupName={textGroupName}
                refDropDownAlert={refDropDownAlert}
                infoRoom={infoRoom}
                handleApiUpdateInfoGroupChat={handleApiUpdateInfoGroupChat}
              />
            </View>

            {/* group name */}
            <InputNameHandle
              isAdmin={isAdmin}
              loading={loading}
              textGroupName={textGroupName}
              infoRoom={infoRoom}
              handleApiUpdateInfoGroupChat={handleApiUpdateInfoGroupChat}
            />
          </View>
        </View>

        {/* features group */}
        <View>
          <GroupTabHandle
            isAdmin={isAdmin}
            loading={loading}
            infoRoom={infoRoom}
            setInfoRoom={setinfoRoom}
            textGroupName={textGroupName}
            handleUpdateInfoRoom={handleUpdateInfoRoom}
            refDropDownAlert={refDropDownAlert}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
export const Header: React.FC<{
  handleClose: (text: string) => void;
  textGroupName: string;
  isAdmin: boolean;
}> = memo(({ handleClose, textGroupName, isAdmin }) => (
  <View
    style={{
      marginBottom: 0,
      backgroundColor: '#fff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
    <View
      style={{
        width: '20%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      <ButtonIcon onPress={() => handleClose(textGroupName)}>
        <View style={{ paddingHorizontal: 5, paddingVertical: 5 }}>
          <Ionicons size={25} name="ios-chevron-back" />
        </View>
      </ButtonIcon>
    </View>
    <View style={{ justifyContent: 'center', flex: 1 }}>
      <Text
        style={[
          stylesGlobal.text.subTitle,
          { fontSize: 14, textAlign: 'center' },
        ]}>
        {isAdmin ? 'グループチャット設定' : 'グループチャット情報'}
      </Text>
    </View>
    <View
      style={{
        width: '20%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
      {/* <Button transparent /> */}
    </View>
  </View>
));
export default memo(SettingGroupScreen);
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
