import 'react-native-gesture-handler';
import React from 'react';
import Navigation from './scenes/myNavigation';
import {Provider} from 'react-redux';
import {persistor, store} from './stories';
import Amplify from 'aws-amplify';
import AWSConfig from './aws-exports';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {PersistGate} from 'redux-persist/integration/react';
import {NativeBaseProvider} from 'native-base';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import {database} from './database/watermelonDB';

Amplify.configure(AWSConfig);
Icon.loadFont();

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NativeBaseProvider>
          <DatabaseProvider database={database}>
            <Navigation />
          </DatabaseProvider>
        </NativeBaseProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
