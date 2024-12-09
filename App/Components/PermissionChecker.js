import { checkMultiple, PERMISSIONS } from "react-native-permissions";
import { Platform } from "react-native";

const permissionsIOSArray = [
  PERMISSIONS.IOS.CAMERA,
  PERMISSIONS.IOS.LOCATION_ALWAYS,
  PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
];
const permissionsAndroidArray = [
  PERMISSIONS.ANDROID.CAMERA,
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
];

export async function CheckPermissions(permissionsArray) {
  return checkMultiple(permissionsArray).then((statuses) => {
    let keyCount = Object.keys(statuses).length;
    let grantedCounter = 0;
    let unGrantedObj = [];
    let grantedObj = [];
    let resultObj = {
      granted: false,
      result: [],
    };
    Object.keys(statuses).forEach(function (key) {
      if (statuses[key] == "granted") {
        grantedCounter++;
        grantedObj.push(key);
      } else {
        unGrantedObj.push(key);
      }
    });
    if (keyCount == grantedCounter) {
      // successCallBack(true,grantedObj)
      resultObj.granted = true;
      resultObj.result = grantedObj;
      return resultObj;
      // return (true,grantedObj)
    } else {
      // errorCallback(unGrantedObj)
      resultObj.granted = false;
      resultObj.result = unGrantedObj;
      return resultObj;
    }
  });
}

export async function isCameraPermisonGranted() {
  let permissionsArray = [];
  let isGranted = false;
  if (Platform.OS == "ios") {
    permissionsArray = [PERMISSIONS.IOS.CAMERA];
  }
  if (Platform.OS == "android") {
    permissionsArray = [PERMISSIONS.ANDROID.CAMERA];
  }

  return CheckPermissions(permissionsArray).then((result) => {
    let updatedResult = { ...result, name: "camera" };
    return updatedResult;
  });
}

export async function isLocationPermisonGranted() {
  let permissionsArray = [];
  let isGranted = false;
  if (Platform.OS == "ios") {
    permissionsArray = [
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ];
  }
  if (Platform.OS == "android") {
    permissionsArray = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
  }
  return CheckPermissions(permissionsArray).then((result) => {
    let updatedResult = { ...result, name: "location" };
    return updatedResult;
  });
}

export async function checkAllPermison() {
  return Promise.all([
    isLocationPermisonGranted(),
    isCameraPermisonGranted(),
  ]).then((values) => {
    let filterdArray = values.filter(function (item) {
      return item.granted == false;
    });
    let allGranted = filterdArray.length > 0 ? false : true;
    let name = filterdArray
      .map((item) => {
        return item.name;
      })
      .join(",");
    let result = {
      allGranted: allGranted,
      nameOfNotGrantedPermission: name,
      allResult: values,
    };
    return result;
  });
}
