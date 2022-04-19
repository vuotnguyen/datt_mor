import React from 'react';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import AuthLoadingScreen from '../../scenes/AuthLoadingScreen';
import MainTabsNavigator from '../MainTab';
import {AuthStackNavigator} from '../Stacks/AuthStack/NewAuthStack';
import {ChatGroupStackNavigator} from '../Stacks/GroupChatStack';
import IndividualChatScreen, {
  IndividualChatParams,
} from '../../scenes/IndividualChat';
import ChatGroupScreen, {ChatGroupParams} from '../../scenes/ChatGroupScreen';
import SearchScreen from '../../scenes/SearchScreen';
import CreateGroupChatScreen from '../../scenes/GroupChatCreate';
import CreateConstruction from '../../scenes/Construction/CreateConstruction';
import CreateConstructionGroupChat from '../../scenes/CreateConstructionGroupChat';
import EditConstruction, {
  EditConstructionScreenParams,
} from '../../scenes/Construction/EditConstruction';
import DetailConstruction from '../../scenes/Construction/DetailConstruction';
import CreateAssignmentScreen from '../../scenes/CreateDocuments/CreateAssignmentScreen';
import CreateReportScreen from '../../scenes/CreateDocuments/CreateReportScreen';
import ConstructionScreen from '../../scenes/Construction';
import {useAppDispatch, useAppSelector} from '../../stories';

export type RootStackParamsList = {
  AuthLoading: undefined;
  Auth: undefined;
  App: undefined;
  SearchChat: undefined;
  IndividualChat: IndividualChatParams;
  ChatGroup: ChatGroupParams;
  CreateGroupChat: undefined;
  CreateConstruction: undefined;
  EditConstruction: EditConstructionScreenParams;
  DetailConstruction: undefined;
  CreateConstructionGroupChat: undefined;
  CreateAssignment: undefined;
  CreateReport: undefined;
  ConstructionScreen: undefined;
};
export type RootStackNavigationProp = StackNavigationProp<RootStackParamsList>;

const RootStack = createStackNavigator<RootStackParamsList>();

export const RootStackNavigator = (): JSX.Element => {
  return (
    <RootStack.Navigator
      initialRouteName={'AuthLoading'}
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}>
      <RootStack.Screen
        name="AuthLoading"
        component={AuthLoadingScreen}
        options={{gestureEnabled: false}}
      />
      <RootStack.Screen
        name="Auth"
        component={AuthStackNavigator}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="App"
        component={MainTabsNavigator}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="SearchChat"
        component={SearchScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="IndividualChat"
        component={IndividualChatScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="ChatGroup"
        component={ChatGroupScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="CreateGroupChat"
        component={CreateGroupChatScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="CreateConstructionGroupChat"
        component={CreateConstructionGroupChat}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="CreateAssignment"
        component={CreateAssignmentScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="CreateReport"
        component={CreateReportScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <RootStack.Screen
        name="ConstructionScreen"
        component={ConstructionScreen}
      />
      <RootStack.Screen
        name="CreateConstruction"
        component={CreateConstruction}
      />
      <RootStack.Screen name="EditConstruction" component={EditConstruction} />
      <RootStack.Screen
        name="DetailConstruction"
        component={DetailConstruction}
      />
    </RootStack.Navigator>
  );
};
