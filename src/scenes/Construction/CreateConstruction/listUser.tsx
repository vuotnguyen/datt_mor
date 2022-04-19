import React, {memo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AntDesign, Ionicons} from '../../../assets/icons';
import AvatarRes from '../../../components/common/Avatar';
import MESSAGES from '../../../config/Messages';
import {User} from '../../../models/chat';
import * as globalStyles from '../../../styles';
import {useAppSelector} from '../../../stories';

const screen = Dimensions.get('screen');

type Props = {
  selected: Array<User>;
  setSelected: (listItem: Array<User>) => void;
  openModal: any;
  setListNew: (listItem: Array<User>) => void;
};
const sortUsersData = (arrayUser: Array<User>) => {
  return arrayUser.sort((userA, userB) => {
    if (userA.user_role === 'Member' && userB.user_role === 'Admin') {
      return 1;
    }
    if (userA.user_role === 'Admin' && userB.user_role === 'Member') {
      return -1;
    }
    return 0;
  });
};

const ListUser: React.FC<Props> = ({
  selected,
  setSelected,
  openModal,
  setListNew,
}) => {
  const flatlistRef = useRef<FlatList | any>();
  const [show, setShow] = useState(true);
  const {UserInfo} = useAppSelector(state => state.dataUser);

  const handleCheckedUser = (item: User) => {
    let arm = [...selected];
    let idx = arm.findIndex(m => m.user_id === item.user_id);
    if (idx !== -1) {
      arm.splice(idx, 1);
    } else {
      arm.push(item);
    }
    setSelected(arm);
    setListNew(arm);
  };

  const renderItem = ({item}: any) => {
    if (!show) {
      return null;
    }
    if (item?.user_role === 'Admin') {
      return (
        <View style={styles.itemBox}>
          <AvatarRes uri={item.avatar ? item.avatar : null} size={50} />
          <View style={{marginHorizontal: 17}}>
            <Text style={globalStyles.text.text}>{item.full_name}</Text>
          </View>
          <Ionicons name="star-sharp" color="#6FCF97" size={24} />
        </View>
      );
    }
    return (
      <View style={[styles.itemBox, {justifyContent: 'space-between'}]}>
        <View style={styles.viewRowCenter}>
          <View style={styles.viewRowCenter}>
            <View>
              <AvatarRes uri={item.avatar ? item.avatar : null} size={50} />
            </View>
          </View>
          <View style={{marginLeft: 17}}>
            <Text style={globalStyles.text.text}>{item.full_name}</Text>
          </View>
        </View>
        {item?.user_role != 'Member' ? (
          <TouchableOpacity
            style={styles.deleteBox}
            onPress={() => {
              handleCheckedUser(item);
            }}>
            <AntDesign name={'close'} size={20} color={'#9FA5AA'} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const ListHeaderComponent = () => {
    return (
      <View>
        <View style={styles.titleBox}>
          <View style={styles.title}>
            <Text style={[globalStyles.text.text, {marginHorizontal: 16}]}>
              {MESSAGES.CONSTRUCTION.MSG_CONSTRUCTION_LIST_USER_PICKER} {'('}
              {selected.length}
              {')'}
            </Text>
            <TouchableOpacity
              style={{transform: [{rotate: show ? '-90deg' : '180deg'}]}}
              onPress={() => setShow(!show)}>
              <Ionicons name="chevron-back" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          {UserInfo?.user_role === 'Admin' && (
            <TouchableOpacity
              style={styles.buttonAdd}
              onPress={() => openModal()}>
              <Ionicons name="add-outline" color="#000" size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        data={sortUsersData(selected)}
        overScrollMode={'never'}
        keyExtractor={(item, index) => `user_${index}`}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        ListHeaderComponent={ListHeaderComponent()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default memo(ListUser);
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
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
  deleteDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    height: 30,
    width: 30,
    paddingVertical: 4,
    paddingHorizontal: 4.5,
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    transform: [{translateY: -1}, {translateX: 12}, {translateY: -12}],
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  input: {
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
  },
  itemBox: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomColor: '#BDBDBD',
    borderBottomWidth: 1,
  },
  titleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    paddingVertical: 7,
    // paddingLeft: 2,
    paddingRight: 16,
  },
  buttonAdd: {
    padding: 4,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBox: {
    height: 30,
    width: 30,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    justifyContent: 'center',
    // transform: [{ translateY: -15 }],
  },
  viewRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
