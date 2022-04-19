import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {CustomButton} from '../../components/buttons';
import {COLOR_CONSTANT} from '../../styles/colors';
import InputCustom from './InputCustom';
import * as _ from 'lodash';
import {Entypo} from '../../assets/icons';
import {ConfirmResetPassword} from '../../services/auth';
import LoadingModal from '../../components/common/LoadingModal';
import DropdownAlert from 'react-native-dropdownalert';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import Messages from '../../config/Messages';
import {
  AuthStackNavigationProp,
  AuthStackParamList,
} from '../../navigations/Stacks/AuthStack/NewAuthStack';
const Os = Platform.OS;

export type ResetConfirmPasswordScreenParams = {
  email: string;
};

interface Props {
  // navigation: any;
}
type TRoute = RouteProp<AuthStackParamList, 'ResetPasswordConfirm'>;

const ResetConfirmScreen: React.FC<Props> = () => {
  const [code, setCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [checkPassword, setCheckPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();
  const route = useRoute<TRoute>();
  const navigation = useNavigation<AuthStackNavigationProp>();

  let errorMess = '';
  // 'パスワードと再入力パスワードが一致しません'; //pass & pass confirm not match
  // const regexSpace = /^\s+$/;
  // const validateSpace = /^\S{6,}$/;
  const regex = /^[A-Za-z0-9!"#$%&'()*+,-.:;<=>?@[\\\]^_`{|}~\\\/]+$/;

  const email = React.useMemo(() => _.get(route, 'params.email', ''), [route]);

  const handleCheckPassword = () => {
    const result =
      password && passwordConfirm ? password === passwordConfirm : false;
    setCheckPassword(result);
  };
  const submitHandler = async () => {
    // validate password & password confirm
    if (password.length < 6 && passwordConfirm.length < 6) {
      // console.log('password < 6');
      // errorMess = 'パスワードの長さは 6 桁以上必要です。';
      dropDownAlert?.alertWithType(
        'error',
        Messages.COMMON.MSG_COMMON_TEXT_ERROR,
        // errorMess,
        Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_ERROR_004,
      );
      return;
    } else if (password !== passwordConfirm) {
      console.log('password & password confirm not match');
      dropDownAlert?.alertWithType(
        'error',
        Messages.COMMON.MSG_COMMON_TEXT_ERROR,
        Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_ERROR_006,
        // 'password & password confirm not match',
      );
      return;
    } else if (!regex.test(password) && !regex.test(passwordConfirm)) {
      // console.log('password invalid ( contain 1 or more character not in list ) !!!!');
      // console.log(password, passwordConfirm);
      // errorMess = 'パスワードに使用できない文字が含まれています。';
      dropDownAlert?.alertWithType(
        'error',
        Messages.COMMON.MSG_COMMON_TEXT_ERROR,
        // errorMess,
        Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_ERROR_005,
      );
      return;
    }
    setLoading(true);
    const data = {
      confirmation_code: `${code}`,
      new_password: `${password}`,
      email,
    };
    await ConfirmResetPassword(data)
      .then(res => {
        navigation.navigate('Login');
      })
      .catch(error => {
        console.log(
          error &&
            error.response &&
            error.response.data &&
            error.response.data.detail,
          '123123',
        );
        errorMess = _.get(error, 'response.data.detail', '');
      })
      .finally(() => {
        setLoading(false);
        dropDownAlert?.alertWithType(
          'error',
          Messages.COMMON.MSG_COMMON_TEXT_ERROR,
          errorMess,
        );
      });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      {/* notify */}
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
          {/* body */}
          <View style={styles.formContainer}>
            <View style={styles.formInput}>
              {/* code */}
              <Text style={styles.label}>
                {Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_003}
              </Text>
              <InputCustom
                autoFocus={true}
                style={styles.inputCode}
                onChangeText={setCode}
                maxLength={6}
                keyboardType={'number-pad'}
              />
            </View>
            <View style={styles.formInput}>
              {/* password */}
              <Text style={styles.label}>
                {Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_004}
              </Text>
              <InputMask
                value={password}
                onChange={setPassword}
                checkPassword={checkPassword}
                onBlur={handleCheckPassword}
              />
            </View>
            <View style={styles.formInput}>
              <Text style={styles.label}>
                {Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_005}
              </Text>
              <InputMask
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                checkPassword={checkPassword}
                onBlur={handleCheckPassword}
              />
            </View>

            <View
              style={[
                styles.characterContainer,
                styles.formInput,
                {paddingVertical: 13, marginVertical: 20, marginBottom: 25},
              ]}>
              <Text>{Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_007}</Text>
              <Text>{Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_008}</Text>
              <Text>
                {'! " # $ % &'} {" ' ( ) * + , - . / : ; < = > ? @ [ \\"}
                {'  ] ^ _ ` { | } ~ '}
              </Text>
            </View>
            <View style={[styles.btnContainer, styles.formInput]}>
              <CustomButton
                title={Messages.RESET_PASSWORD.MSG_RESET_PASSWORD_TEXT_006}
                outlined={false}
                colorButton={COLOR_CONSTANT.PRIMARY_COLOR}
                textColor="#fff"
                colorDisabled={'rgba(0,0,0,0.4)'}
                style={styles.btnReset}
                onPress={submitHandler}
                disabled={
                  _.isEmpty(code) ||
                  _.isEmpty(password) ||
                  _.isEmpty(passwordConfirm)
                  // Boolean(
                  //   password && passwordConfirm && password !== passwordConfirm,
                  // )
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <LoadingModal loading={loading} />
    </SafeAreaView>
  );
};
type IInputMaskProps = {
  onChange: (value: string) => void;
  // onBlur: () => void;
  value: string;
  checkPassword: boolean;
  onBlur: () => void;
};
const InputMask = ({
  value = '',
  onChange,
  checkPassword,
  onBlur,
}: IInputMaskProps) => {
  const valueDefault = useMemo(() => value, [value]);
  const [text, setText] = useState(valueDefault);
  const [mask, setMask] = useState<boolean>(true);
  const handler = _.debounce(onChange, 100);
  useEffect(() => {
    handler(text);
  }, [text]);
  return (
    <View
      style={[
        {
          borderColor: 'rgba(0,0,0,0.5)',
          borderRadius: 3,
          borderWidth: 1,
          paddingVertical: Os == 'ios' ? 11 : 7,
        },
      ]}>
      <View
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <InputCustom
          secureTextEntry
          onChangeText={setText}
          value={text}
          keyboardType="default"
          autoCapitalize="none"
          maxLength={30}
          style={styles.inputPass}
          onBlur={() => onBlur()}
        />
        <View style={styles.iconCheck}>
          <Entypo
            name={'check'}
            size={15}
            style={{
              color: checkPassword ? '#2C73B6' : 'rgba(0,0,0,0.3)',
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setMask(!mask);
            }}
            style={{
              height: '100%',
              paddingHorizontal: 10,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Entypo
              name={mask ? 'eye-with-line' : 'eye'}
              color={'rgba(0,0,0,0.5)'}
              size={20}
            />
          </TouchableOpacity>
          {/* #2C73B6 rgba(0,0,0,0.3) */}
        </View>
      </View>
      {text ? (
        <View
          style={{
            paddingHorizontal: 10,
            opacity: 0.4,
            display: !mask ? 'flex' : 'none',
            zIndex: 1,
            marginBottom: 5,
          }}>
          <Text numberOfLines={3} style={{color: '#000'}}>
            {text}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    marginVertical: Platform.OS == 'android' ? 30 : 0,
    marginHorizontal: 20,
  },
  inputCode: {
    width: '60%',
    alignSelf: 'flex-start',
    height: 40,
  },
  inputPass: {
    position: 'relative',
    paddingVertical: 0,
    borderWidth: 0,
    paddingRight: '15%',
    width: '100%',
  },
  iconCheck: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    right: 0,
  },
  icon: {
    position: 'absolute',
    right: 0,
    zIndex: 99,
  },
  btnContainer: {
    flex: 1,
    borderColor: 'transparent',
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
  characterContainer: {
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    // marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
  },
  label: {
    // left: '5%',
    marginLeft: 2,
    marginBottom: 5,
  },
  formInput: {
    marginBottom: 10,
  },
});

export default ResetConfirmScreen;
