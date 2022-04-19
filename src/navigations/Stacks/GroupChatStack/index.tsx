import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../../../scenes/LoginScreen';
import LoggedOutScreen from '../../../scenes/LoggedOut';
import ResetPasswordScreen from '../../../scenes/ResetPasswordScreen';
import {Entypo} from '../../../assets/icons';
import {Platform} from 'react-native';
import ResetConfirmScreen from '../../../scenes/ResetPasswordScreen/ResetConfirmScreen';
import ChatGroupScreen, {
  ChatGroupParams,
} from '../../../scenes/ChatGroupScreen';

import CreateAssignmentScreen from '../../../scenes/CreateDocuments/CreateAssignmentScreen';
import CreateReportScreen from '../../../scenes/CreateDocuments/CreateReportScreen';

export type ChatGroupStackParamList = {
  ChatGroup: ChatGroupParams;
  CreateAssignment: undefined;
  CreateReport: undefined;
};

export const ChatGroupStack = createStackNavigator<ChatGroupStackParamList>();

export const ChatGroupStackNavigator = (): JSX.Element => {
  return (
    <ChatGroupStack.Navigator initialRouteName={'ChatGroup'}>
      <ChatGroupStack.Screen name="ChatGroup" component={ChatGroupScreen} />
      <ChatGroupStack.Screen name="CreateAssignment" component={CreateAssignmentScreen} />
      <ChatGroupStack.Screen name="CreateReport" component={CreateReportScreen} />
    </ChatGroupStack.Navigator>
  );
};
