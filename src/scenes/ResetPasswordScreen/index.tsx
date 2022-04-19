import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {CustomButton} from '../../components/buttons';
import {COLOR_CONSTANT} from '../../styles/colors';
import InputCustom from './InputCustom';
import {ResetPassword} from '../../services/auth';
import LoadingModal from '../../components/common/LoadingModal';
import _ from 'lodash';
import DropdownAlert from 'react-native-dropdownalert';
import Messages from '../../config/Messages';

interface Props {
  navigation: any;
}

const ResetPasswordScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();

  let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

  const onPressHandler = async () => {
    //check email validate
    let errorMess = '';
    if (reg.test(email) === false) {
      // errorMess = 'メールアドレスの形式ではありません。';
      // console.log('email not formatted correctly !!!!');

      dropDownAlert?.alertWithType(
        'error',
        Messages.COMMON.MSG_COMMON_TEXT_ERROR,
        // errorMess,
        Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_ERROR_003,
      );
      return;
    }
    setLoading(true);
    const data = {
      email,
    };
    await ResetPassword(data)
      .then(res => {
        console.log('res', res);
        setLoading(false);
        navigation.navigate('ResetPasswordConfirm', {
          email,
        });
      })
      .catch((error: any) => {
        errorMess = error.response.data.detail;
      })
      .then(() => {
        setLoading(false);
        dropDownAlert?.alertWithType(
          'error',
          Messages.COMMON.MSG_COMMON_TEXT_ERROR,
          errorMess,
        );
      });
    // navigation.navigate('ResetPasswordConfirm', {
    //   email,
    // });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      {/* notify  */}
      <DropdownAlert
        updateStatusBar={false}
        ref={ref => setDropDownAlert(ref)}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* input email */}
          <View style={styles.formContainer}>
            <View>
              <Text style={{marginBottom: 5}}>
                {Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_001}
              </Text>
              <InputCustom
                autoCapitalize={'none'}
                keyboardType={'default'}
                autoFocus
                style={{height:40}}
                onChangeText={setEmail}
                value={email}
              />
            </View>
            <View style={styles.btnContainer}>
              <CustomButton
                title={Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_002}
                outlined={false}
                colorButton={COLOR_CONSTANT.PRIMARY_COLOR}
                textColor="#fff"
                colorDisabled={'rgba(0,0,0,0.4)'}
                style={styles.btnReset}
                onPress={onPressHandler}
                disabled={_.isEmpty(email)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <LoadingModal loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginVertical: Platform.OS == 'android' ? 30 : 0,
    paddingHorizontal: '5%',
  },
  btnContainer: {
    flex: 1,
    borderColor: 'transparent',
    marginVertical: 20,
  },
  btnReset: {
    width: '100%',
    borderColor: 'transparent',
    alignSelf: 'center',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 4},
  },
});

export default ResetPasswordScreen;
