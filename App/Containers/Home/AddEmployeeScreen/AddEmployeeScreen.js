import * as React from "react";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import styles from "./style";
import { Helpers, Colors } from "../../../Theme";
import LinearGradient from "react-native-linear-gradient";
import * as NavigationService from "../../../Services/NavigationService";
import Icon from "react-native-vector-icons/FontAwesome";
import { apiService } from "../../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../../Services/Endpoint";
import { getData, LocalDBItems } from "../../../Services/LocalStorage";
import DropDownPicker from "react-native-dropdown-picker";
import { ScrollView } from "react-native";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import IconCalender from "react-native-vector-icons/AntDesign";
import Toast from "react-native-simple-toast";
import CountryPicker, { FlagButton } from "react-native-country-picker-modal";

export default class AddEmployeeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: "",
      lastname: "",
      phoneNumber: "",
      emailAddress: "",
      employeeType: "",
      designation: "",
      employeeStatus: "",
      joiningDate: moment(new Date()).utc(true).format("MM/DD/YYYY"),
      dateValue: new Date(),
      tappedDate: false,
      department: "",
      employeeRole: "",
      employeeGrade: "",
      isLoading: false,
      getAllDepartmentList: [],
      getEmployeeStatus: [],
      getEmployeeRoles: [],
      getEmployeeType: [],
      getAllDesignationList: [],
      countryCode: "AE",
      countryCallingCode: "+971",
      isVisible: false,
      country: 0,
      cca2: "US",
      getEmployeeGrades: [
        { value: "L1", label: "L1" },
        { value: "L2", label: "L2" },
        { value: "L3", label: "L3" },
        { value: "L4", label: "L4" },
        { value: "L5", label: "L5" },
        { value: "L6", label: "L6" },
      ],
    };
  }

  componentDidMount() {
    this.getAllDepartmentByOrgID();
    this.getEmployeeStatusByOrgID();
    this.getEmployeeTypeByOrgID();
    this.getEmployeeRoles();
  }
  showDatePicker(tappedDate) {
    this.setState({ tappedDate: !tappedDate });
  }
  onChangeStartDate = (event, val) => {
    if (event.type == "dismissed") {
      this.setState({
        dateValue: new Date(),
        tappedDate: false,
      });
      return;
    } else {
      let dateString = moment(val).utc(true).format("MM/DD/YYYY");
      this.setState({
        dateValue: val,
        joiningDate: dateString,
        tappedDate: Platform.OS === "ios" ? true : false,
      });
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
    if (apiResponseData) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.dep_name, value: value.dep_name };
      });
      this.setState({ getAllDepartmentList: getDepartmentName });
    }
  };
  getEmployeeStatusByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_EMPLOYEE_STATUS_BY_ORGID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.employee_status_name, value: value.id };
      });
      this.setState({ getEmployeeStatus: getDepartmentName });
    }
  };
  getEmployeeTypeByOrgID = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_EMPLOYEE_TYPE_BY_ORGID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.employee_type_name, value: value.id };
      });
      this.setState({ getEmployeeType: getDepartmentName });
    }
  };
  getEmployeeRoles = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    // let params = { id: orgId.org_id };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.GET_EMPLOYEE_ROLE,
      type: "get",
      params: null,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.name, value: value.id };
      });
      this.setState({ getEmployeeRoles: getDepartmentName });
    }
  };
  getAllDesignationByDepID = async (value) => {
    let params = { id: value.id };
    const requestObj = {
      endpoint:
        BaseUrl.API_BASE_URL + Endpoint.GET_ALL_DESIGNATION_EMPBY_DEPT_ID,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData) {
      const getDepartmentName = await apiResponseData.map((value) => {
        return { ...value, label: value.designation_name, value: value.id };
      });
      this.setState({ getAllDesignationList: getDepartmentName });
    }
  };
  validate = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    } else {
      return true;
    }
  };
  validateFields = () => {
    const {
      emailAddress,
      phoneNumber,
      firstname,
      lastname,
      department,
      designation,
      employeeGrade,
      employeeRole,
      employeeStatus,
      employeeType,
    } = this.state;
    if (firstname === "") {
      Toast.show("Please enter First Name", Toast.LONG);
    } else if (lastname === "") {
      Toast.show("Please enter Last Name", Toast.LONG);
    } else if (phoneNumber === "") {
      Toast.show("Please enter Phone Name", Toast.LONG);
    } else if (emailAddress === "") {
      Toast.show("Please enter Work Email", Toast.LONG);
    } else if (!this.validate(emailAddress)) {
      Toast.show("Email address is not valid format", Toast.LONG);
    } else if (employeeType === "") {
      Toast.show("Please select Employee Type", Toast.LONG);
    } else if (department === "") {
      Toast.show("Please select Department", Toast.LONG);
    } else if (designation === "") {
      Toast.show("Please select Designation", Toast.LONG);
    } else if (employeeStatus === "") {
      Toast.show("Please select Employee Status", Toast.LONG);
    } else if (employeeGrade === "") {
      Toast.show("Please Select Employee Grade", Toast.LONG);
    } else if (employeeRole === "") {
      Toast.show("Please Select Employee Role", Toast.LONG);
    } else {
      this.onSaveNewMember();
    }
  };
  onSaveNewMember = async () => {
    const orgId = await getData(LocalDBItems.employeeDetails);
    const {
      emailAddress,
      joiningDate,
      countryCallingCode,
      phoneNumber,
      firstname,
      lastname,
      department,
      designation,
      employeeGrade,
      employeeRole,
      employeeStatus,
      employeeType,
    } = this.state;
    let params = {
      id: "",
      org_id: orgId.org_id,
      user_id: "",
      deptid: department.id,
      full_name: firstname + " " + lastname,
      first_name: firstname,
      last_name: lastname,
      alias: "",
      gender: "",
      emp_status_id: employeeStatus.id,
      emp_type_id: employeeType.id,
      imgurl: "",
      imgurl_name: "",
      workemail: emailAddress,
      emp_code: employeeGrade.value,
      role_id: employeeRole.id,
      designation_id: designation.id,
      dob: "",
      joined_date: joiningDate,
      phone_iso_name: "AE",
      phone: countryCallingCode + phoneNumber,
      mobile: countryCallingCode + phoneNumber,
      email: emailAddress,
      summary: "",
      createdby: orgId.full_name,
      modified_date: "",
      modifiedby: "",
      is_deleted: false,
      is_admin: false,
      is_superadmin: false,
    };
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.ADD_EMPLOYEE,
      type: "post",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    if (apiResponseData && apiResponseData.results) {
      Toast.show(apiResponseData.results.desc, Toast.LONG);
    }
    if (apiResponseData.status === "200") {
      this.navigateToRegisterFace(apiResponseData.code);
    }
  };
  onFirstNameChanged = (firstName) => {
    this.setState({ firstname: firstName });
  };
  onLastNameChanged = (lastname) => {
    this.setState({ lastname: lastname });
  };
  onChangeWorkPhone = (workPhone) => {
    this.setState({ phoneNumber: workPhone });
  };
  onChangeWorkEmail = (workEmail) => {
    this.setState({ emailAddress: workEmail });
  };
  onSelectEmployeeGrade = (value) => {
    this.setState({ employeeGrade: value });
  };
  onSelectDesignation = (value) => {
    this.setState({ designation: value });
  };
  onSelectEmployeeRole = (value) => {
    this.setState({ employeeRole: value });
  };
  onSelectEmployeeStatus = (value) => {
    this.setState({ employeeStatus: value });
  };
  onSelectEmployeeType = (value) => {
    this.setState({ employeeType: value });
  };
  onSelectDepartment = (value) => {
    this.setState({ department: value }, () => {
      this.getAllDesignationByDepID(value);
    });
  };
  navigateToRegisterFace = (empId) => {
    const params = {
      user: {
        isFromAddMember: true,
        empId: empId,
        full_name: this.state.firstname + this.state.lastname,
      },
    };
    NavigationService.navigate("AddFaceRegistrationScreen", params);
  };
  onSelect = (country) => {
    var countryCallingCode = "";
    if (country.callingCode.length > 0) {
      countryCallingCode = country.callingCode[0];
    } else {
      countryCallingCode = "+971";
    }
    this.setState({
      countryCode: country.cca2,
      country: country,
      countryCallingCode: countryCallingCode,
      isVisible: false,
    });
  };

  render() {
    const {
      getAllDepartmentList,
      getAllDesignationList,
      getEmployeeRoles,
      getEmployeeStatus,
      getEmployeeType,
      getEmployeeGrades,
    } = this.state;
    return (
      <View style={([Helpers.fillCol], styles.container)}>
        <LinearGradient
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.0, y: 0.25 }}
          colors={["#f6976e", "#fe717f", "#fa8576"]}
          style={styles.navigationLinearGradient}
        >
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{
                width: 60,
                marginHorizontal: 24,
                marginTop: 60,
                backgroundColor: "transparent",
              }}
              onPress={() => this.props.navigation.goBack()}
            >
              <Icon name="angle-left" size={30} color="white" />
            </TouchableOpacity>
            <View
              style={{
                marginTop: 60,
                justifyContent: "center",
                alignSelf: "center",
                width: "50%",
              }}
            >
              <Text style={styles.titleText}>Add Employee</Text>
            </View>
            <View style={{ marginTop: 60, flex: 1 }}></View>
          </View>
        </LinearGradient>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 60 }}
          ref={(ref) => {
            this.scrollView = ref;
          }}
          onContentSizeChange={() =>
            this.state.tappedDate
              ? this.scrollView.scrollToEnd({ animated: true })
              : null
          }
          style={{ marginBottom: 40 }}
        >
          <View style={{ flexDirection: "column", flex: 1 }}>
            <View style={styles.firstHeaderSection}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeaderText}>Personal info</Text>
              </View>
              <View style={styles.textViewContainer}>
                <View style={styles.textFieldInputContainer}>
                  <TextInput
                    style={styles.textFieldInputText}
                    placeholder="First Name"
                    placeholderTextColor={Colors.text}
                    keyboardType="default"
                    secureTextEntry={false}
                    autoCapitalize={"none"}
                    onChangeText={(text) => this.onFirstNameChanged(text)}
                    value={this.state.firstname}
                  />
                </View>
                <View style={styles.textFieldInputContainer}>
                  <TextInput
                    style={styles.textFieldInputText}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.text}
                    keyboardType="default"
                    secureTextEntry={false}
                    autoCapitalize={"none"}
                    onChangeText={(text) => this.onLastNameChanged(text)}
                    value={this.state.lastname}
                  />
                </View>
              </View>
            </View>
            <View style={styles.secondHeaderSection}>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeaderText}>Work info</Text>
              </View>
              <View style={styles.textViewContainer}>
                <View style={styles.textFieldInputContainer}>
                  <View style={{ flexDirection: "row" }}>
                    <FlagButton
                      onOpen={() =>
                        this.setState({ isVisible: !this.state.isVisible })
                      }
                      withEmoji={true}
                      countryCode={this.state.countryCode}
                      withCallingCodeButton={true}
                      containerButtonStyle={{
                        paddingLeft: 5,
                        height: 60,
                        minwidth: 60,
                        maxWidth: 110,
                        justifyContent: "center",
                      }}
                    />
                    <TextInput
                      style={[
                        styles.textFieldInputText,
                        { paddingLeft: 20, width: "75%" },
                      ]}
                      placeholder="Work Phone"
                      placeholderTextColor={Colors.text}
                      keyboardType="default"
                      secureTextEntry={false}
                      autoCapitalize={"none"}
                      maxLength={10}
                      onChangeText={(text) => this.onChangeWorkPhone(text)}
                      value={this.state.phoneNumber}
                    />
                    <CountryPicker
                      withCountryNameButton={false}
                      withModal={true}
                      withFlag={true}
                      withFlagButton={true}
                      withCallingCode={true}
                      visible={this.state.isVisible}
                      onSelect={(country) => this.onSelect(country)}
                      withCallingCode={true}
                      withAlphaFilter={true}
                      withCountryNameButton={true}
                      renderFlagButton={() => {
                        return null;
                      }}
                    />
                  </View>
                </View>
                <View style={styles.textFieldInputContainer}>
                  <TextInput
                    style={styles.textFieldInputText}
                    placeholder="Work Email"
                    placeholderTextColor={Colors.text}
                    keyboardType="default"
                    secureTextEntry={false}
                    autoCapitalize={"none"}
                    onChangeText={(text) => this.onChangeWorkEmail(text)}
                    value={this.state.emailAddress}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 200,
                    }),
                  }}
                >
                  <DropDownPicker
                    // zIndex={1000}
                    items={getEmployeeType}
                    placeholder="Employee Type"
                    placeholderTextColor={Colors.error}
                    searchable={true}
                    searchablePlaceholder="Search for employee type"
                    searchablePlaceholderTextColor="gray"
                    seachableStyle={{}}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectEmployeeType}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 180,
                    }),
                  }}
                >
                  <DropDownPicker
                    zIndex={900}
                    items={getAllDepartmentList}
                    placeholder="Department"
                    placeholderTextColor={Colors.text}
                    searchable={true}
                    searchablePlaceholder="Search for department"
                    searchablePlaceholderTextColor="gray"
                    seachableStyle={{}}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectDepartment}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 160,
                    }),
                  }}
                >
                  <DropDownPicker
                    zIndex={800}
                    items={getAllDesignationList}
                    placeholder="Designation"
                    placeholderTextColor={Colors.text}
                    searchable={true}
                    searchablePlaceholder="Search for desigination"
                    searchablePlaceholderTextColor="gray"
                    seachableStyle={{}}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectDesignation}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 140,
                    }),
                  }}
                >
                  <DropDownPicker
                    zIndex={700}
                    items={getEmployeeStatus}
                    placeholder="Employee Status"
                    placeholderTextColor={Colors.text}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectEmployeeStatus}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 120,
                    }),
                  }}
                >
                  <DropDownPicker
                    zIndex={600}
                    items={getEmployeeGrades}
                    placeholder="Employee Grade"
                    placeholderTextColor={Colors.text}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectEmployeeGrade}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    ...(Platform.OS !== "android" && {
                      zIndex: 100,
                    }),
                  }}
                >
                  <DropDownPicker
                    zIndex={500}
                    items={getEmployeeRoles}
                    placeholder="Employee Role"
                    placeholderTextColor={Colors.text}
                    containerStyle={{
                      height: 60,
                      flex: 1,
                      marginHorizontal: 24,
                      marginBottom: 10,
                    }}
                    dropDownInputContainer={styles.textFieldInputContainer}
                    style={styles.textFieldInputTextDropDown}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={this.onSelectEmployeeRole}
                  />
                </View>
                <View style={styles.textFieldInputContainer}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onPress={() => this.showDatePicker(this.state.tappedDate)}
                  >
                    <Text
                      style={[styles.pickerText, { justifyContent: "center" }]}
                    >
                      {this.state.joiningDate}
                    </Text>
                    <View
                      style={{
                        flex: 0.2,
                        marginRight: 10,
                        alignItems: "flex-end",
                        justifyContent: "center",
                      }}
                    >
                      <IconCalender
                        name="calendar"
                        size={25}
                        color={"red"}
                      ></IconCalender>
                    </View>
                  </TouchableOpacity>
                </View>
                <View>
                  {this.state.tappedDate && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      textColor={Colors.error}
                      value={this.state.dateValue}
                      mode={"date"}
                      is24Hour={true}
                      display="default"
                      onChange={(event, selectedDate) => {
                        this.onChangeStartDate(event, selectedDate);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{
            zIndex: 10,
            width: "85%",
            marginTop: 0,
            marginBottom: 30,
            justifyContent: "center",
            alignSelf: "center",
          }}
          onPress={() => this.validateFields()}
        >
          <LinearGradient
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.0, y: 0.25 }}
            colors={["#fe717f", "#fa8576", "#f6976e"]}
            style={styles.checkInButton}
          >
            <Text style={styles.checkInText}>Save & Register Face</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
}
