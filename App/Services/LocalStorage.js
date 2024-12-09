import AsyncStorage from '@react-native-async-storage/async-storage'

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    // eslint-disable-next-line no-console
  }
}

export const wipeData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
  }
}

export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e) {
    // error reading value
    // eslint-disable-next-line no-console
  }
}

export const LocalDBItems = {
  baseUrl: 'BASE_URL',
  isUserAuthenticated: 'IS_USER_AUTHENTICATED',
  userDetails: 'USER_DETAILS',
  loginData: 'LOGIN_DATA',
  employeeDetails: 'EMPLOYEE_DETAILS',
  organizationDetails: 'ORGANIZATION_DETAILS',
  subscriptionDetails: 'SUBSCRIPTION_DETAILS',
  tokenData: 'TOKEN_DATA',
  locationArray:'LOCATION_ARRAY',
  location:'LOCATION',
  saveFaceIDData: 'SAVE_FACEID',
  checkInInfo: 'CHECKIN_INFO',
  checkInDate: 'CHECKIN_DATE',
  storeSelectedTeam: 'STORE_SELECTED_TEAM',
  isLocationFetcherRequired: "IS_LOCATION_REQUIRED",
  isEmployeeLocationTrack: 'IS_EMPLOYEE_TRACK',
  locationArrayForTracing: 'LOCATION_ARRAY_FOR_TRACKING',
  checkInLocationInfo:'CHECKIN_LOCATION_INFO',
  checkOutLocationInfo:'CHECKOUT_LOCATION_INFO',
  groupUUID:'GROUP_UUID',
  isLocationTrackingNeeded:"IS_LOCATION_TRACKING_NEEDED",
  selectedProjectDetails:"SELECTED_PROJECT_DETAILS",
  CHECK_IN_OUT_DETAILS:  "CHECK_IN_OUT_DETAILS"
  
}
