import {NavigationContainer} from '@react-navigation/native';
import * as React from 'react';
import AppStack from '../../Navigators/ApplicationStack';
import AuthStack from '../../Navigators/AuthenticationStack';
import { navigationRef } from '../../Services/NavigationService';
import { LocalDBItems, getData } from '../../Services/LocalStorage'

const isUserLoggedIn = false
getIsUserAuth = async () => {
  const isLogin = await getData(LocalDBItems.isUserAuthenticated);
  return isLogin
}

export default function App() {
 return (
    <NavigationContainer ref={navigationRef}>
      {isUserLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
