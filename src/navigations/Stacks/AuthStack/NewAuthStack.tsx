import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import LoginScreen from '../../../scenes/LoginScreen';
import LoggedOutScreen from '../../../scenes/LoggedOut';
import ResetPasswordScreen from '../../../scenes/ResetPasswordScreen';
import {Entypo} from '../../../assets/icons';
import {Platform} from 'react-native';
import ResetConfirmScreen, {
  ResetConfirmPasswordScreenParams,
} from '../../../scenes/ResetPasswordScreen/ResetConfirmScreen';

export type AuthStackParamList = {
  Login: undefined;
  LoggedOut: undefined;
  ResetPasswordScreen: undefined;
  ResetPasswordConfirm: ResetConfirmPasswordScreenParams;
};
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;

export const AuthStack = createStackNavigator<AuthStackParamList>();

export const AuthStackNavigator = (): JSX.Element => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        gestureEnabled: false,
      }}>
      <AuthStack.Screen
        name="LoggedOut"
        component={LoggedOutScreen}
        options={{headerShown: false, animationEnabled: false}}
      />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false, animationEnabled: false}}
      />
      <AuthStack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{
          title: 'パスワードリセット',
          headerBackImage: () => (
            <Entypo
              name="chevron-left"
              style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
              size={32}
            />
          ),
          headerBackTitleVisible: false,
          animationEnabled: false,
          headerTitleStyle: {
            fontSize: 16,
          },
          headerStyle: {
            borderColor: '#DADADA',
            borderBottomWidth: 0.5,
            borderStyle: 'solid',
            shadowColor: 'transparent',
          },
        }}
      />
      <AuthStack.Screen
        name="ResetPasswordConfirm"
        component={ResetConfirmScreen}
        options={{
          headerTitle: 'パスワードリセット',
          headerBackImage: ({}) => (
            <Entypo
              name="chevron-left"
              style={{paddingLeft: Platform.OS === 'ios' ? 15 : 0}}
              size={32}
            />
          ),
          headerBackTitleVisible: false,
          animationEnabled: false,
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
        }}
      />
    </AuthStack.Navigator>
  );
};
