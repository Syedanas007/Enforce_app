
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from '../Containers/Login/LoginScreen'
import * as React from 'react';
import SplashScreen from '../Containers/SplashScreen/SplashScreen'
import PermissionScreen from '../Containers/PermisionScreen/PermisionScreen';
import FaceRegistrationIntoScreen from '../Containers/FaceRegisterationScreen/FaceRegistrationIntroScreen';
import FaceRegistrationScreen from '../Containers/FaceRegisterationScreen/FaceRegistrationScreen';
import ApplicationStack from './ApplicationStack';
import AddEmployeeScreen from '../Containers/Home/AddEmployeeScreen/AddEmployeeScreen';
import CheckInScreen from '../Containers/Home/CheckInScreen/CheckInScreen';
import ViewLiveTrackingScreen from '../Containers/Home/ViewLiveTracking';


const Stack = createStackNavigator();

export  function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName='LoginScreen'
      screenOptions={{headerShown: false, gestureEnabled: false}}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="PermissionScreen" component={PermissionScreen} />
      <Stack.Screen name="FaceRegistrationIntoScreen" component={FaceRegistrationIntoScreen} />
      <Stack.Screen name="FaceRegistrationScreen" component={FaceRegistrationScreen} />
      <Stack.Screen name="AddEmployeeScreen" component={AddEmployeeScreen} /> 
      <Stack.Screen name="CheckInScreen" component={CheckInScreen} />
      <Stack.Screen name="ViewLiveTrackingScreen" component={ViewLiveTrackingScreen} />
    </Stack.Navigator>
  );
}
export default function AuthenticationStack() {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{headerShown: false, gestureEnabled: false}}>
       <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthStack} />
      <Stack.Screen name="App" component={ApplicationStack} />
    </Stack.Navigator>
  );
}

