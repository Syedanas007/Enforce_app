
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../Containers/Home/index'
import SplashScreen from '../Containers/SplashScreen/SplashScreen'
import * as React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, } from '@react-navigation/drawer';
import CheckInScreen from '../Containers/Home/CheckInScreen/CheckInScreen';
import AddEmployeeScreen from '../Containers/Home/AddEmployeeScreen/AddEmployeeScreen';
import ViewRoleListScreen from '../Containers/Home/ViewRoleList/ViewRoleList';
import FaceRegistrationScreen from '../Containers/FaceRegisterationScreen/FaceRegistrationScreen';
import AddFaceRegistrationScreen from '../Containers/Home/CheckInScreen/AddFaceRegistration';
import ViewLiveTrackingScreen from '../Containers/Home/ViewLiveTracking';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Close drawer"
        onPress={() => props.navigation.closeDrawer()}
      />
      <DrawerItem
        label="Toggle drawer"
        onPress={() => props.navigation.toggleDrawer()}
      />
    </DrawerContentScrollView>
  );
}

export function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName='HomeScreen'
      screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CheckInScreen" component={CheckInScreen} />
      <Stack.Screen name="AddEmployeeScreen" component={AddEmployeeScreen} />
      <Stack.Screen name="ViewRoleListScreen" component={ViewRoleListScreen} />
      <Stack.Screen name="FaceRegistrationScreen" component={FaceRegistrationScreen} />
      <Stack.Screen name="AddFaceRegistrationScreen" component={AddFaceRegistrationScreen} />
      <Stack.Screen name="ViewLiveTrackingScreen" component={ViewLiveTrackingScreen} />
    </Stack.Navigator>
  );
}

export default function ApplicationStack() {
  return (
    <Stack.Navigator
      initialRouteName="App"
      screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="App" component={AppStack} />
    </Stack.Navigator>
  );
}

