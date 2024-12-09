// @flow
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableHighlight,
  NativeModules,
  Text,
  DeviceEventEmitter,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import AndroidGeolocation from './AndroidGeolocation';
import UtilityHelper from '../../Components/UtilityHelper'
import { getData, LocalDBItems, storeData, wipeData } from '../../Services/LocalStorage'
import {
  check,
  PERMISSIONS,
  RESULTS,
  requestMultiple,
} from 'react-native-permissions';

import Geolocation from 'react-native-geolocation-service';

const regularJobKey = 'regularJobKey';
const exactJobKey = 'exactJobKey';
const foregroundJobKey = 'foregroundJobKey';

const { MyLocationDataManager } = NativeModules;
const locationChanged = NativeModules.MyLocationDataManager;
const locationChangedEmitter = new NativeEventEmitter(MyLocationDataManager);

/**
* Class to handle the location functions
* Added native location library component
* Events will be triggered to this class once its initialized
* Diffrent location related fucntions added
*/

class LocationFetcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationPermissionGranted: false,
      isBackgroundLocation : false,
      latitude: 0.0,
      longitude: 0.0,
      isInitialLoad: true
    };
    this.locationListner = null
    this.previousTimeStamp = new Date()
    if (Platform.OS === "android") {
      this.checkLocationPermissionsAndroid();
    } else {
      // this.checkLocationForIos();
    }
    // this.RNFS = require('react-native-fs');
  }

  /**
* To remove the location update from the memory
*/
  removeLocationUpdate() {
    if (Platform.OS == 'android') {
      AndroidGeolocation.stopLocationUpdates();
    }
  }
  /**
* To request location permission for ios
*/
  checkLocationForIos = async () => {
    const granted = await requestMultiple([
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, //Remove in prod
      // PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE, //Remove in prod
    ]).then((statuses) => {
      let status =
        statuses[
        (PERMISSIONS.IOS.LOCATION_ALWAYS,
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        ];
      if (status === "granted") {
        const result = locationChanged.start();
        const significantLocationChange = (event) => {
          // this.props.getLocation(event.coords)
          let locationLocalObj = {
            latitude: event.coords.latitude,
            longitude: event.coords.longitude,
            // speed: Number(e.speed * 3.6),
            // speedCalculated: speed,
            // timeStamp: e.timeStamp,
          };
          let difference = (new Date().getTime() - this.previousTimeStamp.getTime()) / 1000
          this.state.isInitialLoad = this.props.isInitialLoad
          if (difference > 20 || this.state.isInitialLoad) {
            this.state.isInitialLoad = false
            this.previousTimeStamp = new Date()
            this.processLocation(locationLocalObj)
          }
        };
        const subscription = locationChangedEmitter.addListener(
          "significantLocationChange",
          significantLocationChange
        );
        this.locationListner = subscription
      }
    });
  };

  /**
* To request location permission for android
*/

checkLocationPermissionsAndroid = async () => {
  try {
    const statuses = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION, // Request background location permission
    ]);

    const fineLocationStatus = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
    const coarseLocationStatus = statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION];
    const backgroundLocationStatus = statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION];

    console.log("Fine Location", fineLocationStatus);
    console.log("Coarse Location", coarseLocationStatus);
    console.log("Background Location", backgroundLocationStatus);

    if (fineLocationStatus === RESULTS.GRANTED) {
      AndroidGeolocation.startLocationUpdates();
      this.setState({
        locationPermissionGranted: true,
      });

      if (backgroundLocationStatus === RESULTS.BLOCKED || backgroundLocationStatus === RESULTS.DENIED) {
        this.removeListeners();
        this.removeLocationUpdate();
        this.setState({ isBackgroundLocation: true });
      }
      console.log("Location Granted")
    } else {
      console.log("Location permission not granted");
    }
  } catch (error) {
    console.error("Error checking location permissions", error);
  }
};

  /**
* Called when component loads to memory
*/

  componentDidMount() {
    this.fetchLocationDetails();
  }


  /**
   * Method to fetch location details
   */

  fetchLocationDetails = () => {
    if (Platform.OS === "android") {
      this.locationUpdateForAndroid();
    } else {
      this.checkLocationForIos();
    }
  };


  /**
   * Method to get location details for android
   */

  locationUpdateForAndroid = async () => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.AndroidGeolocation
    );
      

    let isAuthenitcated = await getData(LocalDBItems.isUserAuthenticated)
    
    if(isAuthenitcated) {
      var watchId = Geolocation.getCurrentPosition(
         async (e) => {
          //this.setState({ location: position });
          console.log(e);
      

          let locationLocalObj = {
            latitude: e.coords.latitude,
            longitude: e.coords.longitude,
            speed: Number(e.coords.speed * 3.6),
            // speedCalculated: speed,
            timeStamp: e.timestamp,
          };

          if (this.state.isInitialLoad) {
            await storeData(LocalDBItems.location, locationLocalObj)
          }
          let difference = (new Date().getTime() - this.previousTimeStamp.getTime()) / 1000
          let previusLocation = await getData(LocalDBItems.location)
          let distance = 0
          if (previusLocation) {
            distance = UtilityHelper.calcDistance(previusLocation, locationLocalObj)
          }
  
          let isinRadiusObj = await this.isLocationInRadius()
          if (this.props.isInRadiusOrNot) {
            this.props.isInRadiusOrNot(isinRadiusObj)
          }
          if ((distance > 10) || this.state.isInitialLoad) {
            console.log('***  There is a change of 10 meters  ***');
            if ("getLocationForTracking" in this.props) {
              this.props.getLocationForTracking(locationLocalObj)
              this.saveLocation(locationLocalObj)
            }
          }
  
          if ((difference > 60 && distance > 250) || this.state.isInitialLoad) {
            await storeData(LocalDBItems.location, locationLocalObj)
            this.state.isInitialLoad = false
            this.previousTimeStamp = new Date()
            this.processLocation(locationLocalObj)
          }
        },
        (error) => {
          console.log(error);
        },
        { enableHighAccuracy: true, distanceFilter: 0, interval: 5000, fastestInterval: 2000 }
      );
  


    }
     
   

 
    this.locationListner = eventEmitter.addListener("significantLocationChange", async (e) => {
    
    
      let locationLocalObj = {
        latitude: e.latitude,
        longitude: e.longitude,
        speed: Number(e.speed * 3.6),
        // speedCalculated: speed,
        timeStamp: e.timeStamp,
      };
      
      let isAuthenitcated = await getData(LocalDBItems.isUserAuthenticated)

      if (isAuthenitcated == true) {

        if (this.state.isInitialLoad) {
          await storeData(LocalDBItems.location, locationLocalObj)
        }
        let difference = (new Date().getTime() - this.previousTimeStamp.getTime()) / 1000
        let previusLocation = await getData(LocalDBItems.location)
        let distance = 0
        if (previusLocation) {
          distance = UtilityHelper.calcDistance(previusLocation, locationLocalObj)
        }

        let isinRadiusObj = await this.isLocationInRadius()
        if (this.props.isInRadiusOrNot) {
          this.props.isInRadiusOrNot(isinRadiusObj)
        }
        if ((distance > 10) || this.state.isInitialLoad) {
          console.log('***  There is a change of 10 meters  ***');
          if ("getLocationForTracking" in this.props) {
            this.props.getLocationForTracking(locationLocalObj)
            this.saveLocation(locationLocalObj)
          }
        }

        if ((difference > 60 && distance > 250) || this.state.isInitialLoad) {
          await storeData(LocalDBItems.location, locationLocalObj)
          this.state.isInitialLoad = false
          this.previousTimeStamp = new Date()
          this.processLocation(locationLocalObj)
        }
      }
    });
  };

  /**
 * Method to remove location listners
 */
  removeListners = () => {
    this.locationListner.remove()
  }

  /**
* Method to add location listners
*/
  addListnerForFetching() {
    this.locationListner.remove()
    this.locationUpdateForAndroid()
  }

  /**
* Method to process location
* First location lastest coordinate will be stored to memory
* Then props function from parent class wiil be called
*/
  processLocation = async (location) => {
    await storeData(LocalDBItems.location, location)
    if (this.props.getLocation) {
      this.props.getLocation(location)
    }
  }

  /**
* Method to check the location is in radius
* Fetch the origanization details from storage
* fetch the project details from the storage
* Fetch the check in details of the user. 
* Find out the centeer point and radius information from the function findCenterPontAndRadius
* Fetch the lastes location objct from teh DB
* Calculated whether the user is in radous or not
*/
  isLocationInRadius = async (location, centerPont) => {
    const organisationDetails = await getData(LocalDBItems.organizationDetails);
    const projectDetails = await getData(LocalDBItems.selectedProjectDetails);

    let checkinInfo = await getData(LocalDBItems.checkInInfo)

    let positionInfo = await this.findCenterPontAndRadius()

    let locationObjFromDb = await getData(LocalDBItems.location)

    let locationObj = { latitude: locationObjFromDb.latitude, longitude: locationObjFromDb.longitude }

    let centerPontobj = positionInfo.centerPontobj

    let radius = positionInfo.radius

    // console.log("projectDetails",projectDetails);
    // console.log("CheckinINFO",organisationDetails);
    // console.log("PositionINFO",positionInfo);
    // console.log("locationObjFromDb",locationObjFromDb);
    // console.log("locationObj",locationObj);

    if (checkinInfo && checkinInfo.isProjectCheckin === true) {

      if (projectDetails && projectDetails.entityLocation != null) {
        return UtilityHelper.isLocationWithinTheRadius(locationObj, centerPontobj, radius)
      }
      return true
    }

    if (organisationDetails && organisationDetails.entityLocation) {
      let isInRadius = UtilityHelper.isLocationWithinTheRadius(locationObj, centerPontobj, radius)
      return isInRadius
    }
    return true
  }

  /**
 * Method to find the center point and radius
 * Fetch the origanization details from storage
 * fetch the project details from the storage
 * check the isProjectCheckin flag 
 * findout the radius from the entityLocation
 * return the object
 */

  findCenterPontAndRadius = async () => {
    const organisationDetails = await getData(LocalDBItems.organizationDetails);
    const projectDetails = await getData(LocalDBItems.selectedProjectDetails);

    let checkinInfo = await getData(LocalDBItems.checkInInfo)

    let centerPontobj = { latitude: 0.0, longitude: 0.0 }
    let radius = 200
    let objct = {
      centerPontobj: centerPontobj,
      radius: radius
    }

    if (checkinInfo && checkinInfo.isProjectCheckin === true) {

      if (projectDetails && projectDetails.entityLocation != null) {
        if (projectDetails.entityLocation.radius) {
          radius = parseFloat(projectDetails.entityLocation.radius == "" ? '200' : projectDetails.entityLocation.radius)
        }
        objct = {
          centerPontobj: { latitude: parseFloat(projectDetails.entityLocation.lat), longitude: parseFloat(projectDetails.entityLocation.lang) },
          radius: radius
        }

        return objct
      }
    }
    if (organisationDetails && organisationDetails.entityLocation) {
      let locationObjFromDb = await getData(LocalDBItems.location)
      let locationObj = { latitude: locationObjFromDb.latitude, longitude: locationObjFromDb.longitude }
      let centerPontobj = { latitude: parseFloat(organisationDetails.entityLocation.lat), longitude: parseFloat(organisationDetails.entityLocation.lang) }
      if (organisationDetails.entityLocationRadius) {
        radius = parseFloat(organisationDetails.entityLocationRadius.radius == "" ? '200' : organisationDetails.entityLocationRadius.radius)
      }
      objct = {
        centerPontobj: centerPontobj,
        radius: radius
      }
      return objct
    }
    return objct
  }
  /**
  * Method to save location to the db
  */
  saveLocation = async (location) => {
    let previusLocation = await getData(LocalDBItems.location)
    let previusLocationArray = await getData(LocalDBItems.locationArray)
    let locationArray = previusLocationArray ? previusLocationArray : []

    if (previusLocation) {
      locationArray.push(location)
      await this.storeDataToDb(location, locationArray)

      // } 
    }
    else {
      locationArray.push(location)
      await this.storeDataToDb(location, locationArray)

    }
  }
  /**
 * Method to save location to the db
 */
  storeDataToDb = async (location, locationArray,) => {
    await storeData(LocalDBItems.locationArray, locationArray)
  }

  /**
   * Method to render view
   */
  render() {
    return null;
  }
}
export default LocationFetcher;