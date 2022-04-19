import React, {memo} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {HStack} from 'native-base';
import {ButtonIcon} from '../../../components/buttons';
import {Fontisto, Ionicons} from '../../../assets/icons';
// custom styles
import * as stylesGlobal from '../../../styles';
const {width} = Dimensions.get('screen');

const Header: React.FC<{
  headerTitle: string;
  handleGoback: () => void;
  setOpenSearchMessage: (openSearchMessage: boolean) => void;
}> = ({headerTitle, handleGoback, setOpenSearchMessage}) => (
  <>
    <HStack alignItems={'center'} style={styles.item}>
      <View style={styles.right}>
        <ButtonIcon onPress={handleGoback} style={styles.buttonLeft}>
          <View style={styles.viewLeft}>
            <Ionicons size={25} name="ios-chevron-back" />
          </View>
        </ButtonIcon>
      </View>
      <View style={styles.inpWrapper}>
        <Text style={stylesGlobal.text.subTitle}>{headerTitle}</Text>
      </View>

      <View style={styles.right}>
        <ButtonIcon onPress={() => setOpenSearchMessage(true)}>
          <View style={[styles.viewRight]}>
            <Fontisto size={17} name="search" />
          </View>
        </ButtonIcon>
      </View>
    </HStack>
  </>
);
export default memo(Header);
const styles = StyleSheet.create({
  input: {
    fontSize: 13,
    color: '#000',
    marginRight: 40,
    flex: 1,
    maxHeight: 100,
    width: width - 110,
  },
  inpWrapper: {
    flex: 1,
    paddingHorizontal: 5,
    borderBottomColor: 'transparent',
    paddingVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  right: {
    flex: 0.5 / 4,
    flexDirection: 'row',
  },
  buttonLeft: {
    marginVertical: 3.5,
  },
  item: {
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  viewLeft: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  viewBody: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  viewRight: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
