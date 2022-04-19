import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MediaScreen from '../../../scenes/MediaScreen';
import DrawPhotoScreen, {
  DrawPhotoScreenParams,
} from '../../../scenes/DrawPhotoScreen';
import {StackNavigationProp} from '@react-navigation/stack';

export type MediaStackNavigationParams = {
  MediaScreen: undefined;
  DrawPhotoScreen: DrawPhotoScreenParams;
};

export type MediaStackNavigationProp = StackNavigationProp<MediaStackNavigationParams>;

const MediaStack = createStackNavigator<MediaStackNavigationParams>();

export const MediaStackNavigator = (): JSX.Element => {
  return (
    <MediaStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}>
      <MediaStack.Screen name="MediaScreen" component={MediaScreen} />
      <MediaStack.Screen name="DrawPhotoScreen" component={DrawPhotoScreen} />
    </MediaStack.Navigator>
  );
};
