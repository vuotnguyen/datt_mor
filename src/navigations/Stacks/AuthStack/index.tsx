import React from 'react';
import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import LoggedOutScreen from '../../../scenes/LoggedOut';
import LoginScreen from '../../../scenes/LoginScreen';
import {Pressable, Platform, View} from 'react-native';
import {AntDesign, Entypo} from '../../../assets/icons';
import ResetPasswordScreen from '../../../scenes/ResetPasswordScreen';
import ResetConfirmScreen from '../../../scenes/ResetPasswordScreen/ResetConfirmScreen';
import CreateAssignmentScreen from '../../../scenes/CreateDocuments/CreateAssignmentScreen';
const AuthStack = createStackNavigator({
  LoggedOut: {
    screen: LoggedOutScreen,
    navigationOptions: {headerShown: false, animationEnabled: false},
  },
  // CreateAssignmentScreen: {
  //   screen: CreateAssignmentScreen,
  //   navigationOptions: {headerShown: false, animationEnabled: false},
  // },
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      title: '',
      headerBackImage: ({}) => (
        <AntDesign
          style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
          size={20}
          name="back"
        />
      ),
      headerBackTitleVisible: false,
      animationEnabled: false,
      headerStyle: {
        borderColor: 'transparent',
        shadowColor: 'transparent',
      },
    },
  },
  ResetPasswordScreen: {
    screen: ResetPasswordScreen,
    navigationOptions: {
      headerTitle: 'パスワードリセット',
      headerRight: () => (
        <View style={{opacity: 0}}>
          <Entypo
            name="chevron-left"
            style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
            size={32}
          />
        </View>
      ),
      headerBackImage: ({}) => (
        <Entypo
          name="chevron-left"
          style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
          size={32}
        />
      ),
      headerBackTitleVisible: false,
      animationEnabled: false,
      headerTitleContainerStyle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      },
      headerTitleStyle: {
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
      },
      headerStyle: {
        borderColor: '#DADADA',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        shadowColor: 'transparent',
      },
    },
  },
  ResetPasswordConfirm: {
    screen: ResetConfirmScreen,
    navigationOptions: {
      headerTitle: 'パスワードリセット',
      headerRight: () => (
        <View style={{opacity: 0}}>
          <Entypo
            name="chevron-left"
            style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
            size={32}
          />
        </View>
      ),
      headerBackImage: ({}) => (
        <Entypo
          name="chevron-left"
          style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
          size={32}
        />
      ),
      headerBackTitleVisible: false,
      animationEnabled: false,
      headerTitleContainerStyle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      },
      headerTitleStyle: {
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
      },
      headerStyle: {
        borderColor: '#DADADA',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        shadowColor: 'transparent',
      },
    },
  },
});

export default createAppContainer(AuthStack);
