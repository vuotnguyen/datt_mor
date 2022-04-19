import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
} from 'react-native';
import * as _ from 'lodash';
import DropdownAlert from 'react-native-dropdownalert';
// import {Auth} from 'aws-amplify';
import { ButtonIcon, CustomButton } from '../../components/buttons';
import * as stylesGlobal from '../../styles';
import Messages from '../../config/Messages';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../../stories';
import { createAction, UserAction, AllUserAction } from '../../stories/actions';
import { auth, dataCache, image } from '../../stories/types';
import { Auth } from '../../stories/actions';
import { useDispatch } from 'react-redux';
import { getListChats } from '../../stories/actions/chat';
import { GetAllUserInfo } from '../../stories/actions/infoallUser';
import { Entypo } from '../../assets/icons';

const Os = Platform.OS;

export interface Props {
  navigation: any;
}
const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatchThunk = useDispatch();
  const dispatchLocal = useAppDispatch();
  const [dropDownAlert, setDropDownAlert] = useState<DropdownAlert | null>();
  const [email, setemail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [disableButtonLogin, setDisableButtonLogin] = useState<boolean>(true);

  useEffect(() => {
    if (email && password) {
      setDisableButtonLogin(false);
    } else {
      setDisableButtonLogin(true);
    }
  }, [email, password]);
  const signIn = () => {
    Keyboard.dismiss();
    dispatchLocal(createAction(dataCache.LOADING_START, null));
    let params = {
      email,
      password,
    };
    const success = () => {
      const callback = () => { };
      dispatchThunk(UserAction.GetUserInfo(()=>{
        navigation.navigate('App');
    }, callback, ()=>{
        dispatchLocal(createAction(dataCache.LOADING_FINISH, null));
      }));
      dispatchThunk(getListChats(callback, callback, callback));
      dispatchThunk(GetAllUserInfo(callback, callback, callback));
     
    };
    const fail = () => {
      dispatchLocal(createAction(dataCache.LOADING_FINISH, null));
      setDisableButtonLogin(true);
      dropDownAlert?.alertWithType(
        'error',
        Messages.COMMON.MSG_COMMON_TEXT_ERROR,
        Messages.LOGIN.MSG_LOGIN_ERROR_001,
      );
    };
    dispatchThunk(Auth.Login(params, success, fail));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DropdownAlert
        updateStatusBar={false}
        ref={ref => setDropDownAlert(ref)}
        activeStatusBarBackgroundColor={'#ffffff'}
        zIndex={99}
      />
      <KeyboardAvoidingView
        behavior={Os === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        {/* header */}

        {/* content */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              padding: 15,
              flex: 15,
              position: 'relative',
              zIndex: 1,
            }}>
            <Text
              style={[
                stylesGlobal.text.title,
                { marginBottom: 34, fontSize: 36, fontWeight: 'bold' },
              ]}>
              ログイン
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.5)',
                borderRadius: 3,
              }}>
              <TextInput
                style={[styles.input, Os == 'ios' ? { height: 50 } : {}]}
                onChangeText={setemail}
                value={email}
                placeholder="メールアドレス"
                placeholderTextColor="#999999"
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>

            <InputMask value={password} onChange={setPassword} />

            {/* <View>
              <TextInput
                style={[
                  styles.input,
                  {
                    marginVertical: 16,
                    position: 'relative',
                    paddingRight: '15%',
                  },
                ]}
                onChangeText={setPassword}
                value={password}
                keyboardType="default"
                placeholder="パスワード"
                placeholderTextColor="#999999"
                secureTextEntry={mask}
                autoCapitalize="none"
              />
              <Text
                style={styles.icon}
                onPress={() => {
                  setMask(!mask);
                }}>
                <Entypo name={mask ? 'eye-with-line' : 'eye'} size={20} />
              </Text>
            </View> */}
            <CustomButton
              disabled={disableButtonLogin}
              title="ログイン"
              outlined={false}
              colorButton="#000"
              textColor="#fff"
              onPress={signIn}
              colorDisabled={'rgba(0,0,0,0.4)'}
            />

            <View style={styles.btnResetContainer}>
              <CustomButton
                title="パスワードを忘れた方はこちら"
                outlined={false}
                colorButton="#ccc"
                textColor="#000"
                colorDisabled={'rgba(0,0,0,0.4)'}
                onPress={() => {
                  navigation.navigate('ResetPasswordScreen');
                }}
                style={styles.btnReset}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
type InputMaskProps = {
  value: string;
  onChange: (val: string) => void;
};
const InputMask = ({ onChange, value }: InputMaskProps) => {
  const valueDefault = React.useMemo(() => value, [value]);
  const [text, setText] = useState(valueDefault);
  const [mask, setMask] = useState<boolean>(true);
  const handler = _.debounce(onChange, 100);
  useEffect(() => {
    handler(text);
  }, [text]);

  return (
    <View
      style={{
        marginVertical: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.5)',
        borderRadius: 3,
        zIndex: 1,
        paddingVertical: Os == 'ios' ? 14 : 10,
      }}>
      <View
        style={{
          position: 'relative',
          width: '100%',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TextInput
          style={[
            styles.input,
            {
              paddingVertical: 0,
              paddingRight: '15%',
              width: '100%',
            },
          ]}
          maxLength={55}
          onChangeText={setText}
          value={text}
          keyboardType="default"
          placeholder="パスワード"
          placeholderTextColor="#999999"
          secureTextEntry
          autoCapitalize="none"
        />
        <View style={styles.icon}>
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
        </View>
      </View>
      {text ? (
        <View
          style={{
            paddingHorizontal: 17,
            paddingRight: '15%',
            opacity: 0.4,
            display: !mask ? 'flex' : 'none',
            zIndex: 1,
            marginBottom: 5,
          }}>
          <Text numberOfLines={3} style={{ color: '#000' }}>{text}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  btnBack: {
    padding: 5,
    width: 50,
    borderRadius: 50 / 2,
  },

  input: {
    borderRadius: 2,
    paddingHorizontal: 17,
    color: '#000',
  },
  btnResetContainer: {
    marginTop: 92,
    alignItems: 'center',
  },
  btnReset: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    alignSelf: 'center',
  },
  icon: {
    position: 'absolute',
    right: 0,
    zIndex: 99,
  },
});

export default LoginScreen;
