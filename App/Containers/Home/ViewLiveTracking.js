import * as React from 'react';
import { Text, View, TouchableOpacity, Dimensions, DeviceEventEmitter, Modal } from 'react-native';
import styles from './style';
import { Helpers } from '../../Theme';
import LinearGradient from 'react-native-linear-gradient';
import { apiService } from '../../Services/ApiService'
import { Endpoint, BaseUrl } from '../../Services/Endpoint'
import { getData, LocalDBItems, storeData } from '../../Services/LocalStorage'
import IconImage from 'react-native-vector-icons/FontAwesome';
import MapForPolyline from '../../Components/MapClassVIew'
import Geolocation from 'react-native-geolocation-service';
import UUIDGenerator from 'react-native-uuid-generator';
import { getPathLength } from 'geolib';
import {debounce} from 'lodash';
// import MapForPolyline from '../../Components/MapClassVIew';

const windowHeight = Dimensions.get('window').height;
/**
 * Class to view the live location of the user
 * Will draw path travelled by the user in the google map
 * initliaze the location object
 */
export default class ViewLiveTrackingScreen  extends  React.Component {

  constructor(props) {
    super(props)
    this.state = {
      locationTrackingCOrindates: [],
      checkOutDetails: null,
    },
      this.cordinateObj = {
        latitude: 9.947236,
        longitude: 76.347843
      }
    this.previousTimeStamp = new Date()
    this.locationInfoArray = []
    this.handleAPI = debounce(() => this.locationTrackingNewApi(null, false), 2000)
  }

  /**
* Method loads the component in the  memory
* Geolocation service watch position method added to track the location of the user
* Fetch the isLocationTrackingNeeded bool from DB indorder to check the location tracking needed or not
* If its needed then handle tracking fucntion will be called
* Set up different location tracking parameters for the geo location
* Enabled high accuracy
* distance filter added
* time interval added
*/
  componentDidMount = async () => {
    const checkoutDetails = await getData(LocalDBItems.CHECK_IN_OUT_DETAILS);
    this.setState({checkOutDetails: checkoutDetails})
    this.watchID = Geolocation.watchPosition(
      async (position) => {
        let location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        this.cordinateObj = location
        let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded)
        if (isTracking) {
           this.handleLocationTracking(location)
          // this.handleLocationTracking(location)
        }
      },
      (error) => {
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        distanceFilter: 30,
        interval: 2000,
        fastestInterval: 1000,
      },
    );
  }
  /**
 * Method handle the location tracking
 * Fetch the current location array from the DB
 * Append the new location to the locationInfoArray
 * Set the location array to plot it on the map
 * syncLocationToApi method called to sync the location to
 */


  handleLocationTracking = async (location) => {
    console.log('86-------->',location)
    
    let locationArray = await getData(LocalDBItems.locationArrayForTracing)
    if(locationArray==null){
      console.log("shithole");
      locationArray=[]
    }
    locationArray.push(location)
    this.locationInfoArray.push(location)
    await storeData(LocalDBItems.locationArrayForTracing, locationArray)
    if (this.mapRef) {
      this.mapRef.trackLocationOnMap(location)
    }
    this.syncLocationToApi()
  }

  /**
* Method to sync  the location tracking to the server
* Checks if location tracking needed
* Check the time difference
* If its greater than 2 mins then location will be send to the server
*/

  syncLocationToApi = async () => {
    // if (this.state.locationFetcherNeeded){
    let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded)
    if (isTracking) {
      let difference = (new Date().getTime() - this.previousTimeStamp.getTime()) / 1000
      if (difference > 1 * 45) {
        console.log('110--------location difference', difference)
       this.handleAPI()
      }
    }

  }

  /**
* Method to save the location tracking to the server
* Fetch the location array
* Generate random uuid
* Fetch the location info
* Create new location object via map fucntion
* crate the check in dict of the user
* Post the parameters to the server
*/

  async locationTrackingNewApi(checkInInfo, isTripEnd = false) {
    console.log('isTripEnd', isTripEnd)
    const { checkOutDetails } = this.state;
    let locationArray = this.locationInfoArray //await getData(LocalDBItems.locationArrayForTracing)
    if (locationArray != undefined) {
      let groupUUID = await this.getRandomUUID()

      // let groupUUID = 
      let id = await UUIDGenerator.getRandomUUID()
      let checkoutLocationInfo = await getData(LocalDBItems.checkOutLocationInfo)
      let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded)
      let distance = getPathLength(locationArray) / 1000

      console.log('distance', distance)
      let date = new Date()
      const newLocationArrayMaped = locationArray.map((locationItem) => {
        return {
          groupid: groupUUID,
          lat: locationItem.latitude,
          lang: locationItem.longitude,
          created_date: date
        };
      });

      const employeeDetails = await getData(LocalDBItems.employeeDetails);

       let checkInDict = {}
       if (checkInInfo) {
         checkInDict =  checkInInfo
       } else {
        checkInDict = await this.props.checkinDict
       }

    //  let checkInDict = await this.props.parentRef.getCheckinDict()

      let dict = {
        "id": id,
        "empid": employeeDetails.id,
        "groupid": groupUUID,
        "org_id": employeeDetails.org_id,
        "distance": distance,
        "checkout_formatted_address": checkoutLocationInfo.formatted_address,
        // "checkout_geo_address": this.cordinateObj.latitude,
        "checkout_lat": checkoutLocationInfo.latitude,
        "checkout_lang": checkoutLocationInfo.longitude,
        "checkout_street_number": checkoutLocationInfo.street_number,
        "checkout_route": checkoutLocationInfo.route,
        "checkout_locality": checkoutLocationInfo.locality,
        "checkout_administrative_area_level_2": checkoutLocationInfo.administrative_area_level_2,
        "checkout_administrative_area_level_1": checkoutLocationInfo.administrative_area_level_1,
        "checkout_project": checkOutDetails.checkin_out_project,
        "checkout_jobType": checkOutDetails.checkin_out_jobType,
        "checkin_formatted_address": "",
        "travelClaimTrack": newLocationArrayMaped,
        "created_date": date,
        "createdby":employeeDetails.full_name,
        "is_trip_end": isTripEnd,
         ...checkInDict
      }
      console.log('----dict', dict)
      const requestObj = { endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_TRAVEL_CLAIM, type: 'post', params: dict }
      const apiResponseData = await apiService(requestObj)

      if (apiResponseData.status == "200") {
        this.previousTimeStamp = new Date()
        this.locationInfoArray = []
      }
    }
    else {
    }
  }

  /**
   * Method to ge the random uuid
   */

  getRandomUUID = async () => {
    let udid = await getData(LocalDBItems.groupUUID)
    if (udid == "" || udid == null) {
      udid = await UUIDGenerator.getRandomUUID()
      await storeData(LocalDBItems.groupUUID, udid)
    }
    return udid
  }

  // getCheckinDict = async () => {
  //   let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded);

  //   let dict = {};
  //   if (isTracking) {
  //     dict = {
  //       checkin_lat: 0.0,
  //       checkin_lang: 0.0,
  //       checkin_street_number: "",
  //       checkin_route: "",
  //       checkin_locality: "",
  //       checkin_administrative_area_level_2: "",
  //       checkin_administrative_area_level_1: "",
  //     };
  //   } else {
  //     let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
  //     if (!isFetchedGeoCorderObj) {
  //       Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
  //       this.setState({ loading: false });
  //     }
  //     dict = {
  //       checkin_formatted_address: this.currentLocationObj.formatted_address,
  //       // "checkout_geo_address": this.cordinateObj.latitude,
  //       checkin_lat: this.cordinateObj.latitude,
  //       checkin_lang: this.cordinateObj.longitude,
  //       checkin_street_number: this.currentLocationObj.street_number,
  //       checkin_route: this.currentLocationObj.route,
  //       checkin_locality: this.currentLocationObj.locality,
  //       checkin_administrative_area_level_2: this.currentLocationObj
  //         .administrative_area_level_2,
  //       checkin_administrative_area_level_1: this.currentLocationObj
  //         .administrative_area_level_1,
  //     };
  //   }
  //   return dict;
  // };

  /**
* Method to  fire the location object to the listner classes
*/

  getLocationForTracking = async (locationObj) => {
    this.cordinateObj.latitude = locationObj.latitude
    this.cordinateObj.longitude = locationObj.longitude
    DeviceEventEmitter.emit('locationEvent', locationObj);



  }

  /**
* Method to  render the view
*/
  render() {
    return (
      <Modal animationType="slide"
        transparent={true}
        visible={this.props.showTrackingModal}
      >
        <View style={[Helpers.fillCol, styles.container]}>
          {/* <LocationFetcher ref={(ref) => { this.locationFetcher = ref; }} getLocationForTracking={(location) => this.getLocationForTracking(location)}  isInitialLoad={true} /> */}
          <LinearGradient
            start={{ x: 0.5, y: 1.0 }} end={{ x: 0.0, y: 0.25 }}
            colors={['#f6976e', '#fe717f', '#fa8576',]} style={styles.navigationLinearGradient}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  flex: 0.75,
                  width: 60,
                  marginHorizontal: 24,
                  marginTop: 40,
                  backgroundColor: "transparent",
                }}
                onPress={() =>
                  //this.props.navigation.goBack()
                  this.props.hideLiveTracking()
                }
              >
                <IconImage name="angle-left" size={30} color="white" />
              </TouchableOpacity>
              <View style={{ marginTop: 40, flex: 1, alignSelf: "center" }}>
                <Text style={styles.titleText}>Live Trip</Text>
              </View>
              <View style={{ marginTop: 40, flex: 1 }}></View>
            </View>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <MapForPolyline ref={(mapRef) => this.mapRef = mapRef} coordinate={this.cordinateObj} height={windowHeight * 0.8} />
          </View>
        </View>
      </Modal>

    )
  }
}