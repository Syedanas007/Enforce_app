import * as React from "react";
import {
  AppState,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import styles from "./style";
import { Helpers, Images } from "../../Theme";
import * as NavigationService from "../../Services/NavigationService";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  request,
  PERMISSIONS,
  RESULTS,
  requestMultiple,
} from "react-native-permissions";
import { Platform } from "react-native";
import AndroidGeolocation from "../LocationModule/AndroidGeolocation"
import LocationFetcher from "../LocationModule/index";
import PermissionDeniedModal from "../../Components/PermissionDeniedModal";
import { getData, LocalDBItems, storeData } from "../../Services/LocalStorage";
import {
  isCameraPermisonGranted,
  isLocationPermisonGranted,
  checkAllPermison,
} from "../../Components/PermissionChecker";

/**
 * PERMISSION
 * After user login, navigated to permission screen
 * User can enable the camera and location tracking permission from the screen.
 * After enabling only user can navigate to register face screen.
 * Only one time the permission screen will be shown to user.
 */
export default class PermissionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locationPermission: false,
      cameraPermission: false,
      termsAndCondition: false,
      appState: AppState.currentState,
      showPermissionDeniedModal: false,
    };
    this.permisonIOSArray = [
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.CAMERA,
    ];
    this.permssionAndroidArray = [
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ];
  }
  /**
   * componentDidMount function called when user enters the screen
   * Added on change notification to receive app changes
   */
  componentDidMount = () => {
    AppState.addEventListener("change", this._handleAppStateChange);
    this.checkPermissions();
  };
  /**
   * _handleAppStateChange function called when user enters the screen
   * to detect the app state change
   * permission check added
   */
  _handleAppStateChange = (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      this.checkPermissions();
    }
    this.setState({ appState: nextAppState });
  };

  /**
   * checkPermissions function called to check permission
   */
  checkPermissions = () => {
    isCameraPermisonGranted().then((result) => {
      this.setState({ cameraPermission: result.granted });
    });
    isLocationPermisonGranted().then((result) => {
      this.setState({ locationPermission: result.granted });
    });

    checkAllPermison().then((result) => {
      this.setState({ showPermissionDeniedModal: false });
    });
  };

  /**
   * componentWillUnmount function called to when the component removed from the stack
   * Navigation added to the FaceRegistrationIntoScreen screen
   */

  componentWillUnmount() { }
  navigateToFaceRegistrationScreen = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    if (employeeDetails.is_face_recog) {
      storeData(LocalDBItems.isUserAuthenticated, true);
      NavigationService.navigateAndReset("App", {});
    } else {
      NavigationService.navigate("FaceRegistrationIntoScreen");
    }
  };

  /**
   * To request location permission of the user
   */
  requestLocationPermission = () => {
    let permission = this.getLocationPermissions();

    // requestMultiple(permission).then((dictionary) => {
    //   for (var key in dictionary) {
    //     // check if the property/key is defined in the object itself, not in parent
    //     if (dictionary.hasOwnProperty(key)) {

    //       let value = dictionary[key];
    //       console.log("**HEREIN IF**",value)
    //       if (value == "granted") {
    //         this.setState({ locationPermission: true });
    //       }
    //     }
    //   }
    // });

    request(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      {
        'title': 'Allow Enforce to access this device location even when the app is closed and not in user',
        'message': 'Enforce App collects location data to enable Travel Claim when selecting place checkin even when the app is closed or not in use',
        'buttonPositive': 'Accept',
        'buttonNegative': 'Cancel'
      }
    ).then((value) => {

      if (value == "granted") {
        // requestBgLocatinPermission();

        request(
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
          {
            'title': 'Allow Enforce to access this device location even when the app is closed and not in user',
            'message': 'Enforce App collects location data to enable Travel Claim when selecting place checkin even when the app is closed or not in use.If you are not giving Allow all the time Permission you wont be able to claim the travel report!',
            'buttonPositive': 'Accept',
            'buttonNegative': 'Cancel'
          }
        ).then((value) => {
          console.log('value--->', value);
          if (value == "granted") {
            this.setState({ locationPermission: true });
            storeData(LocalDBItems.isEmployeeLocationTrack, true); 
            storeData(LocalDBItems.isLocationTrackingNeeded, true);
          }
          else{
            console.log("Test Vlaue",value)
            this.setState({ locationPermission: true });
            storeData(LocalDBItems.isEmployeeLocationTrack, false); 
            storeData(LocalDBItems.isLocationTrackingNeeded, false);

          }
        })


      }

    }).catch((error) => {
      console.log(error);
    })
  };


  /**
   * To request bg location permission of the user
   */

  requestBgLocatinPermission = () => {
    request(
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      {
        'title': 'Allow Enforce to access this device location even when the app is closed and not in user',
        'message': 'Enforce App collects location data to enable Travel Claim when selecting place checkin even when the app is closed or not in use',
        'buttonPositive': 'Accept',
        'buttonNegative': 'Cancel'
      }
    ).then((value) => {
      console.log('value--->', value);
      if (value == "granted") {
        this.setState({ locationPermission: true });
      }


    }).catch((error) => {
      console.log("Super",error);
    })
  }




  /**
   * To request camera permission of the user
   */
  requestCameraPermission = () => {
    let cameraPermission = this.getCameraPermissions();
    request(cameraPermission).then((result) => {
      if (result == RESULTS.GRANTED) {
        this.setState({ cameraPermission: true });
      }
    });
  };
  /**
   * To request camera permission of the user
   */
  getCameraPermissions = () => {
    if (Platform.OS == "ios") {
      return PERMISSIONS.IOS.CAMERA;
    } else {
      return PERMISSIONS.ANDROID.CAMERA;
    }
  };
  /**
   * To request location permission of the user
   */
  getLocationPermissions = () => {
    if (Platform.OS == "ios") {
      return [
        PERMISSIONS.IOS.LOCATION_ALWAYS,
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      ];
    } else {
      return [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ];
    }
  };
  /**
   * To handle terms and condition flag set by user
   */
  onTermsAndConditionPressed = () => {
    this.setState({ termsAndCondition: !this.state.termsAndCondition });
  };
  /**
   * To handle terms and condition flag set by user
   */
  isDisabledTermsAndCondition = () => {
    if (!this.state.locationPermission || !this.state.cameraPermission) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * To handle button status
   */
  isAllowButtonDisabled = () => {
    if (
      !this.state.locationPermission ||
      !this.state.cameraPermission ||
      !this.state.termsAndCondition
    ) {
      return true;
    } else {
      return false;
    }
  };
  /**
   * To handle close modal on the screen
   */
  modalCloseAction = () => {
    Linking.openSettings();
    this.setState({ showPermissionDeniedModal: false });
  };
  /**
   * method loads the view
   */
  render() {
    return (
      <View style={[Helpers.fillCol, styles.container]}>
        <LinearGradient
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.0, y: 0.25 }}
          colors={["#f6976e", "#fe717f", "#fa8576"]}
          style={styles.navigationLinearGradient}
        >
          <Text style={styles.titleText}>Allow Permissions</Text>
        </LinearGradient>
        <View style={styles.topContainer}>
          <Text style={styles.headerText}>
            Please allow us permission to access following for fast and wide
            facial detection.
          </Text>
          <View style={styles.permissionContainer}>
            <TouchableOpacity onPress={() => this.requestLocationPermission()}>
              <View style={styles.permisionView}>
                <View style={styles.permissionCellContainer}>
                  <Icon name="th-large" size={20} color="#fa8576" />
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.permissionText}>
                      Allow to access location
                    </Text>
                  </View>
                  <View style={styles.checkedContainer}>
                    <Image
                      style={styles.checkedIcon}
                      source={
                        this.state.locationPermission
                          ? Images.checkedIcon
                          : Images.uncheckedIcon
                      }
                      resizeMode={"contain"}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.requestCameraPermission()}>
              <View style={styles.permisionView}>
                <View style={styles.permissionCellContainer}>
                  <Icon name="camera" size={20} color="#fa8576" />
                  <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={styles.permissionText}>
                      Allow to access camera and photos
                    </Text>
                  </View>
                  <View style={styles.checkedContainer}>
                    <Image
                      style={styles.checkedIcon}
                      source={
                        this.state.cameraPermission
                          ? Images.checkedIcon
                          : Images.uncheckedIcon
                      }
                      resizeMode={"contain"}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => this.onTermsAndConditionPressed()}
          disabled={this.isDisabledTermsAndCondition()}
        >
          <View style={styles.privacyContainer}>
            <Image
              style={styles.checkedIcon}
              source={
                this.state.termsAndCondition
                  ? Images.checkedIcon
                  : Images.uncheckedIcon
              }
              resizeMode={"contain"}
            />
            <Text style={styles.privacyPolicyNormalText}>
              {" I read the"}
              <Text style={styles.privacyPolicyText}>{" Privacy policy"}</Text>
              <Text style={styles.privacyPolicyNormalText}>
                {" and i accept the"}
                <Text style={styles.privacyPolicyText}>
                  {" Terms and conditions"}
                </Text>
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={this.isAllowButtonDisabled()}
          style={{
            width: "85%",
            marginBottom: 30,
            justifyContent: "center",
            alignSelf: "center",
          }}
          onPress={() => this.navigateToFaceRegistrationScreen()}
        >
          <LinearGradient
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.0, y: 0.25 }}
            colors={["#fe717f", "#fa8576", "#f6976e"]}
            style={styles.allowButton}
          >
            <Text style={styles.allowText}>Allow</Text>
          </LinearGradient>
        </TouchableOpacity>
        <PermissionDeniedModal
          modalVisible={this.state.showPermissionDeniedModal}
          modalCloseAction={this.modalCloseAction}
          isVerifcationPopUp={false}
        />
      </View>
    );
  }
}
