import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {RootStackNavigator} from './RootStack';

export default function Navigation(): JSX.Element {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
