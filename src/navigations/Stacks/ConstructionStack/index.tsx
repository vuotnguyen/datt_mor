import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StackNavigationProp} from '@react-navigation/stack';
import CreateConstruction from '../../../scenes/Construction/CreateConstruction';
import EditConstruction, {
  EditConstructionScreenParams,
} from '../../../scenes/Construction/EditConstruction';
import ConstructionScreen from '../../../scenes/Construction';
import DetailConstruction from '../../../scenes/Construction/DetailConstruction';

export type ConstructionStackNavigationParams = {
  ConstructionScreen: undefined;
  CreateConstruction: undefined;
  EditConstruction: EditConstructionScreenParams;
  DetailConstruction: EditConstructionScreenParams
};

export type ConstructionStackNavigationProp = StackNavigationProp<ConstructionStackNavigationParams>;

const ConstructionStack = createStackNavigator<ConstructionStackNavigationParams>();

export const ConstructionStackNavigator = (): JSX.Element => {
  return (
    <ConstructionStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}>
      <ConstructionStack.Screen
        name="ConstructionScreen"
        component={ConstructionScreen}
      />

    </ConstructionStack.Navigator>
  );
};
