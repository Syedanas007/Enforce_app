import * as React from "react";
import {
  Platform,
  Text,
  View,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Image,
  DeviceEventEmitter,
  Linking,
  Alert,
} from "react-native";
import styles from "./style";
import { Helpers, Images, Metrics, Colors } from "../../Theme";
import { strings } from "../../Assets/Locales/i18n";
import LinearGradient from "react-native-linear-gradient";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import * as NavigationService from "../../Services/NavigationService";
import { any, string } from "prop-types";
import { apiService } from "../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../Services/Endpoint";
import { Marker } from "react-native-maps";
import * as Progress from "react-native-progress";
import { searchFaceImages } from "../../Services/AWSService";
import CustomPopUpModal from "../../Components/CustomPopup";
import {
  getData,
  LocalDBItems,
  storeData,
  wipeData,
} from "../../Services/LocalStorage";
import Loader from "../../Components/Loader";
import textDis from "../../Components/ErrorAlertPopup";
import moment from "moment";
import GeoCoder from "../../Components/GeoCoder";
import LocationFetcher from "../LocationModule/index";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconImage from "react-native-vector-icons/FontAwesome";
import Icons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-simple-toast";
import Icones from "react-native-vector-icons/FontAwesome";
import CustomModal from "../../Components/CustomModal";
import CustomPopUp from "../../Components/CustomRadiusDropDownPopUp";
import AlertPopup from "../../Components/AlertPopup";
import ErrorAlertPopup from "../../Components/ErrorAlertPopup";
import UUIDGenerator from "react-native-uuid-generator";
import haversine from "haversine";
import { RNCamera } from "react-native-camera";
import ViewLiveTrackingScreen from "../Home/ViewLiveTracking";
import Geolocation from "react-native-geolocation-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { log } from "react-native-reanimated";
import { getUUID } from "../../helper";

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 29.95539;
const LONGITUDE = 78.07513;
var counter = 0;
var counter_face_data = 0;
var checkout_counter = 0;

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      points: 200,
      timer_error: true,
      progressBarPercentage: 0,
      checkInData: null,
      breakInData: null,
      isPaused: false,
      isBreak: false,
      progress: 0,
      isStarted: false,
      loading: false,
      isLoading: true,
      stopWatchCounter: "00:00",
      stopWatchCounterBreakIn: "00:00",
      inSeconds: 0,
      currentDate: moment(new Date()).format("MM/DD/YYYY hh:mm:ss A"),
      intervalId: 0,
      locationDetails: null,
      isInRadiusModalShow: false,
      showAlertPopup: false,
      Mobile_ID: "",
      UUID: "",
      isForceCheckoutPopUp: false,
      isCheckOutPopup: false,
      locationFetcherNeeded: false,
      showLiveTrackingButton: false,
      getGroupMembersList: [],
      isGroupCheckIn: false,
      isDisabled: true,
      groupMemeber: {},
      groupMemberInfoArray: [],
      showTrackingModal: false,
      in_latitude: 0,
      in_longitude: 0,
      location_value: "",
      location_value_lat: "",
      location_value_lon: "",
      isVerifyFace: false,
      flash: "off",
      zoom: 0,
      autoFocus: "on",
      depth: 0,
      type: "front",
      whiteBalance: "auto",
      ratio: "16:9",
      canDetectFaces: true,
      showAlertIdNoFace: false,
      faceReportPopup: false,
      isVerified: false,
      isForcecheckout: false,
    };
    this.parentRef = React.createRef();
    this.previousTimeStamp = new Date();
    this.locationInfoArray = [];
    this.isWorkEnded = false;
    this.isCheckinForLocation = false;
    this.isInitalLoad = true;

    this.intervalId = any;
    this.employeeDetails = {};
    this.timerCheckIn = null;
    this.timerBreakIn = null;
    this.timerStopCounter = 0;
    this.showTimerForAutoCheckOut = null;
    this.timerStopForBreakCounter = 0;
    this.cordinateObj = {
      latitude: 25.2048,
      longitude: 55.2708,
    };
    this.geoCoder = new GeoCoder();
    this.currentLocationObj = {
      formatted_address: "",
      street_number: "",
      country: "",
      administrative_area_level_1: "",
      administrative_area_level_2: "",
      locality: "",
      route: "",
      postal_code: "",
      latitude: 0.0,
      longitude: 0.0,
    };
    this.previousTimeStamp = new Date();
    this.groupUUID = null;
    this.isTripEnd = false;
    this.checkInDataValue = null;
    this.isCheckinAdmin = null;
    this.modalizeRef = React.createRef();
    this.count = -1;
    this.faceDetectedOrNot = false;
    this.timerCamera = 2;
    this.timer = null;
  }

  /**
   * Get employee details from the store
   * Get last check-in details by employee ID
   */
  async componentDidMount() {
    try {
      await this.getEmployeeDetails();
      await this.lastCheckinByEmpID(true);
      console.log("lastCheckinByEmpID");

      // Initialize GeoCoder
      this.geoCoder.initiaLizeGeoCoder();
      console.log("initiaLizeGeoCoder");

      // Generate UUID
      this.UUID = await getUUID();
      counter_face_data = 0;
      console.log(this.UUID, "UUID which we need");

      // Handle navigation blur and focus events
      this._unsubscribeBlur = this.props.navigation.addListener("blur", () => {
        if (this.locationFetcher != null) {
          this.setState({ locationFetcherNeeded: false });
        }
      });

      this._unsubscribeFocus = this.props.navigation.addListener("focus", () => {
        this.setState({ locationFetcherNeeded: true }, () => {
          this.isInitalLoad = false;
        });
      });

      // Check if location tracking is needed
      await this.getLocationTrackingNeeded();
      checkout_counter = 0;

      // Log after all async tasks have finished
      console.log("Component mounted and all async tasks completed");
    } catch (error) {
      console.error("Error in componentDidMount:", error);
    }
  }

  componentWillUnmount() {
    if (this._unsubscribeBlur) this._unsubscribeBlur();
    if (this._unsubscribeFocus) this._unsubscribeFocus();

    clearInterval(this.timerCheckIn);
    clearInterval(this.timerBreakIn);
  }

  getLocationTrackingNeeded = async () => {
    let isLiveTracking = await getData(LocalDBItems.isLocationTrackingNeeded);
    this.setState({ showLiveTrackingButton: !!isLiveTracking });
  };


  TechicalErrorReport = async () => {
    const employeDetails = await getData(LocalDBItems.employeeDetails);
    let params = { orgID: employeDetails.org_id }
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GETALL_APPROVAL_DATA,
      type: "patch",
      params: params,
    }
    const apiResponseData = await apiService(requestObj);
    const emp_role_id = employeDetails.role_id;
    const section_id_data = apiResponseData.filter(item => item.section_id === '8a55082f-5185-4d28-9098-4f268cb47d51' && item.role_id === emp_role_id);
    const approver1_id = section_id_data[0].approver1_roleId;
    const approver2_id = section_id_data[0].approver2_roleId;
    console.log("approval data", approver1_id, approver2_id)

    let params2 = {
      id: employeDetails.id
    };
    const requestObj2 = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_TIMESHEET_LISTBY_EMPLOYEEID,
      type: "post",
      params: params2,
    }
    const apiResponseData2 = await apiService(requestObj2);

    const lastest_time = apiResponseData2[0]["timesheetDataModels"][0]["id"];
    console.log("Lastest_time", lastest_time);
    console.log(this.location_value_lat, this.location_value_lon)
    let params3 = {
      org_id: employeDetails.org_id,
      type: "checkout",
      empid: employeDetails.id,
      timesheet_id: lastest_time,
      ondate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      check_in: null,
      checkin_lat: null,
      checkin_lang: null,
      check_out: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      checkout_lat: this.location_value_lat,
      checkout_lang: this.location_value_lon,
      levelone_roleId: approver1_id,
      isapproved_levelone: false,
      leveltwo_roleId: approver2_id,
      isapproved_leveltwo: false,
      reason_name: "Technical Error Location Fetching",
      status: "pending",
      created_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      createdby: employeDetails.id,
      modified_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      modifiedby: employeDetails.id,
      is_deleted: false,
      is_app_check_In: true
    }
    console.log(params3)
    const requestObj3 = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FORCE_CHECKIN_REQUEST,
      type: "post",
      params: params3,
    }
    const apiResponseData3 = await apiService(requestObj3);
    console.log(apiResponseData3);

  }

  getdataTechincal = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const params = {
      org_id: employeeDetails.org_id,
      eventName: "Techincal Error In location",
      emp_id: employeeDetails.id,
      emp_Name: employeeDetails.full_name,
      createdDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      modifiedDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_FORCE_TIMESHEET_CHECKIN,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData.status == "200") {
      this.Mobile_ID = (apiResponseData.desc);
      this.TechicalErrorReport();
      if (this.timer != null) {
        clearInterval(this.timer);
      }
    }
    clearInterval(this.timerCheckIn);
    clearInterval(this.timerBreakIn);
    clearInterval(this.showTimerForAutoCheckOut);
    this.timerStopCounter = 0;
    this.timerStopForBreakCounter = 0;
    this.setState({
      breakInData: null,
      checkInData: null,
      isStarted: false,
      isBreak: false,
      stopWatchCounter: "00:00",
      stopWatchCounterBreakIn: "00:00",
      loading: false,
      progressBarPercentage: 0,
      showAlertPopup: false,
      isCheckOutPopup: false,
    });
    console.log(params);
    this.forceCheckOut();
    const full_name = `${employeeDetails.full_name} Force checked Out successfully`;
    Toast.show(full_name, Toast.LONG);

  }

  forcecheckoutreport = async () => {
    const value = await AsyncStorage.getItem("newNameKey")
    const date = await AsyncStorage.getItem("forcetime")
    console.log(date, "forcecheckoutreport");
    if (value != null) {
      console.log(value);
      const employeDetails = await getData(LocalDBItems.employeeDetails);
      let params = { orgID: employeDetails.org_id }
      const requestObj = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.GETALL_APPROVAL_DATA,
        type: "patch",
        params: params,
      }
      const apiResponseData = await apiService(requestObj);
      const emp_role_id = employeDetails.role_id;
      const section_id_data = apiResponseData.filter(item => item.section_id === '8a55082f-5185-4d28-9098-4f268cb47d51' && item.role_id === emp_role_id);
      // approver1_id = section_id_data[0].approver1_roleId;
      // approver2_id = section_id_data[0].approver2_roleId;
      // console.log("approval data" , approver1_id,approver2_id)

      let params2 = {
        id: employeDetails.id
      };
      const requestObj2 = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_TIMESHEET_LISTBY_EMPLOYEEID,
        type: "post",
        params: params2,
      }
      const apiResponseData2 = await apiService(requestObj2);

      const lastest_time = apiResponseData2[0]["timesheetDataModels"][0]["id"];
      console.log("Lastest_time", lastest_time)

      let params3 = {
        org_id: employeDetails.org_id,
        refrence_id: this.Mobile_ID,
        type: "checkout",
        empid: employeDetails.id,
        timesheet_id: lastest_time,
        ondate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
        check_in: null,
        checkin_lat: null,
        checkin_lang: null,
        check_out: moment(new Date()).utc(true).format("MM/DD/YYYY ") + date,
        checkout_lat: this.currentLocationObj.latitude,
        checkout_lang: this.currentLocationObj.longitude,
        levelone_roleId: section_id_data[0].approver1_roleId,
        isapproved_levelone: false,
        leveltwo_roleId: section_id_data[0].approver2_roleId,
        isapproved_leveltwo: false,
        reason_name: value,
        status: "pending",
        created_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
        createdby: employeDetails.id,
        modified_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
        modifiedby: employeDetails.id,
        is_deleted: false,
        is_app_check_In: true
      }
      console.log("Data is here", params)
      const requestObj3 = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.FORCE_CHECKIN_REQUEST,
        type: "post",
        params: params3,
      }
      const apiResponseData3 = await apiService(requestObj3);
      console.log("Fire", apiResponseData3);
      this.forceCheckOut(value);
    }
  }


  getdata = async () => {
    try {
      const value = await AsyncStorage.getItem("newNameKey")
      if (value != null) {
        console.log(value);
        const employeeDetails = await getData(LocalDBItems.employeeDetails);
        const params = {
          org_id: employeeDetails.org_id,
          eventName: value,
          emp_id: employeeDetails.id,
          emp_Name: employeeDetails.full_name,
          createdDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
          modifiedDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
        };
        const requestObj = {
          endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_FORCE_TIMESHEET_CHECKIN,
          type: "post",
          params: params,
        };
        const apiResponseData = await apiService(requestObj);
        if (apiResponseData.status == "200") {
          this.Mobile_ID = (apiResponseData.desc);
          this.forcecheckoutreport();
          if (this.timer != null) {
            clearInterval(this.timer);
          }
        }
      }
    } catch (error) {
      console.log("Errorgetdata")
    }
  }
  /**
   * After face verification, user navigates to home screen and need to refresh with check in data
   */
  refresh = async () => {
    // if(isForcecheckout = true){
    //   const employeeDetails = await getData(LocalDBItems.employeeDetails);
    //   const full_name = `${employeeDetails.full_name} Force checked in successfully`;
    //   Toast.show(full_name, Toast.LONG);
    // }
    // else {
    //   console.log("forceeroor",this.state.isForceCheckIn)
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    // const full_name = `${employeeDetails.full_name} checked in successfully`;
    // Toast.show(full_name, Toast.LONG);
    let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
    if (!isFetchedGeoCorderObj) {
      // Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
    }
    this.lastCheckinByEmpID(true);
    let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded);
    if (isTracking) {
      await storeData(LocalDBItems.isLocationTrackingNeeded, false);
      this.isTripEnd = true;
      await this.locationTrackingNewApi(null, this.isTripEnd);
      await this.resetTracking();
    }
  };

  onGoBackToPreviousCheckOut = async () => {
    counter++;
    console.log(counter);
    this.setState({
      showAlertPopup: false,
      isCheckOutPopup: false,
    });
    // this.props.navigation.goBack();
  }
  /**
   * Get employee details
   */
  getEmployeeDetails = async () => {
    this.employeeDetails = await getData(LocalDBItems.employeeDetails);
    const userDetails = await getData(LocalDBItems.userDetails);
  };
  /**
   * Navigate to check in screen
   */
  navigateToCheckInScreen = async () => {
    NavigationService.navigate("CheckInScreen", {
      onGoBack: () => this.refresh(),
      locationDetails: this.state.locationDetails,
      cordinateObj: this.cordinateObj,
    });
  };

  location_feching = async () => {
    Geolocation.getCurrentPosition(location_info => this.location_value = location_info)
    setTimeout(() => {
      this.location_value_lat = this.location_value.coords.latitude;
      this.location_value_lon = this.location_value.coords.longitude;
      console.log("LAT", this.location_value_lat);
      console.log("LON", this.location_value_lon);
      this.getdataTechincal();
    }, 1000);
  }

  convertTimeToUTC = (hour, minute, period) => {
    const convertedHour = period === 'AM' ? (hour % 12) : (hour % 12 + 12);
    const now = moment.utc().startOf('day');
    const targetTime = now.set({ hour: convertedHour, minute, second: 0 });

    if (targetTime.isBefore(moment.utc())) {
      targetTime.add(1, 'day');
    }

    return targetTime.format('MM/DD/YYYY HH:mm:ss');
  };
  forceCheckOut = async (isEndOfWork = false) => {
    this.setState({ loading: true });
    console.log('Forcecehckoutfunction');
    console.log('post checkout', this.currentLocationObj);
  
    try {
      const value = await AsyncStorage.getItem("newNameKey");
      const userId = await getData(LocalDBItems.employeeDetails);
      const checkInDetails = await getData(LocalDBItems.CHECK_IN_OUT_DETAILS);
      const checkIsInRadius = await this.locationFetcher.isLocationInRadius();
  
  
      let formattedTime;
      if (value === 'Forgot to Checkout') {
        const date = await AsyncStorage.getItem("forcetime");
        formattedTime = moment().format("MM/DD/YYYY") + ' ' + date;
      } else {
        formattedTime = moment().format("MM/DD/YYYY hh:mm A");
      }
  
      console.log('Formatted Time:', formattedTime);
  
      // Ensure formattedTime is the correct format for the API
      const forceCheckoutTimeStr = moment(formattedTime, "MM/DD/YYYY hh:mm A").format("MM/DD/YYYY hh:mm A");
      console.log('Formatted forceCheckoutTimeStr:', forceCheckoutTimeStr);
  
      // Ensure the formatted time string is correctly parsed and set
      if (!forceCheckoutTimeStr) {
        throw new Error('Invalid forceCheckoutTime');
      }
  
      const params = {
        team_member_empid: this.checkInDataValue.empid,
        groupid: this.checkInDataValue.groupid,
        check_out: forceCheckoutTimeStr, // Pass the formatted string directly
        is_inrange: checkIsInRadius || false,
        modifiedby: userId.full_name,
        checkout_tag_id: this.UUID,
        is_app_check_In: true,
        TimesheetCurrentLocationViewModel: {
          formatted_address: this.currentLocationObj.formatted_address,
          lat: this.cordinateObj.latitude,
          lang: this.cordinateObj.longitude,
          street_number: this.currentLocationObj.street_number,
          route: this.currentLocationObj.route,
          locality: this.currentLocationObj.locality,
          administrative_area_level_2: this.currentLocationObj.administrative_area_level_2,
          administrative_area_level_1: this.currentLocationObj.administrative_area_level_1,
          postal_code: this.currentLocationObj.postal_code,
          country: this.currentLocationObj.country,
        },
      };
  
      console.log("Params:", params);
  
      await storeData(LocalDBItems.checkOutLocationInfo, this.currentLocationObj);
  
      const requestObj = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.FORCE_TIMESHEET_CHECKOUT,
        type: "post",
        params: params,
      };
  
      console.log("Making API request...");
      const apiResponseData = await apiService(requestObj);
  
      setTimeout(() => {
        this.setState({
          loading: false,
          breakInData: null,
          checkInData: null,
          isStarted: false,
          isBreak: false,
          stopWatchCounter: "00:00",
          stopWatchCounterBreakIn: "00:00",
          progressBarPercentage: 0,
          showAlertPopup: false,
          isCheckOutPopup: false,
        });
  
        console.log("API Response:", apiResponseData);
  
        if (apiResponseData.status === "200") {
          if (isEndOfWork) {
            this.timer_error = false;
            this.isWorkEnded = true;
            this.isCheckinForLocation = false;
            storeData(LocalDBItems.isEmployeeLocationTrack, false);
            storeData(LocalDBItems.CHECK_IN_OUT_DETAILS, checkInDetails);
            this.locationFetcher.removeLocationUpdate();
          } else {
            this.startTracking(); // For checkout
          }
  
          clearInterval(this.timerCheckIn);
          clearInterval(this.timerBreakIn);
          clearInterval(this.showTimerForAutoCheckOut);
          this.timerStopCounter = 0;
          this.timerStopForBreakCounter = 0;
  
          const full_name = `${userId.full_name} Force checked Out successfully`;
          Toast.show(full_name, Toast.LONG);
        }
      }, 1000);
    } catch (error) {
      console.error('Error in forceCheckOut:', error);
      this.setState({ loading: false });
      Toast.show('An error occurred during checkout.', Toast.LONG);
    }
  };
  
  
  /**
   * show popup and checkout modal
   */
  showPopupAndCheckOut = async () => {
    this.setState({ showAlertPopup: true, isCheckOutPopup: true });
  }; 

  facesDetected = ({ faces }) => {
    if (faces.length > 0) {
      // If eam is selected
        if (!this.faceDetectedOrNot) {
          this.faceDetectedOrNot = true;
          this.showTimerWhenFaceDetected();
        }
        this.setState({
          faces,
          faceDetectedOrNot: true,
          showAlertIdNoFace: false,
        });
      }
     else {
      if (this.state.isTeamClicked) {
        if (this.isGroupVerifyClicked) {
          this.faceDetectedOrNot = false;
          if (this.timer != null) {
            clearInterval(this.timer);
          }
          this.timerCamera = 2;
          this.setState({ faces, showAlertIdNoFace: true });
        }
      } else {
        this.faceDetectedOrNot = false;
        if (this.timer != null) {
          clearInterval(this.timer);
        }
        this.timerCamera = 2;
        this.setState({ faces, showAlertIdNoFace: true });
      }
    }
  };
  
  
  takeErrorPicture = async function () {
    if (this.camera) {
      let base64 = "";
      await this.camera
        .takePictureAsync({
          base64: true,
          quality: 0.5,
        })
        .then((data) => {
          console.log("TakeErrorPicture", data.uri)
          const formData = new FormData();
          formData.append('file',
            {
              uri: data.uri,
              name: 'newNAme.jpeg',
              type: 'image/jpeg',
            })
          formData.append('upload_preset', 'circleApp')
          formData.append("cloud_name", "enforce-solutions")
          fetch("https://api.cloudinary.com/v1_1/enforce-solutions/image/upload", {
            method: "post",
            body: formData,
            headers: {
              'Accept': "application/json",
              'Content-Type': 'multipart/form-data',
            }
          }).then(res => res.json()).
            then(async data => {

              const employeeDetails = await getData(LocalDBItems.employeeDetails);
              const params = {
                org_id: employeeDetails.org_id,
                eventName: "FaceReconization_CheckOut_Faliure",
                emp_id: employeeDetails.id,
                imgUrl: data.url,
                emp_Name: employeeDetails.full_name,
                createdDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
                modifiedDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
              };
              console.log("parms",params);

              const requestObj = {
                endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_FORCE_TIMESHEET_CHECKIN,
                type: "post",
                params: params,
              };
              // console.log(requestObj);
              const apiResponseData = await apiService(requestObj);
              if (apiResponseData.status == "200") {
                console.log("am done with this");
                counter_face_data = 0;
                this.Mobile_ID = (apiResponseData.desc);
                if (this.timer != null) {
                  clearInterval(this.timer);
                }
                this.setState({ showAlertIdNoFace: false, isVerifyFace: false });
                // this.setState({ isVerifcationPopUp:true ,isReverification:true});
                // console.log("Am done here", this.state.isReverification)
                console.log("Sucess")
                Alert.alert('Face Error Occured', 'We have failed to recoginize your face and click to submit the report ', [
                  {
                    text: 'Submit The report',
                    onPress: () => this.handleSubmission(),
                    style: 'cancel'
                  },]);

                // this.showTimerWhenFaceDetected();
              }
              else {
                console.log("Error")
              }
              console.log(params);
            }).catch(err => {
              console.log('err--->', err);
              reject(err);
            })

          clearInterval(this.timer);
        });
      if (this.timer != null) {
        clearInterval(this.timer);
      }
    }
  };

  handleSubmission = async () => {
    const {isVerifyFace,isVerified,isForcecheckout}=this.state;
    this.setState({ isVerified: false })
    this.setState({ isLoading: true })

    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    
    // await this.addTimesheetForceCheckIn()
    await this.face_report_issue();
    const full_name = `${employeeDetails.full_name} Reported the Face Error problem successfully`;
    Toast.show(full_name, Toast.LONG);
    await this.postCheckout();

  }

/*For submitting the report of the Face regonossation issue */
 face_report_issue = async () => {
    const employeDetails = await getData(LocalDBItems.employeeDetails);
    let params = { orgID: employeDetails.org_id }
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GETALL_APPROVAL_DATA,
      type: "patch",
      params: params,
    }
    const apiResponseData = await apiService(requestObj);
    // console.log(apiResponseData);
    const emp_role_id = employeDetails.role_id;
    const section_id_data = apiResponseData.filter(item => item.section_id === '8a55082f-5185-4d28-9098-4f268cb47d51' && item.role_id === emp_role_id);
    // console.log("Section_data", section_id_data)
    if (section_id_data.length == 0) {

      Alert.alert('Access Denied', 'You are not allowed to do the Face force Checkout. Please Contact IT team', [
        {
          text: 'OK',
          onPress: () => this.props.navigation.goBack(),
          style: 'cancel'
        },]);
    }
    else {
      // console.log("Checin in the Second area");
      await this.GetAllTimesheetListByEmployeeID();
      
    }

  }


  GetAllTimesheetListByEmployeeID = async () => {
    this.reason_face = "Failure in Face Recognition";
    const employeDetails = await getData(LocalDBItems.employeeDetails);
    const locationtracking = await getData(LocalDBItems.isEmployeeLocationTrack)
    let params = { orgID: employeDetails.org_id }
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GETALL_APPROVAL_DATA,
      type: "patch",
      params: params,
    }
    const apiResponseData = await apiService(requestObj);
    const emp_role_id = employeDetails.role_id;
    const section_id_data = apiResponseData.filter(item => item.section_id === '8a55082f-5185-4d28-9098-4f268cb47d51' && item.role_id === emp_role_id);
    // approver1_id = section_id_data[0].approver1_roleId;
    // approver2_id = section_id_data[0].approver2_roleId;
    // console.log("approval data" , approver1_id,approver2_id)

    let params2 = {
      id: employeDetails.id
    };
    const requestObj2 = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_TIMESHEET_LISTBY_EMPLOYEEID,
      type: "post",
      params: params2,
    }
    const apiResponseData2 = await apiService(requestObj2);
    console.log("chod", apiResponseData2)

    const lastest_time = apiResponseData2[0]["timesheetDataModels"][0]["id"];
    // console.log("Lastest_time", lastest_time);
    // console.log("Kallan ivde Und", this.Mobile_ID);

    let params3 = {
      org_id: employeDetails.org_id,
      refrence_id: this.Mobile_ID,
      type: "checkout",
      empid: employeDetails.id,
      timesheet_id: lastest_time,
      ondate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      check_in: null,
      checkin_lat: null,
      checkin_lang: null,
      check_out: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      checkout_lat: this.currentLocationObj.latitude,
      checkout_lang: this.currentLocationObj.longitude,
      levelone_roleId: section_id_data[0].approver1_roleId,
      isapproved_levelone: false,
      leveltwo_roleId: section_id_data[0].approver2_roleId,
      isapproved_leveltwo: false,
      reason_name: this.reason_face,
      status: "pending",
      created_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      createdby: employeDetails.id,
      modified_date: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      modifiedby: employeDetails.id,
      is_deleted: false,
      is_app_check_In: true
    }
    // console.log("Dadycool", params3)
    const requestObj3 = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FORCE_CHECKIN_REQUEST,
      type: "post",
      params: params3,
    }
    const apiResponseData3 = await apiService(requestObj3);
    // console.log(apiResponseData3);
    this.setState({ isForcecheckout: true })
    // if (locationtracking == false) {
    //   // console.log(" Am stuck here help me");
    //   storeData(LocalDBItems.isEmployeeLocationTrack, false);
    //   this.locationFetcher.removeLocationUpdate();
    // } else {
    //   // console.log(" Am stuck  me");
    //   storeData(LocalDBItems.isEmployeeLocationTrack, true); //
    // }
    // this.onGoBackToPrevious();
    // this.props.navigation.goBack();
    // this.props.route.params.onGoBack();
    // const employeeDetails = await getData(LocalDBItems.employeeDetails);
    // const full_name = `${employeeDetails.full_name} Force checked out successfully`;
    // Toast.show(full_name, Toast.LONG);

  }

  verifyFace = async (base64) => {
    console.log(this.count, counter_face_data, "COUNT CHECK")
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    // console.log(employeeDetails, "CHECK!")
    const faceID = await getData(LocalDBItems.saveFaceIDData);
    try {

      const filename = `${employeeDetails.first_name.toLowerCase()}.jpeg`;
      const collection_id = `face-collection-${employeeDetails.first_name.toLowerCase()}`;
      console.log("File ",filename);
      console.log("Am here Stcked",collection_id)
      var faceVerifyResult = await searchFaceImages(
        base64,
        filename,
        collection_id
      );
      console.log(faceVerifyResult, "check face result")
      const faceResult = faceVerifyResult.FaceMatches;
      // console.log(faceResult, "check face result 2")
      console.log("counter face", counter_face_data)
      if (counter_face_data < 2) {
        if (
          faceVerifyResult.statusCode === 400 &&
          !this.state.showAlertIdNoFace
        ) {
          this.count += 1;
          if (this.count != -1) {
            this.takePicture();
          }
          if (this.count == 2) {
            this.setState({ showAlertIdNoFace: true, isVerifyFace: false });
            this.count = 0;
            clearInterval(this.timer);
          }
        } else {
          if (faceResult && faceResult.length > 0 && faceResult[0].Face) {
            if (faceResult[0].Face.hasOwnProperty("ExternalImageId")) {
              if (
                faceResult[0].Face.ExternalImageId.includes(
                  employeeDetails.first_name.toLowerCase()
                )
              ) {
                  // This is for single checkOUT
                    console.log("Sigle Checkin")
                    this.setState({ isVerified: true });
                    this.postCheckout();
              } else {
                this.count += 1;
                this.takePicture();
                if (this.count == 2) {
                  this.setState({ showAlertIdNoFace: true, isVerifyFace: false });
                  this.count = 0;
                  clearInterval(this.timer);
                }
              }
            } else {
              this.count += 1;
              this.takePicture();
              if (this.count == 2) {
                this.setState({ showAlertIdNoFace: true, isVerifyFace: false });
                this.count = 0;
              }
            }
          } else {
            this.count += 1;
            this.takePicture();
            if (this.count == 2) {
              this.setState({ showAlertIdNoFace: true, isVerifyFace: false });
              this.count = 0;
            }
          }
        }
      }
      else {
        {
          console.log("FaceError")
          this.takeErrorPicture();
          this.count = 0;

        }
      }
    } catch (err) {
      console.log(err);
     }
  };


  takePicture = async function () {
    if (this.camera) {
      let base64 = "";
      await this.camera
        .takePictureAsync({
          base64: true,
          quality: 0.5,
        })
        .then((data) => {
          // console.log("TakePicture", data.uri)
          base64 = data.base64;
          this.verifyFace(data.base64);
          clearInterval(this.timer);
        });
      if (this.timer != null) {
        clearInterval(this.timer);
      }
    }
  };


  verifyFaceRekcongition = async () => {
        this.setState({ isLoading: false })
        this.setState({ isVerifyFace: true }, () => {
          // this.animate();
          this.showTimerWhenFaceDetected();
        });
      }


showTimerWhenFaceDetected() {
        this.timerCamera = 1;
        if (this.faceDetectedOrNot) {
          this.timer = setInterval(() => {
            this.timerCamera--;
            if (this.timerCamera === 0) {
              this.timerCamera = 1;
                this.takePicture();
            }
          }, 1000);
        }
      }



  /**
   * This method is to post the checkout
   * @param {bool} isEndOfWork
   */
  postCheckout = async (isEndOfWork = false) => {
    const {isVerifyFace,isVerified,isForcecheckout}=this.state;
    this.setState({ isVerifyFace: true })
    this.setState({ isLoading: false })
    console.log("isForceCheckout",isForcecheckout);
    console.log("isVerified",isVerified);
    console.log("isVerifyFace",isVerifyFace);
    if(isVerifyFace&&!isVerified&&!isForcecheckout){
    await this.takePicture();
    }
    console.log("isForceCheckout",isForcecheckout);
    console.log("isVerified",isVerified);
    console.log("isVerifyFace",isVerifyFace);
    if(isVerified||isForcecheckout){
      this.camera=false
      counter_face_data = 0;
      this.setState({ isVerifyFace: false })
      this.count=0
      this.setState({ loading: false, isCheckOutPopup: false, showAlertPopup: false });
      console.log("Properly CHecked Out");
        console.log('post checkout', this.currentLocationObj)
        this.setState({ loading: true });
        const userId = await getData(LocalDBItems.employeeDetails);
        const checkInDetails = await getData(LocalDBItems.CHECK_IN_OUT_DETAILS)
        const date = await AsyncStorage.getItem("forcetime")
        let formattedTime = moment().format("MM/DD/YYYY") + ' ' + date;
        let forceCheckoutTime = moment(formattedTime, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss.SSS");
        console.log(forceCheckoutTime, "forceCheckoutTime");
        let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
        console.log('-----205', checkIsInRadius)
        let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
        console.log("Data", isFetchedGeoCorderObj)
        if (!isFetchedGeoCorderObj) {
          console.log("Over")
          if (checkout_counter < 2) {
            Toast.show("Unable to fetch geo location info", Toast.LONG);
            this.setState({ loading: false, isCheckOutPopup: false, showAlertPopup: false });
            checkout_counter++;
            console.log("CheckoutCounter", checkout_counter)
          }
          else {
            this.location_feching();
            this.setState({ loading: false, isCheckOutPopup: false, showAlertPopup: false });
            Toast.show("We have sucessfully registered your Technical Error", Toast.LONG);
          }
        }
        else {
          console.log("straight forward")
          let params = {
            team_member_empid: this.checkInDataValue.empid,
            groupid: this.checkInDataValue.groupid,
            check_out: formattedTime,
            checkout_tag_id:this.UUID,
            is_inrange: checkIsInRadius ? checkIsInRadius : false,
            modifiedby: userId.full_name,
            TimesheetCurrentLocationViewModel: {
              formatted_address: this.currentLocationObj.formatted_address,
              lat: this.cordinateObj.latitude,
              lang: this.cordinateObj.longitude,
              street_number: this.currentLocationObj.street_number,
              route: this.currentLocationObj.route,
              locality: this.currentLocationObj.locality,
              administrative_area_level_2: this.currentLocationObj
                .administrative_area_level_2,
              administrative_area_level_1: this.currentLocationObj
                .administrative_area_level_1,
              postal_code: this.currentLocationObj.postal_code,
              country: this.currentLocationObj.country,
            },
          };
          await storeData(LocalDBItems.checkOutLocationInfo, this.currentLocationObj);
          console.log("doubt in UUID", params);
          const requestObj = {
            endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_CHECKOUT,
            type: "post",
            params: params,
          };
          const apiResponseData = await apiService(requestObj);
          setTimeout(() => {
            this.setState({
              loading: false,
            });
            console.log("Apireasponse Location", apiResponseData);
            /*-- Changing for the stimulation of the error  */
            if (apiResponseData.status === "200") {
              if (isEndOfWork) {
                this.timer_error = false;
                this.isWorkEnded = true;
                this.isCheckinForLocation = false;
                storeData(LocalDBItems.isEmployeeLocationTrack, false);
                storeData(LocalDBItems.CHECK_IN_OUT_DETAILS, checkInDetails)
                this.locationFetcher.removeLocationUpdate();
              } else {
                this.startTracking(); //for check out
              }
              clearInterval(this.timerCheckIn);
              clearInterval(this.timerBreakIn);
              clearInterval(this.showTimerForAutoCheckOut);
              this.timerStopCounter = 0;
              this.timerStopForBreakCounter = 0;
              this.setState({
                breakInData: null,
                checkInData: null,
                isStarted: false,
                isBreak: false,
                stopWatchCounter: "00:00",
                stopWatchCounterBreakIn: "00:00",
                loading: false,
                progressBarPercentage: 0,
                showAlertPopup: false,
                isCheckOutPopup: false,
              });
              const full_name = `${userId.full_name}'s Checked Out sucessfully`;
              Toast.show(full_name, Toast.LONG);
              const checkinInfo = { isOfficeChecin: false, isProjectCheckin: false };
              storeData(LocalDBItems.checkInInfo, checkinInfo);
            }
            else {
              if (checkout_counter < 2) {
                Toast.show("Your Checkin Location And CheckOut Location Doesnt Match.Please Retry ", Toast.LONG);
                this.setState({ loading: false, isCheckOutPopup: false, showAlertPopup: false });
                checkout_counter++;
                console.log("CheckoutCounter", checkout_counter)
              }
              else {
                this.setState({ loading: false, isCheckOutPopup: false, showAlertPopup: false, isForceCheckoutPopUp: true });
              }
            }
          }, 1000);
        }
    }
    else if(isForcecheckout)
    {
      console.log("Is Force Chek Out",isForcecheckout);
    }
  };


  //   errortimer = async () => {
  //     if(this.timer_error == false)
  //     {
  //     console.log(this.timer_error)
  //     }
  //     else{
  // if(counter < 2)
  // {
  //   {   
  //     this.setState({loading : false});
  //     Alert.alert('Request Timeout','You are Exceeded request timeout please Refresh the page',[
  //       {
  //         text: 'Refresh',
  //         onPress: () => this.onGoBackToPreviousCheckOut(),
  //         style:'cancel'
  //       },]);
  //   }

  // }
  // else          
  // {
  //   this.setState({loading : false});
  //   Alert.alert('Request Timeout','You are Exceeded the refresh try Kindly please report the issue',[
  //     {
  //       text: 'Report the problem',
  //       onPress: () => this.submitReport(),
  //       style:'cancel'
  //     },]);
  //   }
  //     }

  // }

  // checkoutmodal = async () => {
  //   console.log("Exited")
  //   let params = {
  //     team_member_empid: this.checkInDataValue.empid,
  //     groupid: this.checkInDataValue.groupid,
  //     check_out: moment(new Date()).utc(true).format("DD/MM/YYYY hh:mm a"),
  //     is_inrange: checkIsInRadius ? checkIsInRadius : false,
  //     modifiedby: userId.full_name,
  //     TimesheetCurrentLocationViewModel: {
  //       formatted_address: this.currentLocationObj.formatted_address,
  //       lat: this.cordinateObj.latitude,
  //       lang: this.cordinateObj.longitude,
  //       street_number: this.currentLocationObj.street_number,
  //       route: this.currentLocationObj.route,
  //       locality: this.currentLocationObj.locality,
  //       administrative_area_level_2: this.currentLocationObj
  //         .administrative_area_level_2,
  //       administrative_area_level_1: this.currentLocationObj
  //         .administrative_area_level_1,
  //       postal_code: this.currentLocationObj.postal_code,
  //       country: this.currentLocationObj.country,
  //     },
  //   };
  //   await storeData(LocalDBItems.checkOutLocationInfo, this.currentLocationObj);

  //   const requestObj = {
  //     endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_CHECKOUT,
  //     type: "post",
  //     params: params,
  //   };
  //   const apiResponseData = await apiService(requestObj);
  //   setTimeout(() => {
  //     this.setState({
  //       loading: false,
  //     });

  //     /*-- Changing for the stimulation of the error  */ 
  //     if (apiResponseData.status === "200") {
  //       if (isEndOfWork) {
  //         this.timer_error = false;
  //         this.isWorkEnded = true;
  //         this.isCheckinForLocation = false;
  //         storeData(LocalDBItems.isEmployeeLocationTrack, false);
  //         storeData(LocalDBItems.CHECK_IN_OUT_DETAILS, checkInDetails)
  //         this.locationFetcher.removeLocationUpdate();
  //       } else {
  //         this.startTracking(); //for check out
  //       }
  //       clearInterval(this.timerCheckIn);
  //       clearInterval(this.timerBreakIn);
  //       clearInterval(this.showTimerForAutoCheckOut);
  //       this.timerStopCounter = 0;
  //       this.timerStopForBreakCounter = 0;
  //       this.setState({
  //         breakInData: null,
  //         checkInData: null,
  //         isStarted: false,
  //         isBreak: false,
  //         stopWatchCounter: "00:00",
  //         stopWatchCounterBreakIn: "00:00",
  //         loading: false,
  //         progressBarPercentage: 0,
  //         showAlertPopup: false,
  //         isCheckOutPopup: false,
  //       });
  //       const full_name = `${userId.full_name}'s Checked Out sucessfully`;
  //       Toast.show(full_name, Toast.LONG);
  //       const checkinInfo = { isOfficeChecin: false, isProjectCheckin: false };
  //       storeData(LocalDBItems.checkInInfo, checkinInfo);
  //     } 
  //     else 
  //     {
  //       console.log('error', apiResponseData.result.code)
  //       Toast.show(apiResponseData.result.code || "Something went wrong", Toast.LONG)
  //       this.setState({loading: false})
  //     }
  //   }, 1000);
  // }

  // submitReport = async () => {
  //     console.log(value)
  //     const employeeDetails = await getData(LocalDBItems.employeeDetails);
  //     const params = {
  //       org_id : employeeDetails.org_id,
  //       eventName : "Force_checkOut",
  //       emp_id :  employeeDetails.id,
  //       emp_Name : employeeDetails.full_name,
  //       createdDate: moment(new Date()).utc(true).format("DD/MM/YYYY hh:mm a"),
  //       modifiedDate:moment(new Date()).utc(true).format("DD/MM/YYYY hh:mm a"),
  //     };
  //     const requestObj = {
  //       endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_FORCE_TIMESHEET_CHECKIN,
  //       type: "post",
  //       params: params,
  //     };
  //     const apiResponseData = await apiService(requestObj);
  //     if (apiResponseData.status == "200") {
  //       if (this.timer != null) {
  //         clearInterval(this.timer);
  //       }
  //     }
  //     clearInterval(this.timerCheckIn);
  //     clearInterval(this.timerBreakIn);
  //     clearInterval(this.showTimerForAutoCheckOut);
  //     this.timerStopCounter = 0;
  //     this.timerStopForBreakCounter = 0;
  //     this.setState({
  //       breakInData: null,
  //       checkInData: null,
  //       isStarted: false,
  //       isBreak: false,
  //       stopWatchCounter: "00:00",
  //       stopWatchCounterBreakIn: "00:00",
  //       loading: false,
  //       progressBarPercentage: 0,
  //       showAlertPopup: false,
  //       isCheckOutPopup: false,
  //     });
  //     console.log(params);
  //     const full_name = `${employeeDetails.full_name} Force checked Out successfully`;
  //     Toast.show(full_name,Toast.LONG);
  //     }

  /**
   * Check the team member is out of the radius
   */
  checkOutOnceTeamMemberAssginedOutOfRadius = async () => {
    this.setState({ loading: true });
    const userId = await getData(LocalDBItems.employeeDetails);
    let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    console.log('check radius issue')
    let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
    if (!isFetchedGeoCorderObj) {
      // Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
      this.setState({ loading: false });
    }

    let params = {
      team_member_empid: userId.user_id,
      groupid: this.checkInDataValue.groupid,
      check_out: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      is_inrange: checkIsInRadius ? checkIsInRadius : false,
      modifiedby: userId.full_name,
      checkout_tag_id:this.UUID,
      TimesheetCurrentLocationViewModel: {
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.cordinateObj.latitude,
        lang: this.cordinateObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
      },
    };
    console.log(params),"UUID Errroe";
    await storeData(LocalDBItems.checkOutLocationInfo, this.currentLocationObj);
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_CHECKOUT,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(() => {
      this.setState({
        loading: false,
      });
      if (apiResponseData) {
        if (isEndOfWork) {
          this.isWorkEnded = true;
          this.isCheckinForLocation = false;
          storeData(LocalDBItems.isEmployeeLocationTrack, false);
          this.locationFetcher.removeLocationUpdate();
        } else {
          this.startTracking(); //for check out
        }
        clearInterval(this.timerCheckIn);
        clearInterval(this.timerBreakIn);
        this.timerStopCounter = 0;
        this.timerStopForBreakCounter = 0;
        this.setState({
          breakInData: null,
          checkInData: null,
          isStarted: false,
          isBreak: false,
          stopWatchCounter: "00:00",
          stopWatchCounterBreakIn: "00:00",
          loading: false,
          progressBarPercentage: 0,
          showAlertPopup: false,
          isCheckOutPopup: false,
        });
        const full_name = `${userId.full_name} checked out successfully`;
        Toast.show(full_name, Toast.LONG);
        const checkinInfo = { isOfficeChecin: false, isProjectCheckin: false };
        storeData(LocalDBItems.checkInInfo, checkinInfo);
      }
    }, 1000);
  };

  locationTrackingNewApi = async () => {
    let checkindata = await this.getCheckinDict()
    console.log('----------called locatuon')
    await this.trackRef.locationTrackingNewApi(checkindata, this.isTripEnd)
  };
  getCheckinDict = async () => {
    let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded);
    const checkInOutDetails = await getData(LocalDBItems.CHECK_IN_OUT_DETAILS);
    let dict = {};
    if (isTracking) {
      dict = {
        checkin_lat: 0.0,
        checkin_lang: 0.0,
        checkin_street_number: "",
        checkin_route: "",
        checkin_locality: "",
        checkin_administrative_area_level_2: "",
        checkin_administrative_area_level_1: "",
        checkin_project: "",
        checkin_jobType: "",
      };
    } else {
      console.log('-----450')
      //let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
      // if (!isFetchedGeoCorderObj) {
      //  // Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
      //   this.setState({ loading: false });
      // }
      dict = {
        checkin_formatted_address: this.currentLocationObj.formatted_address,
        // "checkout_geo_address": this.cordinateObj.latitude,
        checkin_lat: this.cordinateObj.latitude,
        checkin_lang: this.cordinateObj.longitude,
        checkin_street_number: this.currentLocationObj.street_number,
        checkin_route: this.currentLocationObj.route,
        checkin_locality: this.currentLocationObj.locality,
        checkin_administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        checkin_administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        checkin_project: checkInOutDetails.checkin_out_project,
        checkin_jobType: checkInOutDetails.checkin_out_jobType,
      };
    }
    return dict;
  };
  calcDistance = (newLatLng, prevLatLng) => {
    let distance = haversine(prevLatLng, newLatLng) || 0;
    // const { prevLatLng } = this.state;
    return distance;
  };
  getRandomUUID = async () => {
    let udid = await getData(LocalDBItems.groupUUID);
    if (udid == "" || udid == null) {
      udid = await UUIDGenerator.getRandomUUID();
      await storeData(LocalDBItems.groupUUID, udid);
    }
    return udid;
  };
  postBreakOut = async () => {
    let isFetchedGeoCorderObj = await this.fetchGeocoderObject();

    if (!isFetchedGeoCorderObj) {
      //Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
      this.setState({ loading: false });
    }
    this.setState({ loading: true });
    const userId = await getData(LocalDBItems.employeeDetails);
    let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    let params = {
      team_member_empid: this.checkInDataValue.empid,
      groupid: this.checkInDataValue.groupid,
      check_out: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      is_inrange: checkIsInRadius ? checkIsInRadius : false,
      modifiedby: userId.full_name,
      TimesheetCurrentLocationViewModel: {
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.cordinateObj.latitude,
        lang: this.cordinateObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
      },
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_BREAKOUT,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(async () => {
      this.setState({
        loading: false,
      });
      if (apiResponseData.status === "200") {
        clearInterval(this.timerBreakIn);
        this.timerStopForBreakCounter = 0;
        await this.lastCheckinByEmpID(false);
        Toast.show(apiResponseData.desc, Toast.LONG);
        this.setState({
          isBreak: false,
          isStarted: true,
          breakInData: null,
          stopWatchCounterBreakIn: "00:00",
        });
      }
    }, 800);
  };
  fetchGeocoderObject = async () => {
    let locationObj = await getData(LocalDBItems.location);
    if (locationObj) {
      console.log("locationObj.latitude", locationObj.latitude);
      console.log("locationObj.latitude", locationObj.longitude);
      let locationName = await this.geoCoder.getPlaceFromCordinate(
        locationObj.latitude,
        locationObj.longitude
      );

      this.currentLocationObj = locationName;
      if (this.currentLocationObj) {
        return true;
      }
      return false;
    }
    return false;
  };
  /**
   * This method is to post break in
   */
  postBreakIn = async () => {
    this.setState({ loading: true });
    const userId = await getData(LocalDBItems.employeeDetails);
    let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
    if (!isFetchedGeoCorderObj) {
      //Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
      this.setState({ loading: false });
    }
    let params = {
      team_member_empid: this.checkInDataValue.empid,
      groupid: this.checkInDataValue.groupid,
      check_out: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      is_inrange: checkIsInRadius,
      modifiedby: userId.full_name,
      TimesheetCurrentLocationViewModel: {
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.cordinateObj.latitude,
        lang: this.cordinateObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
      },
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.TIMESHEET_BREAKIN,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(async () => {
      this.setState({
        loading: false,
      });
      if (apiResponseData.status === "200") {
        clearInterval(this.timerCheckIn);
        await this.findTimeSheetBreakInBreakOut(false);
        this.setState({ isStarted: false });
        Toast.show(apiResponseData.desc, Toast.LONG);
      }
    }, 800);
  };
  findTimeSheetBreakInBreakOut = async (loader) => {
    this.setState({ loading: loader });
    const userId = await getData(LocalDBItems.employeeDetails);
    let params = {
      grpID: this.checkInDataValue.groupid,
      empID:
        this.checkInDataValue.empid.length > 0
          ? this.checkInDataValue.empid[0]
          : null,
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_BREAKIN_BREAKOUT,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(() => {
      this.setState({
        loading: false,
      });
      if (apiResponseData.length > 0) {
        const difference = moment.duration(
          moment(this.state.currentDate).diff(
            moment(apiResponseData[0].break_in)
          )
        );
        //difference of the expiry date-time given and current date-time
        var hours = parseInt(difference.asHours());
        var minutes = parseInt(difference.minutes());
        var seconds = parseInt(difference.seconds());
        var inSeconds = hours * 60 * 60 + minutes * 60 + seconds;
        if (inSeconds > 0) {
          this.timerStopForBreakCounter = inSeconds;
        } else {
          this.timerStopForBreakCounter = 0;
        }
        this.setState({
          breakInData: apiResponseData[0],
          loading: false,
          isBreak: true,
        });
        this.setBreakInBreakOutTimer();
      } else {
        this.setCheckInCheckOutTimer();
      }
    }, 500);
  };
  // lastCheckinByEmpID = async (loader) => {
  //   console.log("Loader",loader);
  //   console.log("AM here start");
  //   this.setState({ loading: loader });
  //   const userId = await getData(LocalDBItems.employeeDetails);
  //   console.log("Started",userId.id)
  //   let params = { id: userId.id };
  //   console.log("Started",params)
  //   const requestObj = {
  //     endpoint: BaseUrl.API_BASE_URL + Endpoint.LAST_CHECKINBY_EMPID,
  //     type: "post",
  //     params: params,
  //   };
  //   console.log("AM here apiresponse",requestObj);
  //   const apiResponseData = await apiService(requestObj);
    
  //   setTimeout(() => {
  //     this.setState({
  //       loading: false,
  //     });
  //     if (apiResponseData) {
  //       if (apiResponseData.length > 0) {
  //         const date = moment(apiResponseData[0].check_in).format(
  //           "MM/DD/YYYY hh:mm:ss A"
  //         );
  //         this.isCheckinForLocation = true;
  //         const dateToStore = moment(apiResponseData[0].check_in).toDate();
  //         storeData(LocalDBItems.checkInDate, dateToStore);
  //         const difference = moment.duration(
  //           moment(this.state.currentDate).diff(
  //             moment(apiResponseData[0].check_in)
  //           )
  //         );
  //         console.log("AM here hourssss");
  //         //difference of the expiry date-time given and current date-time
  //         var hours = parseInt(difference.asHours());
  //         var minutes = parseInt(difference.minutes());
  //         var seconds = parseInt(difference.seconds());
  //         var inSeconds = hours * 60 * 60 + minutes * 60 + seconds;
  //         var progressPercentage = (inSeconds / 39600) * 100; // calculate in 11 hours
  //         if (inSeconds > 0) {
  //           this.timerStopCounter = inSeconds;
  //         } else {
  //           this.timerStopCounter = 0;
  //         }
  //         var checkInData = {};
  //         var empid = [];
  //         if (apiResponseData.length > 1) {
  //           this.isCheckinAdmin = false;
  //           apiResponseData.forEach((item) => {
  //             if (userId.id === item.empid) {
  //               this.isCheckinAdmin = item.is_checkin_admin;
  //             }
  //             empid.push(item.empid);
  //           });
  //           const checkInData = {
  //             groupid:
  //               apiResponseData.length > 0 ? apiResponseData[0].groupid : null,
  //             empid: empid,
  //           };
  //           this.checkInDataValue = checkInData;
  //         } else {
  //           this.isCheckinAdmin = true;
  //           const checkInData = {
  //             groupid:
  //               apiResponseData.length > 0 ? apiResponseData[0].groupid : null,
  //             empid:
  //               apiResponseData.length > 0 ? [apiResponseData[0].empid] : null,
  //           };
  //           this.checkInDataValue = checkInData;
  //         }
  //         let isGroupCheckin = false;
  //         // this.fetchGroupMembers(checkInData.groupid)
  //         let employeeid = empid;
  //         if (employeeid && employeeid.length > 1) {
  //           isGroupCheckin = true;
  //           this.fetchGroupMembers(this.checkInDataValue.groupid);
  //         }
  //         this.setState({
  //           isGroupCheckIn: isGroupCheckin,
  //           checkInData: apiResponseData[0],
  //           stopWatchCounter: this.getTimeFormat(this.timerStopCounter),
  //           loading: false,
  //           isStarted: true,
  //           progressBarPercentage: progressPercentage,
  //         });
  //         this.findTimeSheetBreakInBreakOut(loader);
  //       }
  //     }
  //   }, 1000);
  // };

  lastCheckinByEmpID = async (loader) => {
    console.log("Loader", loader);
    console.log("AM here start");
    this.setState({ loading: loader });
    
    try {
      const userId = await getData(LocalDBItems.employeeDetails);
      console.log("Started", userId.id);
      
      let params = { id: userId.id };
      console.log("Started", params);
      
      const requestObj = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.LAST_CHECKINBY_EMPID,
        type: "post",
        params: params,
      };
      console.log("AM here apiresponse", requestObj);
      
      const apiResponseData = await apiService(requestObj);
      console.log("API response received", apiResponseData);
  
      if (apiResponseData) {
        this.processCheckInData(apiResponseData, userId.id);
      } else {
        console.warn("No data received from API");
        this.setState({ loading: false });
      }
      
    } catch (error) {
      console.error("API call failed:", error);
      this.setState({ loading: false });
    }
  };
  
  fetchGroupMembers = async (groupId) => {
    let params = { id: groupId };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_EMPLOYEES_VIA_GROUPID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getTeamEmployeeName = apiResponseData.map((value) => {
        return { ...value, label: value.full_name, value: value.full_name };
      });
      this.state.getGroupMembersList = getTeamEmployeeName;
      this.state.groupMemberInfoArray = apiResponseData;
      this.setState({ getGroupMembersList: getTeamEmployeeName });
    }
  };
  //StopWatch Timer
  setTimerForStopWatch() {
    this.timerCheckIn = setInterval(() => {
      if (this.state.isStarted) {
        this.timerFunctionCheckInCheckOut();
      }
    }, 1000);
  }
  //StopWatch Timer
  setTimerForStopWatchBreakIn() {
    this.timerBreakIn = setInterval(() => {
      if (this.state.isBreak) {
        this.timerFunctionBreakInBreakOut();
      }
    }, 1000);
  }
  timerFunctionCheckInCheckOut() {
    let timerStopWatch = this.timerStopCounter;
    timerStopWatch++;
    let progressPercenatge = (timerStopWatch / 28800) * 100;
    if (this.state.isStarted && !this.state.isPaused) {
      this.timerStopCounter = timerStopWatch;
    }
    if (this.state.isPaused) {
      this.timerStopCounter = timerStopWatch - 1;
    }

    if (!this.state.isPaused) {
      this.setState({
        stopWatchCounter: this.getTimeFormat(timerStopWatch),
        progressBarPercentage: progressPercenatge,
      });
    }
  }
  setCheckInCheckOutTimer(date) {
    if (this.state.isStarted) {
      this.setTimerForStopWatch();
    }
    this.setState({ isStarted: true, stopWatchCounter: "0:00" });
  }
  setBreakInBreakOutTimer(date) {
    if (this.state.isBreak) {
      this.setTimerForStopWatchBreakIn();
    }
    this.setState({ isBreak: true, stopWatchCounterBreakIn: "0:00" });
  }
  timerFunctionBreakInBreakOut() {
    let timerStopWatch = this.timerStopForBreakCounter;
    timerStopWatch++;
    if (this.state.isBreak && !this.state.isPaused) {
      this.timerStopForBreakCounter = timerStopWatch;
    }
    if (this.state.isPaused) {
      this.timerStopForBreakCounter = timerStopWatch - 1;
    }

    if (!this.state.isPaused) {
      this.setState({
        stopWatchCounterBreakIn: this.getTimeFormat(timerStopWatch),
      });
    }
  }
  getTimeFormat(time) {
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }

  getLocationForTracking = async (locationObj) => {
    // if (this.state.locationFetcherNeeded){
    this.cordinateObj.latitude = locationObj.latitude;
    this.cordinateObj.longitude = locationObj.longitude;
    console.log(this.cordinateObj);
    let isTracking = await getData(LocalDBItems.isLocationTrackingNeeded);
  };
  getLoctionObj = async (locationObj) => {
    const checkInDate = await getData(LocalDBItems.checkInDate);
    let currentDate = new Date();
  };

  navigateToAuthScreen = async () => {
    // Toast.showWithGravity('apiResponseData.desc', Toast.LONG, Toast.BOTTOM)
    await wipeData();
    if (this.locationFetcher != null) {
      this.locationFetcher.removeListners();
      this.locationFetcher.removeLocationUpdate();
      this.locationFetcher = null;
    }
    storeData(LocalDBItems.isUserAuthenticated, false);
    NavigationService.navigateAndReset("Auth", {});
  };
  renderCheckBreakButton() {
    const {
      loading,
      checkInData,
      breakInData,
      isPaused,
      isStarted,
    } = this.state;
    return (
      <>
        {checkInData != null && breakInData == null && (
          <>
            {!this.isCheckinAdmin ? (
              <TouchableOpacity
                style={{
                  width: "85%",
                  marginBottom: 30,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <LinearGradient
                  start={{ x: 0.5, y: 1.0 }}
                  end={{ x: 0.0, y: 0.25 }}
                  colors={["#fe717f", "#fa8576", "#f6976e"]}
                  style={[styles.checkInButton, { opacity: 0.5 }]}
                >
                  <Text style={styles.checkInText}>{"CheckOut"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  width: "85%",
                  marginBottom: 30,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
                onPress={() => this.showPopupAndCheckOut()}
              >
                <LinearGradient
                  start={{ x: 0.5, y: 1.0 }}
                  end={{ x: 0.0, y: 0.25 }}
                  colors={["#fe717f", "#fa8576", "#f6976e"]}
                  style={styles.checkInButton}
                >
                  <Text style={styles.checkInText}>{"CheckOut"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
        {checkInData === null && (
          <TouchableOpacity
            style={{
              width: "85%",
              marginBottom: 30,
              justifyContent: "center",
              alignSelf: "center",
            }}
            onPress={() => this.navigateToCheckInScreen()}
          >
            <LinearGradient
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.0, y: 0.25 }}
              colors={["#fe717f", "#fa8576", "#f6976e"]}
              style={styles.checkInButton}
            >
              <Text style={styles.checkInText}>{"CheckIn"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {breakInData != null && checkInData != null && (
          <TouchableOpacity
            style={styles.breakInButton}
            onPress={() => this.postBreakOut()}
          >
            <Text style={styles.breakInText}>{"Break Out"}</Text>
          </TouchableOpacity>
        )}
        {breakInData === null && checkInData != null && (
          <TouchableOpacity
            style={styles.breakInButton}
            onPress={() => this.postBreakIn()}
          >
            <Text style={styles.breakInText}>{"Break In"}</Text>
          </TouchableOpacity>
        )}
      </>
    );
  }
  navigateToViewRoleScreen() {
    NavigationService.navigate("ViewRoleListScreen");
  }
  isInRadius = async (isInRadius) => {
    let checkinInfo = await getData(LocalDBItems.checkInInfo);
    if (
      checkinInfo &&
      (checkinInfo.isOfficeChecin === true ||
        checkinInfo.isProjectCheckin === true)
    ) {
      if (this.state.checkInData && this.state.loading == false) {
        this.setState({
          isInRadiusModalShow: isInRadius == false ? true : false,
        });
      }
    }
  };
  renderCamera() {
    const { canDetectFaces } = this.state;
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
          justifyContent: "space-between",
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: "Permission to use camera",
          message: "We need your permission to use your camera",
          buttonPositive: "Ok",
          buttonNegative: "Cancel",
        }}
        faceDetectionLandmarks={
          RNCamera.Constants.FaceDetection.Landmarks
            ? RNCamera.Constants.FaceDetection.Landmarks.all
            : undefined
        }
        onFacesDetected={canDetectFaces ? this.facesDetected : undefined}
        faceDetectionMode={
          RNCamera.Constants.FaceDetection.Mode
            ? RNCamera.Constants.FaceDetection.Mode.accurate
            : undefined
        }
        faceDetectionClassifications={
          RNCamera.Constants.FaceDetection.Classifications
            ? RNCamera.Constants.FaceDetection.Classifications.all
            : undefined
        }
      //onFaceDetectionError={this.onFaceDetectionError}
      >
        <View
          style={{
            //flex: 0.5,
            width: "80%",
            height: 80,
            backgroundColor: "transparent",
            flexDirection: "row",
            marginLeft: 24,
          }}
        >
          <TouchableOpacity
            style={{
              width: 60,
              marginTop: 50,
              backgroundColor: "transparent",
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => this.dismissAndGoBack()}
          >
            <Icones name="angle-left" size={30} color="white" />
            <Text style={[styles.flipText, { paddingLeft: 15 }]}>Back</Text>
          </TouchableOpacity>
        </View>
        {!this.faceDetectedOrNot && (
          <View
            style={{
              justifyContent: "center",
              alignSelf: "center",
              top: 100,
              backgroundColor: "black",
              opacity: 0.5,
              position: "absolute",
            }}
          >
            <Text style={[styles.flipText, { fontSize: 15 }]}>
              {this.faceDetectedOrNot ? "" : "No person detected."}
            </Text>
          </View>
        )}
        <View style={styles.cameraFaceContainer}>
          <View style={{ flex: 1 }}>
            <Image
              style={styles.CameraFaceIcon}
              source={Images.defaultFaceMaskIcon}
              resizeMode={"contain"}
            />

            <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }} >
              <Progress.Bar color={'#fff'} indeterminate={this.state.indeterminate} progress={this.state.progress} width={350} />
            </View>


          </View>
        </View>
        {/* {canDetectFaces && this.renderFaces()} */}
        {canDetectFaces}
      </RNCamera>
    );
  }
  dismissAndGoBack() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }

    this.setState({ isVerifyFace: false, showAlertIdNoFace: false });
  }
  modalCloseAction = () => {
    this.setState({ isInRadiusModalShow: false });
    this.postCheckout();
  };
  submitAction = () => {
    this.setState({ isInRadiusModalShow: false });
    this.postCheckout(true);
  };
  
  modalCloseAlertAction = () => {
    this.setState({ showAlertPopup: false, isCheckOutPopup: false });
  };
  modalforcecheckoutaction = () => {
    this.setState({ isForceCheckoutPopUp: false })
    this.getdata();

  }
  modalCheckOut = () => {
    this.postCheckout();
  };

  modalEndOfWork = async () => {
    await this.resetTracking();
    this.postCheckout(true);
  };

  modalLogout = () => {
    Geolocation.stopObserving();
    this.setState({ showAlertPopup: false, isCheckOutPopup: false }, () => {
      this.navigateToAuthScreen();
    });
  };
  resetTracking = async () => {
    await storeData(LocalDBItems.isLocationTrackingNeeded, false);
    await storeData(LocalDBItems.locationArray, []);
    await storeData(LocalDBItems.groupUUID, "");
    await storeData(LocalDBItems.locationArrayForTracing, []);
    this.setState({ showLiveTrackingButton: false });
  };
  startTracking = async () => {
    storeData(LocalDBItems.isLocationTrackingNeeded, true);
    storeData(LocalDBItems.locationArray, []);
    await storeData(LocalDBItems.locationArrayForTracing, []);
    this.setState({ showLiveTrackingButton: true });
  };

  showLogoutPopup = () => {
    const { showLiveTrackingButton } = this.state;
    if (showLiveTrackingButton) {
      Alert.alert('Live trip', 'If you logout the live trip data will be lost. Are you sure you want to continue?.', [
        {
          text: "OK",
          onPress: () => {
            this.setState({ showAlertPopup: true, isCheckOutPopup: false });
          },
          style: 'default',
        },
        {
          text: 'CANCEL',
          style: 'cancel',
        },
      ])
    } else {
      this.setState({ showAlertPopup: true, isCheckOutPopup: false });
    }
  };

  continousFetchRequired = async () => {
    let isLocationFetcherRequired = await getData(
      LocalDBItems.isLocationFetcherRequired
    );
    let isEmployeeLocationTrack = await getData(
      LocalDBItems.isEmployeeLocationTrack
    );
    if (isLocationFetcherRequired) {
      if (isEmployeeLocationTrack) {
        return isEmployeeLocationTrack;
      }
    } else {
      return false;
    }
  };
  renderAdminPrivilage() {
    if (this.employeeDetails.is_superadmin || this.employeeDetails.is_admin) {
      return (
        <>
          <TouchableOpacity
            style={{
              position: "absolute",
              justifyContent: "flex-start",
              alignItems: "flex-end",
              left: 20,
              bottom: 20,
            }}
            onPress={() => this.navigateToViewRoleScreen()}
          >
            <Icon name="home" size={25} color="white" />
          </TouchableOpacity>
        </>
      );
    }
  }
  navigateToLiveTracking = () => {
    this.setState({ showTrackingModal: true });
  };
  openUrlToAddActivity = (url) => {
    Linking.openURL(url);
    // Linking.canOpenURL(url).then((supported) => {
    //   console.log("Sup",supported);
    //   if (supported) {
    //     Linking.openURL(url);
    //   } else {
    //   }
    // });
  };
  navigateToAddActivity = async () => {
    const tokenData = await getData(LocalDBItems.tokenData);
    const userData = await getData(LocalDBItems.userDetails);
    const url = `https://enforcesolutions.com/login-callback?token=${tokenData}&username=${userData.userName}`;
    this.openUrlToAddActivity(url);
  };
  onSelectGroupMember = (value, index) => {
    this.state.isDisabled = false;
    this.setState({ isDisabled: false });
    this.state.groupMemeber = this.state.groupMemberInfoArray[index];
  };
  assignTaskToMemeber = async () => {
    this.setState({ loading: true });
    const employeDetails = await getData(LocalDBItems.employeeDetails);

    let isFetchedGeoCorderObj = await this.fetchGeocoderObject();
    if (!isFetchedGeoCorderObj) {
      // Toast.show("Unbale to fetcth geo locationinfo", Toast.LONG);
      this.setState({ loading: false });
    }

    let params = {
      current_checkin_empid: employeDetails.id,
      handover_checkin_empid: this.state.groupMemeber.id,
      groupid: this.checkInDataValue.groupid,
      check_out: "",
      modifiedby: employeDetails.full_name,
      is_inrange: false,
      TimesheetCurrentLocationViewModel: {
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.cordinateObj.latitude,
        lang: this.cordinateObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
      },
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.HAND_OVER_CHECKOUT,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      this.checkOutOnceTeamMemberAssginedOutOfRadius();
    }
    this.setState({ isInRadiusModalShow: false, loading: false });
  };
  /**
   *
   */
  modalCloseRadioDropDown = () => {
    this.setState({ isInRadiusModalShow: false });
  };

  modalReverifyAction = () => {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    counter_face_data++;
    this.verifyFaceRekcongition();
  };

  hideLiveTracking = () => {
    this.setState({ showTrackingModal: false });
  };

  render() {
    const {
      loading,
      isVerifyFace,
      checkInData,
      breakInData,
      isPaused,
      isLoading,
      isStarted,
      faceReportPopup
    } = this.state;
    if (isVerifyFace) {
      return (
        <View style={([Helpers.fillCol], styles.container)}>
          <Loader loading={isLoading} />
          {this.renderCamera()}
        </View>
      );
    } else {
    return (
      <View style={([Helpers.fillCol], styles.container)}>
        <LocationFetcher
          ref={(ref) => {
            this.locationFetcher = ref;
          }}
          getLocation={(location) => this.getLoctionObj(location)}
          isInRadiusOrNot={(isInRadius) => this.isInRadius(isInRadius)}
          isContiousSavingRequired={true}
          isInitialLoad={true}
          getLocationForTracking={(location) =>
            this.getLocationForTracking(location)
          }
        />
        <Loader loading={loading} />
        <LinearGradient
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.0, y: 0.25 }}
          colors={["#f6976e", "#fe717f", "#fa8576"]}
          style={styles.navigationLinearGradient}
        >
          <Text style={styles.titleText}>Time Log</Text>
          {this.renderAdminPrivilage()}
          <TouchableOpacity
            style={{
              position: "absolute",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              right: 20,
              bottom: 20,
            }}
            onPress={() => this.showLogoutPopup()}
          >
            <Icon name="logout" size={25} color="white" />
          </TouchableOpacity>
        </LinearGradient>
        <View
          style={{
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              paddingLeft: 10,
              fontWeight: "bold",
              fontSize: 24,
              color: "#aab3be",
            }}
          >
            {this.employeeDetails.full_name}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            marginTop: 10,
            backgroundColor: "#f6f8fa",
          }}
        >
          <AnimatedCircularProgress
            size={320}
            width={25}
            backgroundWidth={25}
            fill={this.state.progressBarPercentage}
            tintColor="#fe717f"
            tintColorSecondary="#fe717f"
            backgroundColor="#e8ecef"
            arcSweepAngle={240}
            rotation={240}
            lineCap="round"
          >
            {(fill) => (
              <View style={{ flex: 1, marginTop: 60, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "#aab3be", fontFamily: 'lucida grande' }}>
                  Working Time
                </Text>
                <Text style={{ fontSize: 60, marginTop: 5, fontFamily: 'lucida grande' }}>
                  {this.state.stopWatchCounter}
                </Text>
                <Text style={{ fontSize: 14, color: "#aab3be", fontFamily: 'lucida grande' }}>
                  Break Time
                </Text>
                <Text style={{ fontSize: 12, marginTop: 10 }}>
                  {this.state.stopWatchCounterBreakIn}
                </Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <View style={{ width: "100%", height: 60 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                height: 60,
                backgroundColor: "#e8ecef",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => this.navigateToAddActivity()}
            >
              <Icons name="post-add" size={25} color="#fe717f" />
              <Text
                style={{
                  fontSize: 18,
                  color: "#fe717f",
                  fontWeight: "bold",
                  paddingLeft: 5,
                }}
              >
                Add Activity
              </Text>
            </TouchableOpacity>
          </View>
          {this.state.showLiveTrackingButton && (
            <View style={{ width: "100%", height: 60, marginTop: 5 }}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  height: 60,
                  backgroundColor: "#e8ecef",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => this.navigateToLiveTracking()}
              >
                <IconImage name="location-arrow" size={25} color="#fe717f" />
                <Text
                  style={{
                    fontSize: 18,
                    color: "#fe717f",
                    fontWeight: "bold",
                    paddingLeft: 5,
                  }}
                >
                  View Trip
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {this.renderCheckBreakButton()}
        {/* {this.state.isGroupCheckIn === true ? (
          <CustomPopUp
            modalVisible={this.state.isInRadiusModalShow}
            modalCloseAction={this.modalCloseRadioDropDown}
            isVerifcationPopUp={false}
            modalReverifyAction={this.assignTaskToMemeber}
            items={this.state.getGroupMembersList}
            dropDownSelection={this.onSelectGroupMember}
            isDisabled={this.state.isDisabled}
          />
        ) : (
          <CustomModal
            modalVisible={this.state.isInRadiusModalShow}
            modalCloseAction={this.modalCloseAction}
            isVerifcationPopUp={false}
            submitAction={this.submitAction}
          />
        )} */}

{
              faceReportPopup === true ?
                (
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <View
                      style={{
                        margin: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                        shadowColor: "#000",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <View style={{
                        margin: 40,
                        backgroundColor: "white",
                        borderRadius: 20,
                        shadowColor: "#000",
                      }}>
                        <View style={{
                          borderRadius: 20,
                          flexDirection: "column",
                        }}>
                          <View styles={{
                            width: 100,
                            height: 100,
                            backgroundColor: "white",
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: "#000000",
                            shadowOffset: {
                              width: 0,
                              height: 4,
                            },
                            shadowRadius: 5,
                            shadowOpacity: 1.0,
                            borderColor: color.darkGrey,
                            borderWidth: 1,
                            top: -50,
                            zIndex: 5,
                            borderRadius: 50,
                            elevation: 5,
                          }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                marginHorizontal: 30,
                                justifyContent: "space-between",
                                marginBottom: 30,
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  flex: 1,
                                  marginRight: 10,
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  borderRadius: 20,
                                  borderWidth: 1,
                                  borderColor: color.pinkBorder,
                                  height: 40,
                                }}
                                onPress={() => modalCloseAction()}
                              >
                                <Text style={{
                                  textAlign: "center",
                                  fontSize: 17,
                                  fontWeight: "600",
                                  textTransform: "uppercase",
                                  color: color.pinkBorder,
                                  backgroundColor: "transparent",
                                }}>Cancel</Text>
                                {/* </LinearGradient> */}
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  marginLeft: 10,
                                  flex: 1,
                                  justifyContent: "center",
                                  alignSelf: "center",
                                }}
                                onPress={() => modalReverifyAction()}
                              >
                                <LinearGradient
                                  start={{ x: 0.5, y: 1.0 }}
                                  end={{ x: 0.0, y: 0.25 }}
                                  colors={["#fe717f", "#fa8576", "#f6976e"]}
                                  style={{
                                    width: "100%",
                                    height: 40,
                                    borderRadius: 24,
                                    alignSelf: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text style={{
                                    textAlign: "center",
                                    fontSize: 17,
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    color: color.white,
                                    backgroundColor: "transparent",
                                  }}>Reverify</Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>


                          </View>

                        </View>



                      </View>
                    </View>

                  </View>




                ) : null



            }

        <AlertPopup
          modalVisible={this.state.showAlertPopup}
          modalCloseAlertAction={this.modalCloseAlertAction}
          modalCheckOutAction={this.modalCheckOut}
          modalEndOfWorkAction={this.modalEndOfWork}
          modalLogoutAction={this.modalLogout}
          isCheckOutPopup={this.state.isCheckOutPopup}
        />
         <CustomPopUpModal
            modalVisible={this.state.showAlertIdNoFace}
            modalCloseAction={this.modalCloseAction}
            modalReverifyAction={this.modalReverifyAction}
            isVerifcationPopUp={true}
            isReverification={true}
          />
        <ErrorAlertPopup
          modalVisible={this.state.isForceCheckoutPopUp}
          modalCloseAlertAction={this.modalCloseAlertAction}
          modalCheckOutAction={this.modalCheckOut}
          modalEndOfWorkAction={this.modalEndOfWork}
          modalLogoutAction={this.modalforcecheckoutaction}
          isCheckOutPopup={this.state.isForceCheckoutPopUp}
        />
        {this.state.showLiveTrackingButton &&
          <ViewLiveTrackingScreen
            ref={(trackingObj) => this.trackRef = trackingObj}
            showTrackingModal={this.state.showTrackingModal}
            hideLiveTracking={this.hideLiveTracking}
            checkinDict={this.getCheckinDict()}
            parentRef={this.parentRef}
          ></ViewLiveTrackingScreen>
        }
      </View>
    );
      }
  }
}
