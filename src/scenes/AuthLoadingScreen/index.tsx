import React, {useEffect} from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import {Auth} from 'aws-amplify';
import * as banners from '../../assets/images/banners';
import * as logo from '../../assets/images/logo';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppDispatch} from '../../stories';
import {createAction, UserAction} from '../../stories/actions';
import {getListChats} from '../../stories/actions/chat';
import {useDispatch} from 'react-redux';

/**
 * store access token in AsyncStorage
 *
 * @type async function
 *
 * @param accessToken string
 *
 * @return void
 */

const storeData = async (accessToken: string) => {
  try {
    await AsyncStorage.setItem('@accessToken', accessToken);
  } catch (e) {
    // saving error
  }
};
// define interface component props
export interface Props {
  navigation: any;
}

const AuthLoadingScreen: React.FC<Props> = ({navigation}) => {
  const /** @type {Dispatch<any>} hook dispatch (store) */ dispatchThunk = useDispatch();

  /** life cycles hook componentDidMount  */
  useEffect(() => {
    /**
     * check user was exist last login version
     * if
     *   true (existed)
     *     move to Home Stack (Home screen)
     * else
     *   false
     *     move to Auth Stack (login screen)
     * @type async function
     *
     * @return void
     */
    const fetchUser = async () => {
      var role = JSON.stringify(await AsyncStorage.getItem('@userRole'));
      try {
        const userToken = await Auth.currentAuthenticatedUser({
          bypassCache: true,
        });
        await storeData(userToken.signInUserSession.accessToken.jwtToken);
        navigation.navigate(userToken ? 'App' : 'Auth', {userRole: role});
        /**
         *  this function run when promise success (then() )
         *
         *  @type function callback
         */
        const success = () => {};
        /**
         *  this function run when promise fail (catch () )
         *
         *  @type function callback
         */
        const fail = () => {};
        /**
         *  this function run when promise finnaly (finnaly() )
         *
         *  @type function callback
         */
        const finish = () => {};

        /** dispatch action call api get Info User  */
        // dispatchThunk(UserAction.GetUserInfo(success, fail, finish));

        //** dispatch action call api get list chat */
        dispatchThunk(getListChats(success, fail, finish));
      } catch (error) {
        //** navigate Auth stack (login screen) when haven`t login version  */
        navigation.navigate('Auth');
      }
    };
    /** run function check Auth */
    fetchUser();
    SplashScreen.hide();
    /** check OS and setup theme status bar make sure text status is black */
    StatusBar.setBarStyle(Platform.OS === 'ios' ? 'dark-content' : 'default');
  }, []);

  return (
    <ImageBackground source={banners.bannerLogin} style={styles.container}>
      <View style={styles.overBackground}>
        <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
          {/* logo App */}
          <Image
            source={logo.logoBranch}
            style={[
              styles.logo,
              {
                flex: 1,
                aspectRatio: 0.3,
                resizeMode: 'contain',
              },
            ]}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  ImageBackground: {
    resizeMode: 'cover',
    justifyContent: 'center',
    position: 'absolute',
  },
  logo: {
    width: 50,
    height: 50,
  },
  overBackground: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'relative',
    zIndex: 15,
  },
  positionCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
  },
  wrapperButton: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  statusBarStyle: {
    color: '#000',
  },
});

export default AuthLoadingScreen;
