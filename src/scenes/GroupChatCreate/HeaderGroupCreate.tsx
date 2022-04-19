// import CheckBox from '@react-native-community/checkbox';
import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ButtonIcon} from '../../components/buttons';
import * as stylesGlobal from '../../styles';
import {COLOR_CONSTANT} from '../../styles/colors';

const HeaderGroupCreate: React.FC<{
  disabledButtonCreate?: boolean;
  handleGoback?: () => void;
  handleCreateGroupChat?: () => void;
  loading?: boolean;
}> = memo(
  ({
    disabledButtonCreate,
    handleCreateGroupChat = () => undefined,
    handleGoback = () => undefined,
    loading,
  }) => (
    <>
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
          <ButtonIcon onPress={handleGoback}>
            <View style={{paddingHorizontal: 5.5, paddingVertical: 5}}>
              <Ionicons size={25} name="ios-chevron-back" />
            </View>
          </ButtonIcon>
        </View>
        <View style={{justifyContent: 'center', flex: 1}}>
          <Text
            style={[
              stylesGlobal.text.subTitle,
              {textAlign: 'center', color: '#000'},
            ]}>
            グループチャット設定
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
                backgroundColor: disabledButtonCreate
                  ? 'rgba(0,0,0,0.3)'
                  : COLOR_CONSTANT.PRIMARY_COLOR,
              },
            ]}
            onPress={handleCreateGroupChat}
            // disabled={disabledButtonCreate || loading}>
            disabled={disabledButtonCreate}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>作成</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  ),
);

const styles = StyleSheet.create({
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

export default HeaderGroupCreate;
