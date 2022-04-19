import React from 'react';
import {
  BottomTabNavigationProp,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {FontAwesome5} from '../../assets/icons';
import ProfileUserScreen from '../../scenes/ProfileUser/indexFlatlist';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Messages from '../../config/Messages';
import {MediaStackNavigator} from '../Stacks/MediaStack';
import {useAppDispatch, useAppSelector} from '../../stories';
import ChatsScreen from '../../scenes/Chats';
import {ConstructionStackNavigator} from '../Stacks/ConstructionStack';
import {UserAction} from '../../stories/actions';
import {useDispatch} from 'react-redux';
import {GetAllUserInfo} from '../../stories/actions/infoallUser';

const TabbarIconSize = 20;
const activeColor = '#0295FF';

export enum MAIN_TAB {
  Construction = 'Construction',
  MediaStack = 'MediaStack',
  Chats = 'Chats',
  Profile = 'Profile',
}

export type MainTabsParamsList = {
  Construction: undefined;
  MediaStack: undefined;
  Chats: undefined;
  Profile: undefined;
};

export type MainTabsNavigationProp = BottomTabNavigationProp<MainTabsParamsList>;

const MainTabs = createBottomTabNavigator<MainTabsParamsList>();

const MainTabsNavigator = (): JSX.Element => {
  const dispatchThunk = useDispatch();
  const unreadChatroom = useAppSelector(
    state => state.dataChat.unread_chatroom,
  );
  const tabBarBadge = unreadChatroom > 99 ? '99+' : unreadChatroom;
  React.useEffect(() => {
    const callback = () => undefined;
    dispatchThunk(UserAction.GetUserInfo(callback, callback, callback));
    dispatchThunk(GetAllUserInfo(callback, callback, callback));
  }, []);
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 14,
        },
      }}>
      <MainTabs.Screen
        name="Construction"
        component={ConstructionStackNavigator}
        options={{
          title: Messages.BOTTOM_TAB.TITLE_HOME,
          tabBarIcon: ({focused}) => (
            <FontAwesome5
              name={'home'}
              size={TabbarIconSize}
              style={{color: focused ? activeColor : 'black'}}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="MediaStack"
        component={MediaStackNavigator}
        options={{
          title: Messages.BOTTOM_TAB.TITLE_CAMERA,
          tabBarIcon: ({focused}) => (
            <Feather
              name={'camera'}
              size={TabbarIconSize}
              style={{color: focused ? activeColor : 'black'}}
            />
          ),
          tabBarStyle: {display: 'none'},
        }}
      />
      <MainTabs.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarBadge: tabBarBadge,
          tabBarBadgeStyle: {fontSize: 9},
          title: Messages.BOTTOM_TAB.TITLE_CHAT,
          tabBarIcon: ({focused}) => (
            <FontAwesome5
              name={'comment-dots'}
              size={TabbarIconSize}
              style={{color: focused ? activeColor : 'black'}}
            />
          ),
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileUserScreen}
        options={{
          title: Messages.BOTTOM_TAB.TITLE_PROFILE,
          tabBarIcon: ({focused}) => (
            <Entypo
              name={'dots-three-horizontal'}
              size={TabbarIconSize}
              style={{color: focused ? activeColor : 'black'}}
            />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

export default MainTabsNavigator;
