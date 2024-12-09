import * as React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
} from "react-native";
import styles from "./style";
import { Helpers, Images, Colors } from "../../Theme";
import LinearGradient from "react-native-linear-gradient";
import * as NavigationService from "../../Services/NavigationService";
import Icon from "react-native-vector-icons/FontAwesome";
import { apiService } from "../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../Services/Endpoint";
import {
  getData,
  LocalDBItems,
  storeData,
  wipeData,
} from "../../Services/LocalStorage";
import Loader from "../../Components/Loader";
import CustomModal from "../../Components/CustomModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  checkAllPermison,
} from "../../Components/PermissionChecker";

/**
 * LOGIN
 * When user launch the application for the first time, user navigates to login screen
 * User needs to enter the login credentials which is created from the portal
 * If the user enters the wrong credentials, ERROR message will be thrown
 * If the user enters the correct credentials, navigate to permission screen
 * API -  BaseUrl.API_BASE_URL + Endpoint.LOGIN is used and login success call another API to fetch the employee details.
 * API - get Employee details - BaseUrl.API_BASE_URL + Endpoint.GET_USER_DATA_BY_USER_ID
 */
export default class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isLoading: false,
      modalVisible: false,
      isPermissionGranted: false,
      showPassword: false,
    };
  }
  componentDidMount() {
    checkAllPermison().then((result) => {
      this.setState({ isPermissionGranted: result.allGranted });
    });
  }
  navigateToForgotPassword() {
    NavigationService.navigate("AddEmployeeScreen");
  }
  navigateToPermissionScreen() {
    this.loginApiCall();
  }
  loginApiCall = async () => {
    this.setState({ isLoading: true });
    await wipeData();
    let params = {
      email: this.state.username,
      password: this.state.password,
      rememberMe: true,
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.LOGIN,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(() => {
      this.setState({
        isLoading: false,
      });
      if (apiResponseData && apiResponseData.token) {
        storeData(LocalDBItems.tokenData, apiResponseData.token);
        storeData(LocalDBItems.loginData, apiResponseData);
        this.getUserDataGroupFromUserId();
      }
    }, 2500);
  };
  getUserDataGroupFromUserId = async () => {
    const userId = await getData(LocalDBItems.loginData);
    let params = { id: userId.id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_USER_DATA_BY_USER_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      storeData(LocalDBItems.userDetails, apiResponseData.user);
      storeData(LocalDBItems.employeeDetails, apiResponseData.employee);
      storeData(LocalDBItems.subscriptionDetails, apiResponseData.subscription);
      if (apiResponseData.organization.length > 0) {
        storeData(
          LocalDBItems.organizationDetails,
          apiResponseData.organization[0]
        );
      }
      const organizationDetails = await getData(
        LocalDBItems.organizationDetails
      );
      const employeeDetails = await getData(LocalDBItems.employeeDetails);
      var isLocationFetcherRequired = false;
      if (
        organizationDetails.is_location_tracking === null ||
        organizationDetails.is_location_tracking === false
      ) {
        isLocationFetcherRequired = false;
      } else {
        if (
          employeeDetails.is_location_tracking === null ||
          employeeDetails.is_location_tracking === true
        ) {
          isLocationFetcherRequired = true;
        } else {
          isLocationFetcherRequired = false;
        }
      }
      storeData(
        LocalDBItems.isEmployeeLocationTrack,
        isLocationFetcherRequired
      );
      storeData(
        LocalDBItems.isLocationFetcherRequired,
        isLocationFetcherRequired
      );
      if (!this.state.isPermissionGranted) {
        NavigationService.navigate("PermissionScreen");
      } else {
        if (employeeDetails.is_face_recog) {
          storeData(LocalDBItems.isUserAuthenticated, true);
          NavigationService.navigateAndReset("App", {});
        } else {
          NavigationService.navigate("FaceRegistrationIntoScreen");
        }
      }
    }
  };
  getOrganisationByOrgID = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    let params = { id: employeeDetails.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.FIND_BY_ORGID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      storeData(LocalDBItems.organizationDetails, apiResponseData);
      if (!this.state.isPermissionGranted) {
        NavigationService.navigate("PermissionScreen");
      } else {
        if (employeeDetails.is_face_recog) {
          storeData(LocalDBItems.isUserAuthenticated, true);
          NavigationService.navigateAndReset("App", {});
        } else {
          NavigationService.navigate("FaceRegistrationIntoScreen");
        }
      }
    }
  };

  onUsernameChanged = (text) => {
    this.setState({ username: text });
  };

  onPasswordChanged = (text) => {
    this.setState({ password: text });
  };
  modalCloseAction = (hhh) => {
    this.setState({ modalVisible: false });
  };

  render() {
    const { username, password, isLoading } = this.state;
    return (
      <View style={[Helpers.fillRowCenter, styles.container]}>
        <Loader loading={isLoading} />
        <View style={[Helpers.center, styles.logo]}>
          <ImageBackground
            style={Helpers.fullSize}
            source={Images.logo}
            resizeMode={"cover"}
          >
            <KeyboardAwareScrollView
              keyboardShouldPersistTaps="handled"
              extraScrollHeight={70}
              enableResetScrollToCoords={false}
              enableOnAndroid={true}
            >
              <View style={styles.logoText}>
                <Image
                  style={styles.logoTextIcon}
                  source={Images.logoText}
                  resizeMode={"contain"}
                />
              </View>
              <View style={[styles.textInputText, { marginBottom: 10 }]}>
                <Icon
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                    paddingRight: 10,
                  }}
                  name="user"
                  size={15}
                  color="#bebebe"
                />
                <TextInput
                  style={{ paddingRight: 16, width: "88%" }}
                  placeholder="Username"
                  placeholderTextColor={Colors.text}
                  keyboardType="default"
                  secureTextEntry={false}
                  autoCapitalize={"none"}
                  textContentType="username"
                  autoCompleteType="username"
                  importantForAutofill={"yes"}
                  onChangeText={(text) => this.onUsernameChanged(text)}
                  value={username}
                />
              </View>
              <View style={[styles.textInputText, { marginBottom: 10 }]}>
                <Icon
                  style={{
                    justifyContent: "center",
                    alignSelf: "center",
                    paddingRight: 10,
                  }}
                  name="lock"
                  size={15}
                  color="#bebebe"
                />
                <TextInput
                  style={{ paddingRight: 16, width: "88%" }}
                  placeholder="Password"
                  placeholderTextColor={Colors.text}
                  keyboardType="default"
                  secureTextEntry={!this.state.showPassword}
                  onChangeText={(text) => this.onPasswordChanged(text)}
                  textContentType="password"
                  autoCompleteType="password"
                  importantForAutofill={"yes"}
                  value={password}
                />
                <TouchableOpacity
                  style={{ justifyContent: "center" }}
                  onPress={() =>
                    this.setState({ showPassword: !this.state.showPassword })
                  }
                >
                  <Icon
                    style={{
                      justifyContent: "center",
                      alignSelf: "center",
                      paddingRight: 10,
                    }}
                    name={this.state.showPassword ? "eye" : "eye-slash"}
                    size={15}
                    color="#bebebe"
                  />
                </TouchableOpacity>
              </View>

              {username && password ? (
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() => this.navigateToPermissionScreen()}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={styles.signInButton}
                  >
                    <Text style={styles.signInText}>Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={{ width: "100%" }}>
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={[styles.signInButton, { opacity: 0.5 }]}
                  >
                    <Text style={styles.signInText}>Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => this.navigateToForgotPassword()}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </ImageBackground>
        </View>
        <CustomModal
          modalVisible={this.state.modalVisible}
          modalCloseAction={this.modalCloseAction}
          isVerifcationPopUp={true}
        />
      </View>
    );
  }
}
