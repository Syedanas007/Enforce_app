import * as React from "react";
import {
  Platform,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import styles from "./style";
import color from "../../../Theme/Colors"
import { Helpers, Images, Colors } from "../../../Theme/index";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialTabs from "react-native-material-tabs";
import { apiService } from "../../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../../Services/Endpoint";
import RNRestart from 'react-native-restart';
import version from "../../../../package.json"
import {
  getData,
  LocalDBItems,
  storeData,
} from "../../../Services/LocalStorage";
import SegmentedControlTab from "react-native-segmented-control-tab";
import Axios from "axios";
import { CategortTeam } from "../../../Config";
import { Switch, Chip } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, { AnimatedRegion } from "react-native-maps";
import MapViewEnforce from "../../../Components/MapView";
import LocationText from "../../../Components/LocationText";
import GeoCoder from "../../../Components/GeoCoder";
import LocationFetcher from "../../LocationModule/index";
import UtilityHelper from "../../../Components/UtilityHelper";
import moment from "moment";
import { RNCamera } from "react-native-camera";
import { useCamera } from "react-native-camera-hooks"
import { searchFaceImages } from "../../../Services/AWSService";
import CustomPopUpModal from "../../../Components/CustomPopup";

import Loader from "../../../Components/Loader";
import ViewDescriptionPopupScreen from "./ViewDescriptionScreen";
import { Modalize } from "react-native-modalize";
import * as NavigationService from "../../../Services/NavigationService";
import Toast from "react-native-simple-toast";
import SwitchViewNew from "./SwitchView";
import * as Progress from 'react-native-progress';
import LocationError from "../../../Components/LocationError"
import ImagePicker from 'react-native-image-crop-picker'
import { getUUID } from "../../../helper";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
var LATITUDE = 29.95539;
var LONGITUDE = 78.07513;
const landmarkSize = 2;
var counter = 0;
var counter_face_data = 0;
const timerId = 0;
var faceimage;


export default class CheckInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      value: null,
      getprojectEmpList: [],
      progress: 0,
      timer_error: true,
      indeterminate: true,
      isInitialLoad: true,
      selectedTab: 2,
      getAllProjectData: [],
      getProjectList: [],
      findProjectDetails: null,
      getAllTeamData: [],
      UUID: "",
      isTeamClicked: false,
      isForceCheckIn: false,
      isOffice: true,
      isWorkFromHome: false,
      isManual: false,
      timefaceerror: true,
      isPlace: false,
      selectedIndex: 0,
      teamMultipleSelect: [],
      teamByCategoty: ["Department", "Designation", "Freelance", "Outsource"],
      getAllDepartmentList: [],
      getAllDesignationList: [],
      getAllFreelanceList: [],
      getAllOutsourceList: [],
      getEmployeListByCategory: [],
      reason_location: "",
      reason_face: "",
      Mobile_ID: "",
      selectedEmployee: {},
      addMemberList: [],
      isForcecheckout: false,
      jobColors: ["#f6976e", "#fe717f", "#fa8576"],
      placeColors: ["#8af2b4", "#57c690", "#47ba86", "#229b6f"],
      caseColors: ["#68cff4", "#4aa9d8", "#3d98cd", "#2c82bb"],
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }),
      locationName: this.props.route.params.locationDetails,
      locationDataInfo: this.props.route.params.locationDetails,
      manulLocation: "",
      teamId: [],
      teamMemberEmpId: [],
      manualAddress: "",
      officeAddressPlace: [],
      wfhAddress: "",
      isHaveEmployee: false,
      organisationDetails: {},
      isVerifyFace: false,
      flash: "off",
      zoom: 0,
      autoFocus: "on",
      depth: 0,
      type: "front",
      whiteBalance: "auto",
      ratio: "16:9",
      canDetectFaces: true,
      loading: false,
      showAlertIdNoFace: false,
      isLocationError: false,
      isLocationverification: false,
      isReverification: false,
      modalVisible: false,
      showCamerTimer: "",
      faces: [],
      enableStartButton: false,
      isLocationFetcherRequired: true,
      getSelectedProjectData: {},
      isViewDecription: false,
      isLoading: true,
      faceReportPopup: false,
      showProjectDetails: false

    };
    this.modalizeRef = React.createRef();
    (this.count = -1), (this.faceDetectedOrNot = false);
    this.timerCamera = 2;
    this.timer = null;
    (this.locationRegionObj = {
      LATITUDE,
      LONGITUDE,
    }),
      (this.cordinateObj = {
        latitude: LATITUDE,
        longitude: LONGITUDE,
      });
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
    (this.isProject = false), this.controller;
    this.scrollView;
    (this.geoCoder = new GeoCoder()),
      (this.selectedMemberVerify = null),
      (this.isGroupVerifyClicked = false),
      (this.stopTimer = false),
      (this.employeeDetails = null),
      (this.ModalOpen = false);
    this.isAllowtocheckin = false;
  }

  async componentDidMount() {
    counter_face_data = 0
    const { navigation } = this.props;
    this.getprojectEmpList();
    var locationObj = this.props.route.params.cordinateObj;

    if (locationObj) {
      this.cordinateObj.latitude = locationObj.latitude;
      this.cordinateObj.longitude = locationObj.longitude;
      // console.log(locationObj);
    }
    this.getEmployeeDetails();
    this.fetchAllProjectByOrgID();
    this.geoCoder.initiaLizeGeoCoder();
    this.UUID = await getUUID()
    // this.submitReport();
    this.errortimer();

    this._unsubscribe = this.props.navigation.addListener("blur", () => {
      if (this.locationFetcher != null) {
        this.locationFetcher.removeListners();
        this.locationFetcher = null;
      }
      this.state.isLocationFetcherRequired = false;
    });
    // console.log("Am here Version", version.version);

    const checkinInfo = { isOfficeChecin: false, isProjectCheckin: false };
    storeData(LocalDBItems.checkInInfo, checkinInfo);
    // this.animate();
  }

  // animate() {
  //   let progress = 0;
  //   this.setState({ progress });
  //   setTimeout(() => {
  //     this.setState({ indeterminate: false });
  //     setInterval(() => {
  //       progress += Math.random() / 5;
  //       if (progress > 1) {
  //         progress = 1;
  //       }
  //       this.setState({ progress });
  //     }, 500);
  //   }, 10000);
  // }

  componentWillUnmount() {
    clearInterval(this.errortimer);
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }

  /**
   * Get employee details
   */
  getEmployeeDetails = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    this.employeeDetails = { ...employeeDetails, isFaceVerified: false };
    this.timer_error = true;

  };



  /* For starting the timer and for the retry option, For the error stimulation we can change the timer to a lower value */
  errortimer = async () => {
    setTimeout(() => {
      if (this.timer_error == false || this.currentLocationObj != "") {
        // console.log("Timer_Error", this.timer_error)
        // console.log("Tim", counter)
        return;
      }
      else {
        if (counter < 2) {
          this.setState({ isLocationError: true, isLocationverification: true })
        }
        else {
          // console.log("Stucke")
          this.setState({ isLocationError: true })
          this.setState({ isLocationverification: false })
        }
      }
    }, 20000)
  }


  /* For the  Report sumbition while there is a error in the Check IN */
  ReqsubmitReport = async () => {
    this.setState({ isLoading: true });
    // console.log("Loading", this.state.isLoading);
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
    if (section_id_data.length == 0) {

      Alert.alert('Access Denied', 'You are not allowed to do the Location force CheckIn. Please Contact IT team', [
        {
          text: 'OK',
          onPress: () => this.props.navigation.goBack(),
          style: 'cancel'
        },]);
    }
    else {
      this.submitReport();
    }
  }
  submitReport = async () => {
    this.setState({ isLoading: true })
    this.setState({ isForceCheckIn: true })
    // this.getLoctionObj(location)
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const params = {
      org_id: employeeDetails.org_id,
      eventName: "Force_checkIn_Locationissue",
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
      this.reason_location = "Location Failure";
      if (this.timer != null) {
        clearInterval(this.timer);
      }
      this.flushtimer();
    }
    // console.log(params);
    const full_name = `${employeeDetails.full_name} Reported the Location problem successfully`;
    Toast.show(full_name, Toast.LONG);
  }
  /*For submitting the report of the Face regonossation issue */
  face_report = async () => {
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

      Alert.alert('Access Denied', 'You are not allowed to do the Face force CheckIn. Please Contact IT team', [
        {
          text: 'OK',
          onPress: () => this.props.navigation.goBack(),
          style: 'cancel'
        },]);
    }
    else {
      // console.log("Checin in the Second area");
      this.GetAllTimesheetListByEmployeeID();
      this.reason_face = "face Recogonisation Issue";
    }

  }

  /**
 * Show timer when face is detected
 */
  showTimerWhenFaceDetected() {
    this.timerCamera = 1;
    if (this.faceDetectedOrNot) {
      this.timer = setInterval(() => {
        this.timerCamera--;
        if (this.timerCamera === 0) {
          this.timerCamera = 1;
          if (this.isGroupVerifyClicked) {
            this.takePictureGroupCheckin();
          } else {
            this.takePicture();
          }
        }
      }, 1000);
    }
  }

  /**
   * Verify group check in when user select group
   * @param {string} base64
   */
  verifyGroupCheckin = async (base64) => {
    const { addMemberList } = this.state;
    if (this.selectedMemberVerify != null) {
      try {
        const name = this.selectedMemberVerify.full_name.replace(/ /g, "");
        const filename = `${name.toLowerCase()}.jpeg`;
        const collection_id = `face-collection-${name.toLowerCase()}`;
        var faceVerifyResult = await searchFaceImages(
          base64,
          filename,
          collection_id
        );
        // console.log(faceVerifyResult, "checking face result")
        const faceResult = faceVerifyResult.FaceMatches;
        if (
          faceVerifyResult.statusCode === 400 &&
          !this.state.showAlertIdNoFace
        ) {
          this.count += 1;
          if (!this.stopTimer) {
            this.takePictureGroupCheckin();
            if (this.count == 2) {
              this.count = -1;
              this.stopTimer = true;
              clearInterval(this.timer);
              if (this.modalizeRef.current) {
                this.ModalOpen = true;
                this.modalizeRef.current.open();
              }
            }
          }
        } else {
          if (faceResult && faceResult.length > 0 && faceResult[0].Face) {
            if (faceResult[0].Face.hasOwnProperty("ExternalImageId")) {
              if (
                faceResult[0].Face.ExternalImageId.includes(name.toLowerCase())
              ) {
                addMemberList.map((item) => {
                  if (item.id === this.selectedMemberVerify.id) {
                    item.isFaceVerified = true;
                  }
                });
                const isAllVerified = await addMemberList.every(
                  (item) => item.isFaceVerified
                );
                if (isAllVerified) {
                  this.addTimesheetCheckIn();
                } else {
                  this.stopTimer = true;
                  clearInterval(this.timer);
                  if (this.modalizeRef.current) {
                    this.ModalOpen = true;
                    this.modalizeRef.current.open();
                  }
                }
              } else {
                this.count += 1;
                if (!this.stopTimer) {
                  this.takePictureGroupCheckin();
                  if (this.count == 2) {
                    this.count = -1;
                    this.stopTimer = true;
                    clearInterval(this.timer);
                    if (this.modalizeRef.current) {
                      this.ModalOpen = true;
                      this.modalizeRef.current.open();
                    }
                  }
                }
              }
            } else {
              this.count += 1;
              if (!this.stopTimer) {
                this.takePictureGroupCheckin();
                if (this.count == 2) {
                  this.count = -1;
                  this.stopTimer = true;
                  clearInterval(this.timer);
                  if (this.modalizeRef.current) {
                    this.ModalOpen = true;
                    this.modalizeRef.current.open();
                  }
                }
              }
            }
          } else {
            this.count += 1;
            if (!this.stopTimer) {
              this.takePictureGroupCheckin();
              if (this.count == 2) {
                this.count = -1;
                this.stopTimer = true;
                clearInterval(this.timer);
                if (this.modalizeRef.current) {
                  this.ModalOpen = true;
                  this.modalizeRef.current.open();
                }
              }
            }
          }
        }
      } catch (err) { }
    }
  };

  /**
   * Take picture for group check in
   */
  takePictureGroupCheckin = async function () {
    if (this.camera) {
      let base64 = "";
      await this.camera
        .takePictureAsync({
          base64: true,
          quality: 0.5,
        })
        .then((data) => {
          base64 = data.base64;
          this.verifyGroupCheckin(data.base64);
          clearInterval(this.timer);
        });
      if (this.timer != null) {
        clearInterval(this.timer);
      }
    }
  };

  facetimeerror = () => {
    setTimeout(() => {
      // console.log("timer", this.timefaceerror);
      // if( )
      // {
      if (this.timefaceerror == false) {
        {
          Alert.alert('Request Timeout', 'You are Exceeded request timeout please Refresh the page', [
            {
              text: 'Refresh',
              onPress: () => this.onGoBackToPreviousCheckIn(),
              style: 'cancel'
            },]);
        }
      }
      else {
        // console.log("Timeout Passed")
      }
      // }
    }, 20000)
  }

  flushtimer = () => {
    if (timerId != null) {
      clearTimeout(timerId);
      // setTimerId(null);
    }
    this.verifyFaceRekcongition();
  };





  /**
   * Verify face and show timer
   * @returns
   */
  verifyFaceRekcongition = async () => {
    this.timer_error = false;
    console.log(this.isAllowtocheckin,"Allowed Checkin");
    // this.facetimeerror();
    // this.getLocationName();
    if (this.state.isForceCheckIn == false) {
      if (this.state.isOffice) {
        await this.onChoosePlaceOffice(true);
      }
      if (this.isAllowtocheckin == false && this.state.isOffice) {
        Alert.alert(
          "Office",
          "Your current location isn't matched with the office location"
        );
        return;
      }
    }
    if (this.state.isWorkFromHome && this.currentLocationObj.formatted_address == "") {
      Alert.alert(
        "Work from home",
        "Unable to fetch current location"
      );
      return;
    }
    if (this.isProjectCheckin==false) {
      Alert.alert(
        "Project Location",
        "Your current location isn't matched with the Project location"
      );
      return;
    }

    if (this.state.isManual && this.currentLocationObj.formatted_address === "") {

      Alert.alert("Error", "Enter reason or location");
      return;
    }
    const isHaveLocation = this.getLocationAddressForPlace()
    if (isHaveLocation === '') {
      Alert.alert("Error", "Location couldn't able to fetch location");
      return
    }
    this.setState({ isLoading: false })
    this.setState({ isVerifyFace: true }, () => {
      // this.animate();
      this.showTimerWhenFaceDetected();
    });

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

  handleSubmission = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const full_name = `${employeeDetails.full_name} Reported the Face Error problem successfully`;
    Toast.show(full_name, Toast.LONG);
    await this.addTimesheetForceCheckIn()
    await this.face_report()

  }

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
                eventName: "FaceReconization_CheckIn_Faliure",
                emp_id: employeeDetails.id,
                imgUrl: data.url,
                emp_Name: employeeDetails.full_name,
                createdDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
                modifiedDate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
              };
              const requestObj = {
                endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_FORCE_TIMESHEET_CHECKIN,
                type: "post",
                params: params,
              };
              // console.log(requestObj);
              const apiResponseData = await apiService(requestObj);
              if (apiResponseData.status == "200") {
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

                this.showTimerWhenFaceDetected();
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





  verifyFace = async (base64) => {
    // console.log(base64, this.count, counter_face_data, "COUNT CHECK")
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    console.log(employeeDetails, "CHECK!")
    const faceID = await getData(LocalDBItems.saveFaceIDData);
    try {
      const filename = `${employeeDetails.first_name.toLowerCase()}.jpeg`;
      const collection_id = `face-collection-${employeeDetails.first_name.toLowerCase()}`;
      var faceVerifyResult = await searchFaceImages(
        base64,
        filename,
        collection_id
      );
      console.log(faceVerifyResult, "check face result")
      const faceResult = faceVerifyResult.FaceMatches;
      // console.log(faceResult, "check face result 2")
      // console.log("counter face", counter_face_data)
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
                if (this.state.isTeamClicked) {
                  this.employeeDetails.isFaceVerified = true;
                  clearInterval(this.timer);
                  // First checkin with admin user and after verification show other members to verify face
                  if (this.modalizeRef.current) {
                    this.ModalOpen = true;
                    this.modalizeRef.current.open();
                  }
                } else {
                  // This is for single checkin
                  console.log("Sigle Checkin")
                  if (this.state.isForceCheckIn == true) {
                    console.log("Checin in the First area");
                    this.addTimesheetForceCheckIn();
                  }
                  else {
                    console.log("Datais hre");
                    this.addTimesheetCheckIn();
                  }
                }
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
    } catch (err) { }
  };
  /**
   * Add Time sheet API call after face is verified
   */
  addTimesheetCheckIn = async () => {
    let UUID = await getUUID()
    let checkIsInRadius = false;
    if (this.state.isOffice) {
      checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    }
    const {
      manulLocation,
      getSelectedProjectData,
      selectedTab,
      teamId,
      locationName,
      teamMemberEmpId,
      manualAddress,
      isOffice,
      isWorkFromHome,
      isManual,
      wfhAddress,
      organisationDetails,
    } = this.state;
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const locationtracking = await getData(LocalDBItems.isEmployeeLocationTrack)
    var timesheetSearchLocationViewModel = {};
    var timesheetCategoryViewModel = {};
    if (isOffice) {
      this.isProject = false;
      timesheetCategoryViewModel = {
        project_category_type: "Office",
        project_or_comp_id: organisationDetails.org_id,
        project_or_comp_name: organisationDetails.org_name,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: organisationDetails.entityLocation.geo_address,
        formatted_address: organisationDetails.entityLocation.formatted_address,
        lat: organisationDetails.entityLocation.lat,
        lang: organisationDetails.entityLocation.lang,
        street_number: organisationDetails.entityLocation.street_number,
        route: organisationDetails.entityLocation.route,
        locality: organisationDetails.entityLocation.locality,
        administrative_area_level_2:
          organisationDetails.entityLocation.administrative_area_level_2,
        administrative_area_level_1:
          organisationDetails.entityLocation.administrative_area_level_1,
        postal_code: organisationDetails.entityLocation.postal_code,
        country: organisationDetails.entityLocation.country,
        is_office: true,
        is_manual: false,
        is_wfh: false,
      };
    } else if (isWorkFromHome) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: this.currentLocationObj.formatted_address,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: false,
        is_wfh: true,
      };
      checkIsInRadius = true;
    } else if (isManual) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: manulLocation,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: manulLocation,
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: true,
        is_wfh: false,
      };
    } else {
      if (this.state.selectedTab === 2) {
        timesheetCategoryViewModel = {
          project_category_type: "Place",
          project_or_comp_id: null,
          project_or_comp_name: this.currentLocationObj.formatted_address,
          project_or_comp_type: "",
        };
        timesheetSearchLocationViewModel = {
          manual_address: "",
          geo_address: this.currentLocationObj.formatted_address,
          formatted_address: this.currentLocationObj.formatted_address,
          lat: this.currentLocationObj.latitude,
          lang: this.currentLocationObj.longitude,
          street_number: this.currentLocationObj.street_number,
          route: this.currentLocationObj.route,
          locality: this.currentLocationObj.locality,
          administrative_area_level_2: this.currentLocationObj
            .administrative_area_level_2,
          administrative_area_level_1: this.currentLocationObj
            .administrative_area_level_1,
          postal_code: this.currentLocationObj.postal_code,
          country: this.currentLocationObj.country,
          is_office: false,
          is_manual: false,
          is_wfh: false,
        };
      } else {
        timesheetCategoryViewModel = {
          project_category_type: "Job",
          project_or_comp_id: getSelectedProjectData.project_id,
          project_or_comp_name: getSelectedProjectData.project_name,
          project_or_comp_type: "",
        };
        timesheetSearchLocationViewModel = null;
      }
      if (getSelectedProjectData.project_id) {
        this.isProject = true;
      } else {
        this.isProject = false;
      }
      this.state.isOffice = false;
    }
    const params = {
      team_member_empid: teamMemberEmpId,
      teamid: teamId,
      check_in: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      is_app_check_In: true,
      checkin_tag_id: this.UUID,
      is_app_version: version.version,
      createdby: employeeDetails.full_name,
      checkin_user_empid: employeeDetails.id,
      is_inrange: checkIsInRadius,
      timesheetCategoryViewModel: timesheetCategoryViewModel,
      timesheetSearchLocationViewModel: timesheetSearchLocationViewModel,
      timesheetCurrentLocationViewModel: {
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
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
    console.log("Parms Data", params);
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_TIMESHEET_CHECKIN,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    console.log("responseData", apiResponseData)
    if (apiResponseData.status == "200") {
      if (this.timer != null) {
        clearInterval(this.timer);
      }
      const checkInCheckOutData = {
        checkin_out_project: params.timesheetCategoryViewModel.project_or_comp_name,
        checkin_out_jobType: params.timesheetCategoryViewModel.project_category_type
      }
      const checkinInfo = {
        isOfficeChecin: this.state.isOffice,
        isProjectCheckin: this.isProject,
      };
      storeData(LocalDBItems.CHECK_IN_OUT_DETAILS, checkInCheckOutData)
      storeData(LocalDBItems.checkInInfo, checkinInfo);
      if (locationtracking == false) {
        console.log(" Am stuck here help me");
        storeData(LocalDBItems.isEmployeeLocationTrack, false);
        this.locationFetcher.removeLocationUpdate();
      } else {
        console.log(" Am stuck  me");
        storeData(LocalDBItems.isEmployeeLocationTrack, true); //
      }
      this.onGoBackToPrevious();
      this.props.navigation.goBack();
      this.props.route.params.onGoBack();
      const employeeDetails = await getData(LocalDBItems.employeeDetails);
      const full_name = `${employeeDetails.full_name} checked in successfully`;
      Toast.show(full_name, Toast.LONG);
    }
  };

  /**
 * Add Time sheet API call after face is verified when forcecheckin
 */
  addTimesheetForceCheckIn = async () => {
    let UUID = await getUUID()
    const locationtracking = await getData(LocalDBItems.isEmployeeLocationTrack)
    console.log("Location tracking", locationtracking)
    console.log("superman", this.state.isOffice)
    let checkIsInRadius = true;
    // if (this.state.isOffice) {
    //   checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    // }
    const {
      manulLocation,
      getSelectedProjectData,
      selectedTab,
      teamId,
      locationName,
      teamMemberEmpId,
      manualAddress,
      isOffice,
      isWorkFromHome,
      isManual,
      wfhAddress,
      organisationDetails,
    } = this.state;
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    var timesheetSearchLocationViewModel = {};
    var timesheetCategoryViewModel = {};
    if (isOffice) {
      this.isProject = false;
      timesheetCategoryViewModel = {
        project_category_type: "Office",
        project_or_comp_id: organisationDetails.org_id,
        project_or_comp_name: organisationDetails.org_name,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: organisationDetails.entityLocation.geo_address,
        formatted_address: organisationDetails.entityLocation.formatted_address,
        lat: organisationDetails.entityLocation.lat,
        lang: organisationDetails.entityLocation.lang,
        street_number: organisationDetails.entityLocation.street_number,
        route: organisationDetails.entityLocation.route,
        locality: organisationDetails.entityLocation.locality,
        administrative_area_level_2:
          organisationDetails.entityLocation.administrative_area_level_2,
        administrative_area_level_1:
          organisationDetails.entityLocation.administrative_area_level_1,
        postal_code: organisationDetails.entityLocation.postal_code,
        country: organisationDetails.entityLocation.country,
        is_office: true,
        is_manual: false,
        is_wfh: false,
      };
    } else if (isWorkFromHome) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: this.currentLocationObj.formatted_address,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: false,
        is_wfh: true,
      };
      checkIsInRadius = true;
    } else if (isManual) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: manulLocation,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: manulLocation,
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: true,
        is_wfh: false,
      };
    } else {
      if (this.state.selectedTab === 2) {
        timesheetCategoryViewModel = {
          project_category_type: "Place",
          project_or_comp_id: null,
          project_or_comp_name: this.currentLocationObj.formatted_address,
          project_or_comp_type: "",
        };
        timesheetSearchLocationViewModel = {
          manual_address: "",
          geo_address: this.currentLocationObj.formatted_address,
          formatted_address: this.currentLocationObj.formatted_address,
          lat: this.currentLocationObj.latitude,
          lang: this.currentLocationObj.longitude,
          street_number: this.currentLocationObj.street_number,
          route: this.currentLocationObj.route,
          locality: this.currentLocationObj.locality,
          administrative_area_level_2: this.currentLocationObj
            .administrative_area_level_2,
          administrative_area_level_1: this.currentLocationObj
            .administrative_area_level_1,
          postal_code: this.currentLocationObj.postal_code,
          country: this.currentLocationObj.country,
          is_office: false,
          is_manual: false,
          is_wfh: false,
        };
      } else {
        timesheetCategoryViewModel = {
          project_category_type: "Job",
          project_or_comp_id: getSelectedProjectData.project_id,
          project_or_comp_name: getSelectedProjectData.project_name,
          project_or_comp_type: "",
        };
        timesheetSearchLocationViewModel = null;
      }
      if (getSelectedProjectData.project_id) {
        this.isProject = true;
      } else {
        this.isProject = false;
      }
      this.state.isOffice = false;
    }
    console.log(UUID, "UUID");
    const params = {
      team_member_empid: teamMemberEmpId,
      teamid: teamId,
      check_in: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      is_app_check_In: true,
      checkin_tag_id: this.UUID,
      is_app_version: version.version,
      createdby: employeeDetails.full_name,
      checkin_user_empid: employeeDetails.id,
      is_inrange: checkIsInRadius,
      timesheetCategoryViewModel: timesheetCategoryViewModel,
      timesheetSearchLocationViewModel: timesheetSearchLocationViewModel,
      timesheetCurrentLocationViewModel: {
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
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
    console.log("Parms Data", params);
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_TIMESHEET_CHECKIN,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    console.log("responseData", apiResponseData)
  };
  handleIndexChange = (index) => {
    switch (index) {
      case CategortTeam.DEPARTMENT_ID:
        this.setState(
          { getAllDepartmentList: [], getEmployeListByCategory: [] },
          () => {
            this.getAllDepartmentByOrgID();
          }
        );
      case CategortTeam.DESIGNATION_ID:
        this.setState(
          { getAllDepartmentList: [], getEmployeListByCategory: [] },
          () => {
            this.getAllDesignationByOrgID();
          }
        );
        break;
      case CategortTeam.FREELANCE_ID:
        this.getAllFreelanceByOrgID();
        break;
      case CategortTeam.OUTSOURCED_ID:
        this.getAllOutsourceByOrgID();
        break;
      default:
        break;
    }
    this.setState({
      ...this.state,
      selectedIndex: index,
    });
  };
  /**
   * Change navigation color
   * @returns colors
   */
  getNavigationColor = () => {
    switch (this.state.selectedTab) {
      case 0:
        return this.state.jobColors;
      case 1:
        return this.state.caseColors;
      case 2:
        return this.state.placeColors;
    }
  };
  /**
   * On select project organization
   * @param {*} value
   * @param {*} index
   * @param {*} data
   */
  onSelectProjectOrg = async (value, index, data) => {
    this.state.showProjectDetails = false;
    console.log("AM here");
    await this.findByProjectID(value);
    const getProjectList = this.state.findProjectDetails;
    this.setState({
      getSelectedProjectData: getProjectList,
      isOffice: false,
      isManual: false,
      isWorkFromHome: false,
    });
    if(getProjectList.status=="5"){
      this.setState({showProjectDetails: false,});
    }
    else{
      this.setState({showProjectDetails:true })}
      const checkinInfo = { isOfficeChecin: false, isProjectCheckin: true };
      storeData(LocalDBItems.checkInInfo, checkinInfo);
      let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
      if(checkIsInRadius){
        this.isProjectCheckin=true;
      }
      else{
        this.isProjectCheckin=false;
      }
      console.log("LOcation Radius",this.isProjectCheckin);
      console.log("<AM HERER",this.isAllowtocheckin);
    };


  onSelectedItemsChange(selectedItems) {
    const getAllTeamData = [...this.state.getAllTeamData];
    const getSelectedItemString = getAllTeamData.filter((itemData) => {
      return selectedItems.some((item) => {
        return itemData.value === item;
      });
    });
    // After select close the picker
    this.controller.close();
    this.setState({
      teamMultipleSelect: getSelectedItemString,
      teamId: selectedItems,
    });
  }

  onPressTeamAddTeam() {
    const selectedItems = [...this.state.teamId];
    selectedItems.forEach((value) => {
      this.findEmpDepartDesignByTeamID(value);
    });
  }

  findEmpDepartDesignByTeamID = async (selectedItems) => {
    let params = { id: selectedItems };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_EMP_DEPARTDESIGNBY_TEAMID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);

    if (apiResponseData) {
      const addMember = JSON.parse(apiResponseData);
      const addMemberVerification = addMember.map((item) => {
        return { ...item, isFaceVerified: false };
      });
      const updatedEmployee = addMemberVerification.filter(
        (item) => item.id !== this.employeeDetails.id
      );
      const data = [...this.state.addMemberList, ...updatedEmployee];
      const uniqueteam = this.getUnique(data, "id");
      var teammemberempId = [...this.state.teamMemberEmpId];
      if (uniqueteam.every((item) => item.id !== this.employeeDetails.id)) {
        await uniqueteam.map((item) => {
          teammemberempId.push(item.id);
        });
      }
      this.setState({
        addMemberList: uniqueteam,
        teamMemberEmpId: teammemberempId,
      });
    }
  };
  getUnique(arr, index) {
    const unique = arr
      .map((e) => e[index])
      // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)
      // eliminate the dead keys & store unique objects
      .filter((e) => arr[e])
      .map((e) => arr[e]);
    return unique;
  }

  onSelectEmployeeByCategory = async (value, index, data) => {
    const employee = this.state.getEmployeListByCategory[index];
    const currentUser = await getData(LocalDBItems.employeeDetails);
    const add = employee;
    add.isFaceVerified = false;
    const addmember = [...this.state.addMemberList];
    var isHaveEmployee = false;
    const addMemberVerification = addmember.map((item) => {
      return { ...item, isFaceVerified: false };
    });
    const indexEmployee = addMemberVerification.findIndex(
      (item) => item.id === employee.id
    );
    if (indexEmployee != -1) {
      isHaveEmployee = false;
      Toast.show("Employee already added", Toast.LONG);
    } else {
      isHaveEmployee = true;
    }
    this.setState({
      selectedEmployee: employee,
      isHaveEmployee: isHaveEmployee,
    });
  };

  onSelectCategory = (value, index, data) => {
    switch (this.state.selectedIndex) {
      case CategortTeam.DEPARTMENT_ID:
        if (index === 0) {
          this.getAllEmployeesFromOrgID();
        } else {
          const getDepartmentItem = this.state.getAllDepartmentList[index];
          this.findEmployeeForDepartment(getDepartmentItem, index);
        }
        break;
      case CategortTeam.DESIGNATION_ID:
        if (index === 0) {
          this.getAllEmployeesDesignationFromOrgID();
        } else {
          const getDesignationItem = this.state.getAllDesignationList[index];
          this.findEmployeeForDesignation(getDesignationItem, index);
        }
        break;
      case CategortTeam.FREELANCE_ID:
        break;
      case CategortTeam.OUTSOURCED_ID:
        break;
    }
  };
  getAllEmployeesFromOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { orgID: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_EMPLOYESS,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const parseDepartmentData = JSON.parse(apiResponseData);
      const getTeamEmployeeName = parseDepartmentData.map((value) => {
        return { ...value, label: value.full_name, value: value.full_name };
      });
      this.setState({ getEmployeListByCategory: getTeamEmployeeName });
    }
  };
  getAllEmployeesDesignationFromOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DESIGNTION_EMPLOYEE,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const parseDepartmentData = JSON.parse(apiResponseData);
      const getTeamEmployeeName = parseDepartmentData.map((value) => {
        return { ...value, label: value.full_name, value: value.full_name };
      });
      this.setState({ getEmployeListByCategory: getTeamEmployeeName });
    }
  };
  findByProjectID = async (projectId) => {
    let params = { id: projectId.value };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FINDBY_PROJECTID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      this.setState({ findProjectDetails: apiResponseData }, async () => {
        await storeData(LocalDBItems.selectedProjectDetails, apiResponseData);
        console.log("Location",LocalDBItems.selectedProjectDetails);
      });
    }
  };



  getprojectEmpList = async () => {
    try {
      const employeDetails = await getData(LocalDBItems.employeeDetails);
      let params = { id: employeDetails.id };
      const requestObj = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.FETCHALL_PROJECTBY_EMPID,
        type: "post",
        params: params,
      };
      const apiResponseData = await apiService(requestObj);
      const sampledata = JSON.parse(apiResponseData);
      if (sampledata) {
        const formattedProjects = sampledata.map(project => ({
          label: project.ProjectName,
          value: project.ProjectId,
        }));
        this.getprojectEmpList = formattedProjects;
      }
    } catch (error) {
      console.error('Error fetching project list:', error);
    }
  };

  findEmployeeForDepartment = async (departmentList, index) => {
    let params = { ID: departmentList.id };
    const employeeDetails = await getData(LocalDBItems.employeeDetails);

    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_DEPARTMENT_EMPLOYEE,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const parseDepartmentData = JSON.parse(apiResponseData);
      const data = parseDepartmentData.filter((item) => {
        return item.id != employeeDetails.Id;
      });
      const getTeamEmployeeName = data.map((value) => {
        return { ...value, label: value.full_name, value: value.full_name };
      });
      this.setState({ getEmployeListByCategory: getTeamEmployeeName });
    }
  };
  findEmployeeForDesignation = async (desigantionList, index) => {
    let params = { ID: desigantionList.id };
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_EMPLOYEE_DESIGNATION,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const parseDepartmentData = JSON.parse(apiResponseData);
      const data = parseDepartmentData.filter((item) => {
        return item.id != employeeDetails.Id;
      });
      const getTeamEmployeeName = data.map((value) => {
        return { ...value, label: value.full_name, value: value.full_name };
      });
      this.setState({ getEmployeListByCategory: getTeamEmployeeName });
    }
  };

  GetAllTimesheetListByEmployeeID = async () => {
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
      type: "checkin",
      empid: employeDetails.id,
      timesheet_id: lastest_time,
      ondate: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      check_in: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      checkin_lat: this.currentLocationObj.latitude,
      checkin_lang: this.currentLocationObj.longitude,
      check_out: null,
      checkout_lat: null,
      checkout_lang: null,
      levelone_roleId: section_id_data[0].approver1_roleId,
      isapproved_levelone: false,
      leveltwo_roleId: section_id_data[0].approver2_roleId,
      isapproved_leveltwo: false,
      reason_name: this.reason_location + this.reason_face,
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
    const checkInCheckOutData = {
      checkin_out_project: null,
      checkin_out_jobType: null
    }
    const checkinInfo = {
      isOfficeChecin: this.state.isOffice,
      isProjectCheckin: this.isProject,
    };
    storeData(LocalDBItems.CHECK_IN_OUT_DETAILS, checkInCheckOutData)
    storeData(LocalDBItems.checkInInfo, checkinInfo);
    if (locationtracking == false) {
      // console.log(" Am stuck here help me");
      storeData(LocalDBItems.isEmployeeLocationTrack, false);
      this.locationFetcher.removeLocationUpdate();
    } else {
      // console.log(" Am stuck  me");
      storeData(LocalDBItems.isEmployeeLocationTrack, true); //
    }
    this.onGoBackToPrevious();
    this.props.navigation.goBack();
    this.props.route.params.onGoBack();
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    const full_name = `${employeeDetails.full_name} Force checked in successfully`;
    Toast.show(full_name, Toast.LONG);

  }




  fetchAllProjectByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    const organisationDetails = await getData(LocalDBItems.organizationDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FETCHALL_PROJECTBY_ORGID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getProjectData = JSON.parse(apiResponseData);
      // console.log("DataProject",apiResponseData)
      const projectName = await getProjectData.map((value) => {
        return {
          ...value,
          label: value.project_name,
          value: value.project_name,
        };
      });
      const officeAddress = {
        ...organisationDetails,
        label: organisationDetails.org_name,
        value: organisationDetails.org_id,
      };
      const employeeTeam = [...this.state.teamMemberEmpId];
      employeeTeam.push(orgId.id);
      let officeArray = [officeAddress].map(function (item, index) {
        return { label: item.org_name, value: index };
      });

      this.setState({
        getAllProjectData: getProjectData,
        getProjectList: projectName,
        organisationDetails: officeAddress,
        officeAddressPlace: officeArray,
        teamMemberEmpId: employeeTeam,
      });
      console.log("DataName", projectName.filter())

    }
  };
  onPressFindTeamByOrgID = async () => {
    if (!this.state.isTeamClicked) {
      this.setState({ isTeamClicked: true });
      const orgId = await getData(LocalDBItems.employeeDetails);
      let params = { orgID: orgId.org_id };
      const requestObj = {
        endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_TEAMSBY_ORGID,
        type: "post",
        params: params,
      };
      const apiResponseData = await apiService(requestObj);
      if (apiResponseData) {
        const teamName = await apiResponseData.map((value) => {
          return { label: value.team_name, value: value.id };
        });
        this.setState({ getAllTeamData: teamName });
        this.handleIndexChange(0);
      }
    } else {
      this.setState({ isTeamClicked: false, getAllTeamData: [] });
    }
  };
  getAllDepartmentByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DEPARTMENT_EMPBY_ORG_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    const newDepartment = [];
    if (apiResponseData) {
      newDepartment.push({ dep_name: "All" });
      newDepartment.push(...apiResponseData);
      const getDepartmentName = await newDepartment.map((value) => {
        return { ...value, label: value.dep_name, value: value.dep_name };
      });
      this.setState({ getAllDepartmentList: getDepartmentName });
    }
  };
  getAllDesignationByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { OrgID: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DESIGNATION_ByORG_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    const newDesignation = [];
    if (apiResponseData) {
      const data = JSON.parse(apiResponseData);
      newDesignation.push({ designation_name: "All" });
      newDesignation.push(...data);
      const newDesignationName = await newDesignation.map((value) => {
        return {
          ...value,
          label: value.designation_name,
          value: value.designation_name,
        };
      });
      this.setState({ getAllDesignationList: newDesignationName });
    }
  };
  findDesignationByDepID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint:
        BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DESIGNATION_EMPBY_DEPT_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getDesignationName = await apiResponseData.map((value) => {
        return { ...value, label: value.dep_name, value: value.dep_name };
      });
      this.setState({ getEmployeListByCategory: getDepartmentName });
    }
  };
  getAllFreelanceByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { orgID: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_FREELANCE_EMPBY_ORG_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData != null) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.dep_name, value: value.dep_name };
      });
      this.setState({ getAllFreelanceList: getDepartmentName });
    }
  };
  getAllOutsourceByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { orgID: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_OUTSOURCED_EMPBY_ORG_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData != null) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.dep_name, value: value.dep_name };
      });
      this.setState({ getAllOutsourceList: getDepartmentName });
    }
  };
  setSelectedTab(value) {
    this.setState({
      selectedTab: value,
      enableStartButton: value === 0 ? true : false,
    });
    switch (value) {
      case 0:
        this.renderJobTabView();
        this.isAllowtocheckin = true;
      case 1:
        this.isAllowtocheckin = true;
        this.state.showProjectDetails = false;
        this.renderCaseTabView();
      case 2:
        this.state.showProjectDetails = false;
        this.renderPlaceTabView();
        this.setState({ isOffice: true, getSelectedProjectData: {} })
        this.onChoosePlaceOffice(true)
    }
  }
  clearWhileTap() {
    this.state.getAllTeamData = [];
    this.state.isTeamClicked = false;
  }
  onSelectOfficeLocation = (item, index) => {
    let officeAddress = this.state.officeAddressPlace[index];
    this.setState({ organisationDetails: officeAddress });
  };
  onPressAddMember = async () => {
    const selectedEmployee = this.state.selectedEmployee;
    if (selectedEmployee != null) {
      var addmember = [...this.state.addMemberList];
      addmember.push(selectedEmployee);
      const addMemberVerification = addmember.map((item) => {
        return { ...item, isFaceVerified: false };
      });
      const updatedEmployee = addMemberVerification.filter(
        (item) => item.id !== this.employeeDetails.id
      );
      const uniqueteam = this.getUnique(updatedEmployee, "id");
      const teamMemberEmpId = [...this.state.teamMemberEmpId];
      addMemberVerification.map((item, index) => {
        if (item.id != selectedEmployee) {
          addmember.push(selectedEmployee);
          teamMemberEmpId.push(item.id);
        }
      });
      const uniqueNames = teamMemberEmpId.filter(
        (val, id, array) => array.indexOf(val) == id
      );
      this.setState({
        addMemberList: uniqueteam,
        selectedEmsployee: null,
        teamMemberEmpId: uniqueNames,
      });
    }
  };


  renderSegmentWithSelectedTab() {
    const {
      selectedIndex,
      getAllDepartmentList,
      getAllDesignationList,
      getAllFreelanceList,
      getAllOutsourceList,
    } = this.state;
    var selectedTabArray = [];
    var selectedTabString = "";
    switch (selectedIndex) {
      case 0:
        selectedTabArray = getAllDepartmentList;
        selectedTabString = "Department";
        break;
      case 1:
        selectedTabArray = getAllDesignationList;
        selectedTabString = "Designation";
        break;
      case 2:
        selectedTabArray = getAllFreelanceList;
        selectedTabString = "Freelance";
        break;
      case 3:
        selectedTabArray = getAllOutsourceList;
        selectedTabString = "Outsource";
        break;
    }
    return (
      <View
        style={{
          flex: 1,
          ...(Platform.OS !== "android" && {
            zIndex: 20,
          }),
        }}
      >
        <DropDownPicker
          zIndex={5000}
          items={selectedTabArray}
          placeholder={"Select " + selectedTabString}
          searchable={true}
          searchablePlaceholder={"Search for " + selectedTabString}
          searchablePlaceholderTextColor="gray"
          seachableStyle={{}}
          containerStyle={{ height: 80 }}
          dropDownInputContainer={styles.dropDownInputContainer}
          style={styles.dropDownContainer}
          itemStyle={{
            justifyContent: "flex-start",
            alignItems: "center",
            height: 40,
          }}
          labelStyle={{
            fontSize: 16,
            textAlign: "left",
            color: "#000",
          }}
          dropDownStyle={{ marginTop: 25, backgroundColor: "#fcfcfc" }}
          onChangeItem={this.onSelectCategory}
        />
      </View>
    );
  }
  renderSegmentTab() {
    const { teamByCategoty, getEmployeListByCategory } = this.state;
    return (
      <View style={{ flex: 1, marginTop: 20, marginHorizontal: 24 }}>
        <SegmentedControlTab
          tabsContainerStyle={styles.tabsContainerStyle}
          tabStyle={styles.tabStyle}
          tabTextStyle={styles.tabTextStyle}
          activeTabStyle={styles.activeTabStyle}
          activeTabTextStyle={styles.activeTabTextStyle}
          selectedIndex={this.state.selectedIndex}
          values={teamByCategoty}
          onTabPress={this.handleIndexChange}
        />

        {this.renderSegmentWithSelectedTab()}

        <View
          style={{
            flex: 1,
            ...(Platform.OS !== "android" && {
              zIndex: 5,
            }),
          }}
        >
          <DropDownPicker
            zIndex={4000}
            items={getEmployeListByCategory}
            placeholder="Add Members"
            searchable={true}
            searchablePlaceholder="Search members"
            searchablePlaceholderTextColor="gray"
            seachableStyle={{}}
            containerStyle={{ height: 80 }}
            dropDownInputContainer={styles.dropDownInputContainer}
            style={styles.dropDownContainer}
            itemStyle={{
              justifyContent: "flex-start",
              alignItems: "center",
              height: 40,
            }}
            labelStyle={{
              fontSize: 16,
              textAlign: "left",
              color: "#000",
            }}
            dropDownStyle={{ marginTop: 25, backgroundColor: "#fcfcfc" }}
            onChangeItem={this.onSelectEmployeeByCategory}
          />
        </View>
        {this.state.isHaveEmployee ? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 15,
            }}
            onPress={() => this.onPressAddMember()}
          >
            <Icon
              name="plus-circle"
              style={{ padding: 5 }}
              size={15}
              color="red"
            />
            <Text style={{ textAlign: "right" }}>Add</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: 15,
              opacity: 0.5,
            }}
          >
            <Icon
              name="plus-circle"
              style={{ padding: 5 }}
              size={15}
              color="red"
            />
            <Text style={{ textAlign: "right" }}>Add</Text>
          </TouchableOpacity>
        )}
        <View
          style={{ height: 1, flex: 1, backgroundColor: "gray", marginTop: 10 }}
        ></View>
        {this.renderMembersFlatList()}
      </View>
    );
  }
  renderMembersFlatList() {
    const { teamId, addMemberList } = this.state;
    const uniqueteam = this.getUnique(addMemberList, "id");
    if (uniqueteam.length > 0) {
      return (
        <View>
          <FlatList
            style={{ marginTop: 10 }}
            data={uniqueteam}
            renderItem={({ item, index }) => (
              <View style={styles.addTeamMemberContainer}>
                <View style={styles.projectTopContainer}>
                  <View style={styles.addMemberNameContainer}>
                    <Text style={styles.addHeaderText}>Name</Text>
                    <Text style={styles.addValueText}>{item.full_name}</Text>
                  </View>
                  <View style={styles.addMemberDesignationContainer}>
                    <Text style={styles.addHeaderText}>Designation</Text>
                    <Text style={styles.addValueText}>
                      {item.designation_name}
                    </Text>
                  </View>
                  <View style={styles.addMemberTypeContainer}>
                    <Text style={styles.addHeaderText}>Type</Text>
                    <Text style={styles.addValueText}>
                      {item.employee_type_name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addMemberTypeContainer,
                      {
                        flex: 0.2,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => this.removeEmployee(item, index)}
                  >
                    <Icon name="trash-o" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          ></FlatList>
        </View>
      );
    } else {
      return <View style={{ height: 200 }}></View>;
    }
  }
  removeEmployee = (item, index) => {
    const { addMemberList } = this.state;
    var array = [...addMemberList];
    array.splice(index, 1);
    var removedTeamMember = this.state.teamMemberEmpId.filter((member) => {
      return member !== item.id;
    });
    this.setState({ addMemberList: array, teamMemberEmpId: removedTeamMember });
  };
  isEmptyObject(obj) {
    for (var name in obj) {
      return false;
    }
    return true;
  }
  renderTeamSwitch() {
    const { isTeamClicked, getSelectedProjectData, selectedTab } = this.state;
    var isDisabled = this.isEmptyObject(getSelectedProjectData);
    if (selectedTab != 0) {
      isDisabled = false;
    }
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.teamText}>Teams</Text>
          <Switch
            disabled={isDisabled}
            value={isTeamClicked}
            color={"#fe717f"}
            onValueChange={this.onPressFindTeamByOrgID}
          />
        </View>
        {isTeamClicked && (
          <TouchableOpacity
            style={{
              width: "50%",
              borderColor: "black",
              borderWidth: 1,
              borderRadius: 8,
              flexDirection: "row",
              marginHorizontal: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => this.navigateToAddNewEmployee(true)}
          >
            <Icon
              name="plus-circle"
              style={{ padding: 5 }}
              size={15}
              color="red"
            />
            <Text style={{ textAlign: "right" }}>Add New Employee</Text>
          </TouchableOpacity>
        )}
      </View>
    );
    // }
  }
  removeselectedTeam = (item) => {
    const { teamMultipleSelect, teamId, addMemberList, teamMemberEmpId } = this.state;
    var array = [...teamMultipleSelect]; // make a separate copy of the array
    var removeTeamId = [...teamId];
    const removeMemberList = addMemberList.filter?.(item => !teamMemberEmpId.includes(item.id))
    const removedTeam = removeTeamId.filter((id) => id != item.value);
    var index = array.indexOf(item);
    this.controller.removeItem(item.value, {
      changeDefaultValue: true, // Unselect if the removed item is the selected item
    });
    if (index !== -1) {
      array.splice(index, 1);
      this.setState({ teamMultipleSelect: array, teamId: removedTeam });
    }
  };
  onFaceDetectionError = (error) => { };
  dismissAndGoBack() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }

    this.setState({ isVerifyFace: false, showAlertIdNoFace: false });
  }
  closeModal() {
    if (this.modalizeRef.current) {
      this.ModalOpen = false;
      this.modalizeRef.current.close();
    }
  }
  renderRegistrationSuccessPopup() {
    const { isTeamClicked } = this.state;
    if (isTeamClicked) {
      return (
        <Modalize ref={this.modalizeRef} adjustToContentHeight={true}>
          {this.renderContent()}
        </Modalize>
      );
    }
  }
  onPressRegisterFace = async (member) => {
    this.closeModal();
    this.selectedMemberVerify = member;
    this.isGroupVerifyClicked = true;
    this.stopTimer = false;
    this.showTimerWhenFaceDetected();
  };
  renderGroupInSwitch(member) {
    switch (member.is_face_recog) {
      case true:
        return (
          <View
            style={{
              marginBottom: 20,
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Image
              style={[
                styles.profileImage,
                { borderColor: member.isFaceVerified ? "green" : "red" },
              ]}
              resizeMode="cover"
              source={Images.avatar}
            ></Image>
            {member.isFaceVerified ? (
              //  <IconImage name="md-shield-checkmark-sharp" size={20} color="green" />
              <Image
                style={[styles.checkedIcon, { tintColor: "green" }]}
                source={Images.checkedIcon}
                resizeMode={"contain"}
              />
            ) : (
              <Image
                style={[styles.checkedIcon, { tintColor: "red" }]}
                source={Images.redError}
                resizeMode={"contain"}
              />
            )}
          </View>
        );

      case false:
        return (
          <View
            style={{
              marginBottom: 20,
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Image
              style={[styles.profileImage, { borderColor: "red" }]}
              resizeMode="cover"
              source={Images.avatar}
            ></Image>
            <Image
              style={styles.checkedIcon}
              source={Images.redError}
              resizeMode={"contain"}
            />
          </View>
        );

      default:
        return (
          <View
            style={{
              marginBottom: 20,
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Image
              style={[styles.profileImage, { borderColor: "red" }]}
              resizeMode="cover"
              source={Images.avatar}
            ></Image>
            <Image
              style={styles.checkedIcon}
              source={Images.yellowError}
              resizeMode={"contain"}
            />
          </View>
        );
    }
  }
  renderTeamListGroupCheckin() {
    const { addMemberList, isTeamClicked, teamMemberEmpId } = this.state;
    const uniqueteam = this.getUnique(addMemberList, "id");
    if (uniqueteam.every((item) => item.id !== this.employeeDetails.id)) {
      uniqueteam.push(this.employeeDetails);
    }
    return (
      <View>
        {uniqueteam.map((member, index) => {
          return (
            <View key={index} style={{ flexDirection: "row", marginTop: 20 }}>
              {this.renderGroupInSwitch(member)}
              <View
                style={{
                  width: "50%",
                  marginLeft: 10,
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Text style={{ fontSize: 21, color: Colors.darkGrey }}>
                  {member.full_name}
                </Text>
              </View>
              {member.is_face_recog === null ||
                member.is_face_recog === false ? (
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    marginRight: 20,
                    alignItems: "flex-end",
                  }}
                  onPress={() => this.navigateToAddNewEmployee(false, member)}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={this.state.caseColors}
                    style={[
                      styles.checkInButton,
                      { height: 40, paddingHorizontal: 10 },
                    ]}
                  >
                    <Text style={[styles.checkInText, { fontSize: 14 }]}>
                      {"Register Face"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  {member.isFaceVerified ? (
                    <View
                      style={{
                        justifyContent: "center",
                        marginRight: 20,
                        alignItems: "flex-end",
                      }}
                    >
                      <LinearGradient
                        start={{ x: 0.5, y: 1.0 }}
                        end={{ x: 0.0, y: 0.25 }}
                        colors={this.state.placeColors}
                        style={[
                          styles.checkInButton,
                          { height: 40, paddingHorizontal: 10 },
                        ]}
                      >
                        <Text style={[styles.checkInText, { fontSize: 14 }]}>
                          {"Verified"}
                        </Text>
                      </LinearGradient>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={{
                        justifyContent: "center",
                        width: "25%",
                        marginRight: 20,
                        alignItems: "flex-end",
                      }}
                      onPress={() => this.onPressRegisterFace(member)}
                    >
                      <LinearGradient
                        start={{ x: 0.5, y: 1.0 }}
                        end={{ x: 0.0, y: 0.25 }}
                        colors={this.state.caseColors}
                        style={[
                          styles.checkInButton,
                          { height: 40, paddingHorizontal: 10 },
                        ]}
                      >
                        <Text style={[styles.checkInText, { fontSize: 14 }]}>
                          {"Verify"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          );
        })}
      </View>
    );
  }
  navigateToAddNewEmployee = async (isAddEmployee, member) => {
    const {
      findProjectDetails,
      getSelectedProjectData,
      selectedTab,
      teamId,
      locationName,
      manulLocation,
      teamMemberEmpId,
      manualAddress,
      isOffice,
      isWorkFromHome,
      isManual,
      wfhAddress,
      organisationDetails,
    } = this.state;
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    var timesheetSearchLocationViewModel = {};
    var timesheetCategoryViewModel = {};
    if (isOffice) {
      this.isProject = false;
      timesheetCategoryViewModel = {
        project_category_type: "Office",
        project_or_comp_id: organisationDetails.org_id,
        project_or_comp_name: organisationDetails.org_name,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: organisationDetails.entityLocation.geo_address,
        formatted_address: organisationDetails.entityLocation.formatted_address,
        lat: organisationDetails.entityLocation.lat,
        lang: organisationDetails.entityLocation.lang,
        street_number: organisationDetails.entityLocation.street_number,
        route: organisationDetails.entityLocation.route,
        locality: organisationDetails.entityLocation.locality,
        administrative_area_level_2:
          organisationDetails.entityLocation.administrative_area_level_2,
        administrative_area_level_1:
          organisationDetails.entityLocation.administrative_area_level_1,
        postal_code: organisationDetails.entityLocation.postal_code,
        country: organisationDetails.entityLocation.country,
        is_office: true,
        is_manual: false,
        is_wfh: false,
      };
    } else if (isWorkFromHome) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: this.currentLocationObj.formatted_address,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: organisationDetails.entityLocation.geo_address,
        formatted_address: organisationDetails.entityLocation.formatted_address,
        lat: organisationDetails.entityLocation.lat,
        lang: organisationDetails.entityLocation.lang,
        street_number: organisationDetails.entityLocation.street_number,
        route: organisationDetails.entityLocation.route,
        locality: organisationDetails.entityLocation.locality,
        administrative_area_level_2:
          organisationDetails.entityLocation.administrative_area_level_2,
        administrative_area_level_1:
          organisationDetails.entityLocation.administrative_area_level_1,
        postal_code: organisationDetails.entityLocation.postal_code,
        country: organisationDetails.entityLocation.country,
        is_office: false,
        is_manual: false,
        is_wfh: true,
      };
      // checkIsInRadius = true
    } else if (isManual) {
      timesheetCategoryViewModel = {
        project_category_type: "Place",
        project_or_comp_id: null,
        project_or_comp_name: manulLocation,
        project_or_comp_type: null,
      };
      timesheetSearchLocationViewModel = {
        manual_address: manulLocation,
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: true,
        is_wfh: false,
      };
    } else {
      this.isProject = true;
      this.state.isOffice = false;
      timesheetCategoryViewModel = {
        project_category_type: "Job",
        project_or_comp_id: getSelectedProjectData.project_id,
        project_or_comp_name: getSelectedProjectData.project_name,
        project_or_comp_type: "",
      };
      timesheetSearchLocationViewModel = {
        manual_address: "",
        geo_address: this.currentLocationObj.formatted_address,
        formatted_address: this.currentLocationObj.formatted_address,
        lat: this.currentLocationObj.latitude,
        lang: this.currentLocationObj.longitude,
        street_number: this.currentLocationObj.street_number,
        route: this.currentLocationObj.route,
        locality: this.currentLocationObj.locality,
        administrative_area_level_2: this.currentLocationObj
          .administrative_area_level_2,
        administrative_area_level_1: this.currentLocationObj
          .administrative_area_level_1,
        postal_code: this.currentLocationObj.postal_code,
        country: this.currentLocationObj.country,
        is_office: false,
        is_manual: false,
        is_wfh: false,
      };
    }
    const params = {
      team_member_empid: teamMemberEmpId,
      teamid: teamId,
      check_in: moment(new Date()).utc(true).format("MM/DD/YYYY hh:mm A"),
      createdby: employeeDetails.full_name,
      is_inrange: false,
      timesheetCategoryViewModel: timesheetCategoryViewModel,
      timesheetSearchLocationViewModel: timesheetSearchLocationViewModel,
      timesheetCurrentLocationViewModel: {
        geo_address: this.currentLocationObj.formatted_address,
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
    if (isAddEmployee) {
      NavigationService.navigate("AddEmployeeScreen", {
        params: params,
        user: member,
        onGoBack: () => this.refresh(member),
      });
    } else {
      this.setState({ isVerifyFace: false }, () => {
        NavigationService.navigate("AddFaceRegistrationScreen", {
          params: params,
          user: member,
          onGoBack: () => this.refresh(member),
        });
      });
    }
  };
  refresh = (member) => {
    const { addMemberList } = this.state;
    addMemberList.map((item) => {
      if (item.id === member.id) {
        return (item.is_face_recog = true);
      }
    });
    this.setState({ addMemberList: addMemberList });
  };
  renderContent = () => (
    <View style={styles.content}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Text style={{ fontSize: 25, textAlign: "center" }}>Group Checkin</Text>
      </View>
      <TouchableOpacity
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          right: 5,
          top: 25,
        }}
        onPress={() => this.closeModal()}
      >
        <Image
          style={[styles.cancelImage, { tintColor: "grey" }]}
          resizeMode="cover"
          source={Images.cancel}
        ></Image>
      </TouchableOpacity>
      {this.renderTeamListGroupCheckin()}
      <View style={{ marginTop: 20, flexDirection: "column" }}></View>
    </View>
  );
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
            <Icon name="angle-left" size={30} color="white" />
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
        {canDetectFaces && this.renderLandmarks()}
      </RNCamera>
    );
  }
  // Face detection
  facesDetected = ({ faces }) => {
    if (faces.length > 0) {
      // If team is selected
      if (this.state.isTeamClicked) {
        // check if face is detected to false and group checkin verify button
        if (!this.faceDetectedOrNot && this.isGroupVerifyClicked) {
          this.faceDetectedOrNot = true;
          if (!this.ModalOpen) {
            this.showTimerWhenFaceDetected();
          }
        } else {
          // First we need to verify the admin user when group checkin
          if (!this.faceDetectedOrNot) {
            this.faceDetectedOrNot = true;
            if (!this.stopTimer) {
              this.showTimerWhenFaceDetected();
            }
          }
        }
        this.setState({
          faces,
          faceDetectedOrNot: true,
          showAlertIdNoFace: false,
        });
      } else {
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
    } else {
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
  renderFace = ({ bounds, faceID, rollAngle, yawAngle }) => (
    <View
      key={faceID}
      transform={[
        { perspective: 600 },
        { rotateZ: `${rollAngle.toFixed(0)}deg` },
        { rotateY: `${yawAngle.toFixed(0)}deg` },
      ]}
      style={[
        styles.face,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}
    >
      <Text style={styles.faceText}>ID: {faceID}</Text>
      <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
      <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
    </View>
  );

  renderLandmarksOfFace(face) {
    const renderLandmark = (position) =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return (
      <View key={`landmarks-${face}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    );
  }
  renderLandmarks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>
  );
  onViewDescription = () => {
    this.setState({ isViewDecription: true });
  };
  renderChipSelectedTeam() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          width: windowWidth - 20,
          flexWrap: "wrap",
        }}
      >
        {this.state.teamMultipleSelect.map((item, index) => {
          return (
            <View
              style={{
                margin: 5,
                flexWrap: "wrap",
              }}
            >
              <Chip
                key={index}
                onClose={() => this.removeselectedTeam(item)}
                mode="outlined" //changing display mode, default is flat.
                height={30} //give desirable height to chip
                textStyle={{ color: "white", fontSize: 15 }} //label properties
                style={{
                  backgroundColor: "#c5c5c5",
                  alignItems: "center",
                  justifyContent: "center",
                }} //display diff color BG
              >
                {item.label}
              </Chip>
            </View>
          );
        })}
      </View>
    );
  }
  renderJobTabView() {
    const { getprojectEmpList, getSelectedProjectData, open, value, showProjectDetails } = this.state;
    return (
      <View
        style={{
          marginTop: 5,
          ...(Platform.OS !== "android" && {
            zIndex: 10,
          }),
        }}
      >
        <DropDownPicker
          open={open}
          value={value}
          items={this.getprojectEmpList}
          setOpen={(open) => this.setState({ open })}
          setValue={(value) => this.setState({ value })}
          setItems={(items) => this.setState({ getprojectEmpList: items })}
          searchable={true}
          searchablePlaceholder="Search for project"
          searchablePlaceholderTextColor="gray"
          containerStyle={{ height: 80, marginHorizontal: 16 }}
          dropDownInputContainer={styles.dropDownInputContainer}
          style={styles.dropDownContainer}
          onChangeItem={this.onSelectProjectOrg}
          itemStyle={{ 
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 40, // Adjust height as needed
          }}
          labelStyle={{
            fontSize: 16,
            textAlign: 'left',
            color: '#000',
          }}
          dropDownStyle={{
            paddingBottom: 25,
            backgroundColor: '#fcfcfc',
          }}
              />
        {showProjectDetails ? (
              <View style={styles.detailsContainer}>
                <Text style={styles.mainHeading}>Project Details</Text>

                <View style={styles.row}>
                  <Text style={styles.label}>Customer Name:</Text>
                  <Text style={styles.value}>{getSelectedProjectData.entityCustomer.cst_name}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Customer Phone:</Text>
                  <Text style={styles.value}>{getSelectedProjectData.entityCustomer.phone}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Site Location:</Text>
                  <Text style={styles.value}>{getSelectedProjectData.entityLocation.formatted_address}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Project Start Date:</Text>
                  <Text style={styles.value}>{moment(getSelectedProjectData.start_date, "M/D/YYYY h:mm:ss A").format("MMM D, YYYY")}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Description</Text>
                  <TouchableOpacity onPress={() => this.onViewDescription()} style={styles.iconButton}>
                    <Icon name="eye" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.messageContainer}>
                <Text style={styles.message}>Project Details are not available</Text>
              </View>
            )}
            </View>

          );
        }


  onChoosePlaceOffice = async (value) => {
    console.log("inside place office");
    const { organisationDetails } = this.state;
    let isAllowed = organisationDetails.entityLocationRadius.is_allowed;
    let checkIsInRadius = await this.locationFetcher.isLocationInRadius();
    if (isAllowed && checkIsInRadius) {
      this.isAllowtocheckin = true;

    } else {
      this.isAllowtocheckin = value === true ? false : true;
    }
    this.setState({
      isOffice: true,
      isWorkFromHome: false,
      isManual: false,
      isPlace: false,
    });
  };
  onChoosePlaceWrkFrmHome = (value) => {
    this.isAllowtocheckin = true;
    this.setState({
      isWorkFromHome: true,
      isOffice: false,
      isManual: false,
      isPlace: false,
    });
  };
  onChoosePlaceManual = (value) => {
    this.isAllowtocheckin = true;
    this.setState({ isManual: value, isWorkFromHome: false, isOffice: false });
  };
  onChoosePlace = (value) => {
    this.isAllowtocheckin = true;
    this.setState({
      isPlace: value,
      isManual: value,
      isOffice: !value,
      isWorkFromHome: false,
    });
  };
  setLocationName = (value) => {
    console.log(value);
    if (this.state.isManual) {
      this.setState({ manulLocation: value, manualAddress: value });
    }
  };
  getLocationName = () => {
    if (this.state.isManual) {
      return this.state.manulLocation;
    } else {
      return this.currentLocationObj.formatted_address;
    }
  };
  getLocationAddressForPlace = () => {
    return this.currentLocationObj.formatted_address;
  };

  renderCaseTabView() {
    return (
      <View style={[styles.teamContainer, { marginLeft: 24 }]}>
        {this.renderTeamSwitch()}
      </View>
    );
  }
  getWFHInfo = (placeInfo) => {
    this.currentLocationObj = placeInfo;
  };
  renderPlaceTabView() {
    const {
      isPlace,
      isManual,
      isOffice,
      isWorkFromHome,
      officeAddressPlace,
    } = this.state;
    return (
      <View>
        <SwitchViewNew
          onChooseOffice={(value) => this.onChoosePlaceOffice(true)}
          isOffice={this.state.isOffice}
          onChooseWrkFromHome={(value) => this.onChoosePlaceWrkFrmHome(value)}
          isWorkFromHome={this.state.isWorkFromHome}
          onChoosePlace={(value) => this.onChoosePlace(value)}
          isPlace={this.state.isPlace}
        />
        {isOffice && !isPlace && officeAddressPlace.length > 0 ? (
          <DropDownPicker
            zIndex={10000}
            items={officeAddressPlace}
            defaultValue={0}
            controller={(instance) => (this.controller = instance)}
            placeholder="Select office"
            searchable={true}
            searchablePlaceholder="Search for office"
            searchablePlaceholderTextColor="gray"
            seachableStyle={{}}
            containerStyle={{ height: 80, marginHorizontal: 10 }}
            dropDownInputContainer={[
              styles.dropDownInputContainer,
              { backgroundColor: "lightgrey" },
            ]}
            style={[styles.dropDownContainer, { marginTop: 0 }]}
            itemStyle={{
              justifyContent: "flex-start",
              alignItems: "center",
              height: 40,
            }}
            labelStyle={{
              fontSize: 16,
              textAlign: "left",
              color: "#000",
            }}
            dropDownStyle={{ marginTop: 25, backgroundColor: "#fcfcfc" }}
            onChangeItem={(item, index) =>
              this.onSelectOfficeLocation(item, index)
            }
          />
        ) : (
          <LocationText
            locationName={this.getLocationName()}
            isEditabe={isManual}
            setLocationName={(text) => this.setLocationName(text)}
          />
        )}
        {isPlace && (
          <MapViewEnforce
            coordinate={this.cordinateObj}
            height={windowHeight * 0.4}
            locationName={this.getLocationAddressForPlace()}
            getWFHInfo={(placeInfo) => this.getWFHInfo(placeInfo)}
          />
        )}
        {!isWorkFromHome && (
          <View style={[styles.teamContainer, { marginLeft: 24 }]}>
            {this.renderTeamSwitch()}
          </View>
        )}
      </View>

      // </ScrollView>
    );
  }
  getCurrentPage() {
    if (this.state.selectedTab == 0) {
      return this.renderJobTabView();
    }
    if (this.state.selectedTab == 1) {
      return this.renderCaseTabView();
    }
    if (this.state.selectedTab == 2) {
      return this.renderPlaceTabView();
    }
  }
  getMapRegion = () => ({
    latitude: this.locationRegionObj.latitude
      ? this.locationRegionObj.latitude
      : 10,
    longitude: this.locationRegionObj.longitude
      ? this.locationRegionObj.longitude
      : 76,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  getLoctionObj = async (locationObj) => {
    let locationName = this.currentLocationObj;

    if (this.state.isLocationFetcherRequired) {

      if (this.currentLocationObj.formatted_address == "") {

        locationName = await this.geoCoder.getPlaceFromCordinate(
          locationObj.latitude,
          locationObj.longitude
        );

      }
      this.currentLocationObj = locationName;
      console.log('locationName--->', locationName);
      const newCordObj = {
        longitude: locationObj.longitude,
        latitude: locationObj.latitude,
      };
      this.cordinateObj = newCordObj;
      if (!this.state.isManual) {
        this.setState({
          locationName: this.currentLocationObj.formatted_address,
          isInitialLoad: false,
          isLoading: false,
        });
      }
      this.setState({ isInitialLoad: false, isLoading: false });
    }
  };
  isInRadius = (isInRadius) => { };
  renderTeamsView() {
    const { getAllTeamData, teamMultipleSelect } = this.state;
    return (
      <>
        {this.state.isTeamClicked && (
          <View
            style={{
              marginTop: 5,
              flexDirection: "column",
              backgroundColor: "#f6f6f6",
            }}
          >
            <View
              style={{
                marginHorizontal: 24,
                ...(Platform.OS !== "android" && {
                  zIndex: 10,
                }),
              }}
            >
              <>
                {getAllTeamData && (
                  <DropDownPicker
                    items={getAllTeamData}
                    controller={(instance) => (this.controller = instance)}
                    placeholder="Select Team"
                    multiple={true}
                    searchable={true}
                    defaultValue={0}
                    searchablePlaceholder="Search for team"
                    searchablePlaceholderTextColor="gray"
                    seachableStyle={{}}
                    containerStyle={{ height: 80 }}
                    dropDownInputContainer={styles.dropDownInputContainer}
                    style={styles.dropDownContainer}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    labelStyle={{
                      fontSize: 16,
                      textAlign: "left",
                      color: "#000",
                    }}
                    onChangeList={(items, callback) => {
                      new Promise((resolve) => resolve())
                        .then(() => callback())
                        .catch(() => { });
                    }}
                    dropDownStyle={{
                      marginTop: 25,
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={(item) => this.onSelectedItemsChange(item)}
                  />
                )}
              </>
              <View>
                {this.multiSelect &&
                  getAllTeamData.length > 0 &&
                  this.multiSelect.getSelectedItemsExt(
                    this.state.teamMultipleSelect
                  )}
                {teamMultipleSelect && this.renderChipSelectedTeam()}
              </View>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginHorizontal: 24,
                justifyContent: "flex-start",
                alignItems: "center",
                marginTop: 15,
              }}
              onPress={() => this.onPressTeamAddTeam()}
            >
              <Icon
                name="plus-circle"
                style={{ padding: 5 }}
                size={15}
                color="red"
              />
              <Text style={{ textAlign: "right" }}>Add</Text>
            </TouchableOpacity>
            <View
              style={{
                height: 1,
                flex: 1,
                backgroundColor: "gray",
                marginTop: 10,
                marginHorizontal: 24,
              }}
            ></View>
            {this.renderSegmentTab()}
          </View>
        )}
      </>
    );
  }
  modalCloseAction = (hhh) => {
    this.setState({ showAlertIdNoFace: false });
  };

  modalsubmitAction = () => {
    this.ReqsubmitReport();
  }
  modalReverifyAction = () => {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    counter_face_data++;
    this.verifyFaceRekcongition();
  };

  modalRefreshAction = () => {
    counter++;
    console.log(counter);
    this.setState({ isLocationError: false, isLocationverification: false })
    this.props.navigation.goBack();
  };
  modalViewDescriptionCloseAction = () => {
    this.setState({ isViewDecription: false });
  };
  isInRadius = (isInRadius) => { };
  onGoBackToPrevious = async () => {
    this.props.navigation.goBack();
  };
  onGoBackToPreviousCheckIn = async () => {
    counter++;
    console.log(counter);
    this.props.navigation.goBack();
  };

  render() {
    const {
      selectedTab,
      isVerifyFace,
      showCamerTimer,
      getAllProjectData,
      roleiddata,
      getProjectList,
      findProjectDetails,
      isTeamClicked,
      getAllTeamData,
      teamMultipleSelect,
      jobColors,
      caseColors,
      placeColors,
      isLoading,
      faceReportPopup
    } = this.state;
    if (isVerifyFace) {
      return (
        <View style={([Helpers.fillCol], styles.container)}>
          <LocationFetcher
            isContiousSavingRequired={false}
            ref={(ref) => {
              this.locationFetcher = ref;
            }}
            getLocation={(location) => this.getLoctionObj(location)}
            isInRadiusOrNot={(isInRadius) => this.isInRadius(isInRadius)}
            isInitialLoad={this.state.isInitialLoad}
          />
          <Loader loading={isLoading} />
          {this.renderRegistrationSuccessPopup()}
          {this.renderCamera()}
        </View>
      );
    } else {
      return (
        <View style={([Helpers.fillCol], styles.container)}>
          <LocationFetcher
            isContiousSavingRequired={false}
            ref={(ref) => {
              this.locationFetcher = ref;
            }}
            getLocation={(location) => {
              // console.log('location', location)
              this.getLoctionObj(location)
            }
            }
            isInRadiusOrNot={(isInRadius) => this.isInRadius(isInRadius)}
            isInitialLoad={this.state.isInitialLoad}
          />
          <Loader loading={isLoading} />
          <LinearGradient
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.0, y: 0.25 }}
            colors={this.getNavigationColor()}
            style={styles.navigationLinearGradient}
          >
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  width: 60,
                  marginHorizontal: 24,
                  marginTop: 40,
                  backgroundColor: "transparent",
                }}
                onPress={() => this.onGoBackToPrevious()}
              >
                <Icon name="angle-left" size={30} color="white" />
              </TouchableOpacity>
              <View style={{ marginTop: 40, flex: 1, alignSelf: "center" }}>
                <Text style={styles.titleText}>Checkin</Text>
              </View>
              <View style={{ marginTop: 40, flex: 1 }}></View>
            </View>
          </LinearGradient>
          <LinearGradient
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.0, y: 0.25 }}
            colors={this.getNavigationColor()}
          >
            <MaterialTabs
              items={["Job", "Case", "Place"]}
              selectedIndex={this.state.selectedTab}
              onChange={(e) => this.setSelectedTab(e)}
              uppercase={false}
              textStyle={{ fontSize: 21, fontWeight: "700" }}
              barColor="transparent"
              indicatorColor="black"
              activeTextColor="white"
            />
          </LinearGradient>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 60, height: 600 }}
            ref={(ref) => {
              this.scrollView = ref;
            }}
            onContentSizeChange={() =>
              this.scrollView.scrollToEnd({ animated: true })
            }
            style={{ marginBottom: 20 }}
          >
            {this.getCurrentPage()}
            {this.renderTeamsView()}
          </ScrollView>
          <View style={{ flexDirection: "row", marginHorizontal: 24 }}>
            {findProjectDetails === null && selectedTab == 0 ? (
              <View
                style={{
                  flex: 1,
                  marginBottom: 30,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <LinearGradient
                  start={{ x: 0.5, y: 1.0 }}
                  end={{ x: 0.0, y: 0.25 }}
                  colors={["#fe717f", "#fa8576", "#f6976e"]}
                  style={[styles.startButton, { opacity: 0.5 }]}
                >
                  <Text style={styles.startText}>Start</Text>
                </LinearGradient>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  flex: 1,
                  marginBottom: 30,
                  justifyContent: "center",
                  alignSelf: "center",
                }}
                onPress={() => this.flushtimer()}
              >
                <LinearGradient
                  start={{ x: 0.5, y: 1.0 }}
                  end={{ x: 0.0, y: 0.25 }}
                  colors={["#fe717f", "#fa8576", "#f6976e"]}
                  style={styles.startButton}
                >
                  <Text style={styles.startText}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, marginLeft: 24 }}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => this.onGoBackToPrevious()}
              >
                <Text style={styles.startText}>Cancel</Text>
              </TouchableOpacity>
            </View>


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


          </View>
          <CustomPopUpModal
            modalVisible={this.state.showAlertIdNoFace}
            modalCloseAction={this.modalCloseAction}
            modalReverifyAction={this.modalReverifyAction}
            isVerifcationPopUp={true}
            isReverification={true}
          />




          <ViewDescriptionPopupScreen
            viewDescriptionValue={this.state.getSelectedProjectData}
            modalVisible={this.state.isViewDecription}
            modalCloseAlertAction={this.modalViewDescriptionCloseAction}
            isViewDecription={true}
          />

          <LocationError
            modalVisible={this.state.isLocationError}
            modalCloseAction={this.modalCloseAction}
            modalsubmitAction={this.modalsubmitAction}
            modalReverifyAction={this.modalRefreshAction}
            isLocationError={this.state.isLocationError}
            isLocationverification={this.state.isLocationverification}
          />
        </View>
      );
    }
  }
}