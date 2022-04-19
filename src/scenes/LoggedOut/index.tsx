import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import {Auth} from 'aws-amplify';
import * as banners from '../../assets/images/banners';
import * as logo from '../../assets/images/logo';
import {CustomButton} from '../../components/buttons';
import {useAppSelector} from '../../stories';
export interface Props {
  navigation: any;
}
const LoggedOutScreen: React.FC<Props> = ({navigation}) => {
  async function signOut() {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }
  const dimensions = useAppSelector(state => {
    return state.dataCache.dimensions;
  });
  React.useEffect(() => {
    const onBackPress = () => {
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  return (
    <ImageBackground source={banners.bannerLogin} style={styles.container}>
      <View style={styles.overBackground}>
        <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={logo.logoBranch}
            style={[
              styles.logo,
              {
                flex: 1,
                aspectRatio: 0.4,
                resizeMode: 'contain',
              },
            ]}
          />
        </View>
        <View style={[styles.wrapperButton, {flex: 0.5}]}>
          <View style={{padding: 15, backgroundColor: '#fff'}}>
            <CustomButton
              title="ログイン"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
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
});
export default LoggedOutScreen;
