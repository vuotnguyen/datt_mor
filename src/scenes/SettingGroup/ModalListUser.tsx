import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ButtonIcon} from '../../components/buttons';
import {Ionicons} from '../../assets/icons';
import * as stylesGlobal from '../../styles';
import {User} from '../../models/chat';
import SearchUsers from '../GroupChatCreate/SearchUser';
type Props = {
  //   navigation: any;
  // listOldMembers: Array<User>;
  listOldMembers: Array<string>;
  isShow: boolean;
  handleClose: () => void;
  handleAddNew: (list: string[]) => void;
};
const GroupChatUsers: React.FC<Props> = ({
  listOldMembers,
  isShow,
  handleClose,
  handleAddNew,
}) => {
  const [selected, setSelected] = useState<Array<User>>([]);
  const handleConfirm = useCallback(() => {
    handleAddNew(selected.map(m => m.user_id));
    handleClose();
    setSelected([]);
  }, [selected]);

  return (
    <Modal
      animationType={'none'}
      visible={isShow}
      collapsable
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
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
            <ButtonIcon onPress={handleClose}>
              <View style={{paddingHorizontal: 5, paddingVertical: 5}}>
                <Ionicons size={25} name="ios-chevron-back" />
              </View>
            </ButtonIcon>
          </View>
          <View style={{justifyContent: 'center', flex: 1}}>
            <Text style={[stylesGlobal.text.subTitle, {textAlign: 'center'}]}>
              メンバー一覧{' '}
              {listOldMembers?.length > 0 ? `(${listOldMembers?.length})` : ''}{' '}
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
              disabled={selected.length > 0 ? false : true}
              style={{opacity: selected.length > 0 ? 1 : 0.5}}
              onPress={handleConfirm}>
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                  marginRight: 5,
                }}>
                <Text>追加</Text>
              </View>
            </ButtonIcon>
          </View>
        </View>
        <View style={{flex: 1, backgroundColor: '#fff'}}>
          {isShow ? (
            <SearchUsers
              setSelected={setSelected}
              selected={selected}
              listUserOld={listOldMembers}
            />
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
export default memo(GroupChatUsers);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
