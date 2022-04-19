import React, { memo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Feather } from '../../../assets/icons';
import { IChat, User } from '../../../models/chat';
import * as stylesGlobal from '../../../styles';
import AvatarRes from '../../common/Avatar';

interface Props {
  item: User;
  selected: boolean;
}
const UserBoxItem: React.FC<Props> = ({ item, selected }) => {
  return (
    <>
      <View style={{ flex: 0.7 }}>
        {/* avatar user */}
        <AvatarRes
          sizeIconLoad={16}
          uri={item.avatar?item.avatar: null}
          size={50}
          showIconload={false}
        />
      </View>
      <View style={{ flex: 3 }}>
        {/* name user */}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {
                flex: 1,
                fontWeight: '700',
                fontSize: 14,
                marginBottom: 7,
              },
            ]}>
            {item.full_name}
          </Text>
        </View>
      </View>
      <View style={{ flex: 0.4 }}>
        {/* checkbox */}
        <Feather
          size={20}
          color={selected ? 'green' : '#000'}
          name={selected ? 'check-circle' : 'circle'}
        />
      </View>
    </>
  );
};
export default memo(UserBoxItem);
const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    right: 0,
  },
  userBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
});
