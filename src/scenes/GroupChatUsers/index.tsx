import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ButtonIcon} from '../../components/buttons';
import {Ionicons} from '../../assets/icons';
import * as stylesGlobal from '../../styles';
import {User} from '../../models/chat';
import SearchUsers from '../GroupChatCreate/SearchUser';
import {COLOR_CONSTANT} from '../../styles/colors';
type Props = {
  navigation?: any;
};
const GroupChatUsers: React.FC<Props> = ({navigation}) => {
  let listOldMembers: Array<User> = navigation.getParam('listMemberGroup');
  let groupName: string = navigation.getParam('groupName');
  useEffect(() => {}, []);

  const [selected, setSelected] = useState<Array<User>>([]);

  const handleAddUsers = useCallback(() => {}, []);
  const disabledButtonAdd = !Boolean(selected.length > 0);
  return (
    <View style={styles.container}>
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
          <ButtonIcon onPress={() => navigation.goBack()}>
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.buttonContainer,
              {
                backgroundColor: disabledButtonAdd
                  ? 'rgba(0,0,0,0.3)'
                  : COLOR_CONSTANT.PRIMARY_COLOR,
              },
            ]}
            onPress={handleAddUsers}
            disabled={disabledButtonAdd}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>作成</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <SearchUsers
          setSelected={setSelected}
          selected={selected}
          listUserOld={listOldMembers}
        />
      </View>
    </View>
  );
};
export default memo(GroupChatUsers);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  buttonContainer: {
    height: 24,
    width: 65,
    backgroundColor: COLOR_CONSTANT.PRIMARY_COLOR,
    borderRadius: 3,
    marginRight: 8,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 12,
  },
});
