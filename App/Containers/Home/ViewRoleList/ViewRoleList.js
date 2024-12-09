import * as React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import styles from "./style";
import { Helpers, Images } from "../../../Theme";
import LinearGradient from "react-native-linear-gradient";
import Loader from "../../../Components/Loader";
import Icon from "react-native-vector-icons/FontAwesome";
import { apiService } from "../../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../../Services/Endpoint";
import {
  getData,
  LocalDBItems,
} from "../../../Services/LocalStorage";
import moment from "moment";
export default class ViewRoleListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      getTimeSheetDashboardData: null,
      loading: false,
    };
  }
  componentDidMount() {
    this.getAllDashboardCounts();
  }

  getAllDashboardCounts = async () => {
    this.setState({ loading: true });
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    let params = {
      orgID: employeeDetails.org_id,
      fromDate: moment(new Date()).utc(false).format("MM/DD/YYYY"),
      toDate: moment(new Date()).utc(false).format("MM/DD/YYYY"),
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DASHBOARD_COUNTS,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(() => {
      this.setState({
        loading: false,
      });
      if (apiResponseData) {
        this.setState({
          getTimeSheetDashboardData: apiResponseData,
          loading: false,
        });
      }
    }, 1000);
  };

  getTotalEmployee(value) {
    const { getTimeSheetDashboardData } = this.state;
    const attendance = value != null ? parseInt(value) : 0;
    const attandanceCount =
    getTimeSheetDashboardData && getTimeSheetDashboardData.attandanceCount != null
        ? parseInt(getTimeSheetDashboardData.attandanceCount)
        : 0;
    if (attendance > 1) {
      return `${attendance} of ${attandanceCount} Members`;
    } else {
      return `${attendance} of ${attandanceCount} Member`;
    }
  }
  getAbsentCount() {
    const { getTimeSheetDashboardData } = this.state;
    const absent =
    getTimeSheetDashboardData && getTimeSheetDashboardData.absentCount != null
        ? parseInt(getTimeSheetDashboardData.absentCount)
        : 0;
    if (absent > 1) {
      return `${absent} Members`;
    } else {
      return `${absent} Member`;
    }
  }
  getOnleavetime() {
    const { getTimeSheetDashboardData } = this.state;
    const onleave =
    getTimeSheetDashboardData && getTimeSheetDashboardData.absentCount != null
        ? parseInt(getTimeSheetDashboardData.absentCount)
        : 0;
    if (onleave > 1) {
      return `${onleave} Members`;
    } else {
      return `${onleave} Member`;
    }
  }
  getOverTimeCount() {
    const { getTimeSheetDashboardData } = this.state;
    const value =
    getTimeSheetDashboardData && getTimeSheetDashboardData.empOverTimeCount != null
        ? parseInt(getTimeSheetDashboardData.empOverTimeCount)
        : 0;
    if (value > 1 && getTimeSheetDashboardData.empOverTimeCount != null) {
      return `${value} Members`;
    } else {
      return `${value} Member`;
    }
  }
  getExceptionCount() {
    const { getTimeSheetDashboardData } = this.state;
    const locationCheckOutExceptionCount =
    getTimeSheetDashboardData && getTimeSheetDashboardData.locationCheckOutExceptionCount != null
        ? parseInt(getTimeSheetDashboardData.locationCheckOutExceptionCount)
        : 0;
    const locationExceptionCount =
    getTimeSheetDashboardData && getTimeSheetDashboardData.locationExceptionCount != null
        ? parseInt(getTimeSheetDashboardData.locationExceptionCount)
        : 0;
    const empLessHoursCount =
    getTimeSheetDashboardData && getTimeSheetDashboardData.empLessHoursCount != null
        ? parseInt(getTimeSheetDashboardData.empLessHoursCount)
        : 0;
    const totalException =
      locationCheckOutExceptionCount +
      locationExceptionCount +
      empLessHoursCount;
    if (totalException > 1) {
      return `${totalException} Member`;
    } else {
      return `${totalException} Member`;
    }
  }

  renderRoleWiseData() {
    const { getTimeSheetDashboardData } = this.state;
    return (
      <>
      {getTimeSheetDashboardData && (
      <View style={styles.topContainer}>
        <View style={styles.topSubContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={[styles.innerIcon, { tintColor: "#3f77f4" }]}
                source={Images.attendance}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextAttendance}>Attendance</Text>
              <Text style={styles.subContentTextAttendance}>
                {this.getTotalEmployee(
                 getTimeSheetDashboardData && getTimeSheetDashboardData.empLessHoursCount
                )}
              </Text>
            </View>
          </View>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={[styles.innerIcon, { tintColor: "#93a2dd" }]}
                source={Images.outsourced}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextOutsource}>Outsourced</Text>
              <Text style={styles.subContentTextOutsource}>0 of 0 Member</Text>
            </View>
          </View>
        </View>
        <View style={styles.topSubContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={[styles.innerIcon, { tintColor: "#1dc9b7" }]}
                source={Images.onLeave}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextAbest}>Absent</Text>
              <Text style={styles.subContentTextAbsent}>
                {this.getAbsentCount()}
              </Text>
            </View>
          </View>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={[styles.innerIcon, { tintColor: "#dc3545" }]}
                source={Images.onLeave}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextOnLeave}>Onleave</Text>
              <Text style={styles.subContentTextOnleave}>
                0 Member
                {/* {this.getOnleavetime()} */}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.topSubContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={[styles.innerIcon]}
                source={Images.overtime}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextOverTime}>Overtime</Text>
              <Text style={styles.subContentTextOverTime}>
                {this.getOverTimeCount()}
              </Text>
            </View>
          </View>
          <View style={styles.innerContainer}>
            <View style={styles.innerImageContainer}>
              <Image
                style={styles.innerIcon}
                source={Images.exception}
                resizeMode={"contain"}
              />
            </View>
            <View style={styles.innerTextContainer}>
              <Text style={styles.headingTextException}>Expection</Text>
              <Text style={styles.subContentTextException}>
                {this.getExceptionCount()}
              </Text>
            </View>
          </View>
        </View>
      </View>
      )}
      </>
    );
  }
  render() {
    return (
      <View style={([Helpers.fillCol], styles.container)}>
        <Loader loading={this.state.loading} />
        <LinearGradient
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.0, y: 0.25 }}
          colors={["#f6976e", "#fe717f", "#fa8576"]}
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
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="angle-left" size={30} color="white" />
            </TouchableOpacity>
            <View style={{ marginTop: 40, flex: 1, alignSelf: "center" }}>
              <Text style={styles.titleText}>Dashboard</Text>
            </View>
            <View style={{ marginTop: 40, flex: 1 }}></View>
          </View>
        </LinearGradient>
        <View>{this.renderRoleWiseData()}</View>
      </View>
    );
  }
}
