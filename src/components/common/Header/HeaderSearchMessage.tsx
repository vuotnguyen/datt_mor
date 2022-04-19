import {DebouncedFunc} from 'lodash';
import React, {memo} from 'react';
import {StyleSheet, View, Platform, Dimensions, TextInput} from 'react-native';
import {AntDesign, Fontisto, Ionicons} from '../../../assets/icons';
import ButtonIcon from '../../../components/buttons/buttonIcon';
const {height, width} = Dimensions.get('screen');
import {HStack} from 'native-base';

const HeaderSearchMessage: React.FC<{
  setOpenSearchMessage: (openSearchMessage: boolean) => void;
  setKeyword: (keywork: string) => void;
  keyword: string;
  handclearText: () => void;
  refInput: React.RefObject<TextInput> | null;
}> = memo(
  ({setOpenSearchMessage, setKeyword, keyword, handclearText, refInput}) => {
    return (
      <>
        <HStack alignItems={'center'} style={styles.item}>
          <View style={styles.right}>
            <ButtonIcon
              onPress={() => setOpenSearchMessage(false)}
              style={styles.buttonLeft}>
              <View style={styles.viewLeft}>
                <Ionicons size={25} name="ios-chevron-back" />
              </View>
            </ButtonIcon>
          </View>
          <HStack alignItems={'center'} style={styles.inpWrapper}>
            <View style={styles.viewBody}>
              <Fontisto size={12} name="search" />
            </View>
            <View>
              <TextInput
                ref={refInput}
                style={[
                  styles.input,
                  Platform.OS === 'android'
                    ? {
                        paddingBottom: 3,
                        paddingTop: 3,
                      }
                    : null,
                ]}
                numberOfLines={1}
                value={keyword ? keyword : ''}
                autoFocus={false}
                onChangeText={text => setKeyword(text)}
              />
            </View>
          </HStack>

          <View style={styles.right}>
            <ButtonIcon onPress={() => handclearText()}>
              <View
                style={[
                  styles.viewRight,
                  {display: keyword ? 'flex' : 'none'},
                ]}>
                <AntDesign name={'close'} size={16} />
              </View>
            </ButtonIcon>
          </View>
        </HStack>
      </>
    );
  },
);

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
    backgroundColor: 'rgba(230,230,230,0.5)',
    borderRadius: 5,
    paddingVertical: 0,
    flexDirection: 'row',
    marginBottom: 5,
    marginTop: 5,
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

export default memo(HeaderSearchMessage);
