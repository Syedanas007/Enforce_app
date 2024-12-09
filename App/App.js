import  { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import createStore from './Stores';
import Router from './Containers/Route/Router';
import * as React from 'react';
import SplashScreen from './Containers/SplashScreen/SplashScreen';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import {Alert} from 'react-native';
const { store, persistor } = createStore()
import { AppState, StyleSheet, Text, View } from "react-native";
import CustomModal from './Components/CustomModal';
import {checkAllPermison} from './Components/PermissionChecker'
import { getUUID, handleGenerateUUID } from './helper';

const errorHandler = (e, isFatal) => {
  if (isFatal) {
    Alert.alert(
        'Unexpected error occurred',
        `
        Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}
        We have reported this to our team ! Please close the app and start again!
        `,
      [{
        text: 'Close'
      }]
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler, true);

setNativeExceptionHandler((errorString) => {
});

export default class App extends Component {

  state = {
    appState: AppState.currentState,
  };
  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    handleGenerateUUID()
    // this.getDeviceUUID()
  }
  getDeviceUUID=async()=>{
    let UUID = await getUUID()
    console.log(UUID,"UUID")
  }
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
    }
    this.setState({ appState: nextAppState });
    
  };
  

  render() {
    return (
      /**
       * @see https://github.com/reduxjs/react-redux/blob/master/docs/api/Provider.md
       */
      <Provider store={store}>
        {/**
         * PersistGate delays the rendering of the app's UI until the persisted state has been retrieved
         * and saved to redux.
         * The `loading` prop can be `null` or any react instance to show during loading (e.g. a splash screen),
         * for example `loading={<SplashScreen />} eg: <PersistGate loading={<SplashScreen />} persistor={persistor}>.
         * @see https://github.com/rt2zz/redux-persist/blob/master/docs/PersistGate.md
         */}

        <PersistGate persistor={persistor}>
          <Router/>
        </PersistGate>
      </Provider>
    )
  }
}
