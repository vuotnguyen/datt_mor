import React, {memo, useEffect, useState} from 'react';
import {Modal, Text, View} from 'react-native';
import ButtonIcon from '../../components/buttons/buttonIcon';
import {Entypo, Fontisto, Ionicons} from '../../assets/icons';
import SettingGroup from '../SettingGroup';
// custom styles
import * as stylesGlobal from '../../styles';
import {IChat} from '../../models/chat';
import {StackActions, useNavigation} from '@react-navigation/native';
import {get} from 'lodash';
import {IGroupInfo, IGroupInfoTemp} from '../../models/chat';
import {useAppSelector} from '../../stories';

const prefixGroup = 'CR#GROUP#';

const HeaderSetting: React.FC<{
  infoRoom: IChat;
  isFetchedData: boolean;
  setOpenSearchMessage: (openSearchMessage: boolean) => void;
  isGroup?: number;
}> = memo(({infoRoom, isFetchedData, setOpenSearchMessage, isGroup = 1}) => {
  const [openSetting, setOpenSetting] = useState<boolean>(false);
  const [groupName, setgroupName] = useState<string>('');
  const navigation = useNavigation();
  const nameGroupStore = useAppSelector(state => {
    // let itemA = state.dataChat.chat_rooms.find(
    //   item =>
    //     item.room_id ==
    //     `${isGroup == 1 ? 'CR' : 'CS'}#GROUP#${infoRoom.room_id}`,
    // );
    let itemA = state.dataChat.chat_rooms.find(
      room =>
        room.room_id === `${isGroup == 1 ? 'CR#GROUP#' : 'CS#'}${infoRoom.room_id}`,
    );
    if (itemA) {
      return itemA.group_name;
    }
    return '';
  });
  const roomName = React.useMemo(() => {
    return nameGroupStore.length > 29
      ? nameGroupStore.substr(0, 29) + '...'
      : nameGroupStore;
  }, [nameGroupStore]);

  useEffect(() => {
    setgroupName(get(infoRoom, 'group_name', ''));
  }, [infoRoom]);
  return (
    <>
      <Header
        title={roomName}
        onPressBtnLeft={() => navigation.dispatch(StackActions.pop(1))}
        onPressBtnRight={() => setOpenSetting(true)}
        onPressBtnRightSearch={() => setOpenSearchMessage(true)}
      />
      {isFetchedData ? (
        <Modal
          visible={openSetting}
          animationType={'none'}
          onRequestClose={() => setOpenSetting(false)}>
          <SettingGroup
            is_group={infoRoom.is_group}
            room_id={infoRoom && infoRoom.room_id ? infoRoom.room_id : ''}
            handleClose={(val: string) => {
              setOpenSetting(false);
              if (val && groupName !== val) {
                console.log('set group name');

                setgroupName(val);
              }
            }}
          />
        </Modal>
      ) : null}
    </>
  );
});
export const Header: React.FC<{
  title: string | null;
  onPressBtnRight: () => void;
  onPressBtnLeft: () => void;
  onPressBtnRightSearch: () => void;
}> = memo(({title, onPressBtnLeft, onPressBtnRight, onPressBtnRightSearch}) => (
  <>
    <View
      style={{
        marginBottom: 0,
        flexDirection: 'row',
        backgroundColor: '#fff',
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
        <ButtonIcon onPress={onPressBtnLeft} style={{marginVertical: 3.5}}>
          <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 5,
            }}>
            <Ionicons size={25} name="ios-chevron-back" />
          </View>
        </ButtonIcon>
      </View>
      <View style={{justifyContent: 'center', flex: 1}}>
        <Text
          style={[
            stylesGlobal.text.subTitle,
            {fontSize: 14, textAlign: 'center', color: '#000'},
          ]}>
          {title}
        </Text>
      </View>

      <View
        style={{
          width: '20%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <ButtonIcon
          onPress={onPressBtnRightSearch}
          style={{marginHorizontal: 2}}>
          <View style={{paddingHorizontal: 7, paddingVertical: 6.5}}>
            <Fontisto size={17} name="search" />
          </View>
        </ButtonIcon>
        <ButtonIcon onPress={onPressBtnRight} style={{marginHorizontal: 2}}>
          <View style={{paddingHorizontal: 7, paddingVertical: 6.5}}>
            <Entypo size={17} name="dots-three-vertical" />
          </View>
        </ButtonIcon>
      </View>
    </View>
  </>
));

export default memo(HeaderSetting);
