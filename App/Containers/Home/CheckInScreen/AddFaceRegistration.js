import * as React from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  Text,
  Image,
  FlatList,
} from "react-native";
import styles from "./addStyle";
import { Images } from "../../../Theme";
import * as NavigationService from "../../../Services/NavigationService";
import LinearGradient from "react-native-linear-gradient";
import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/FontAwesome";
import { Modalize } from "react-native-modalize";
import { addFaceRekognitionService } from "../../../Services/AWSService";
import {
  getData,
  LocalDBItems,
  storeData,
} from "../../../Services/LocalStorage";
import Loader from "../../../Components/Loader";
import { apiService } from "../../../Services/ApiService";
import { Endpoint, BaseUrl } from "../../../Services/Endpoint";
import CustomPopUpModal from "../../../Components/CustomPopup";

const landmarkSize = 2;
export default class AddFaceRegistrationScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flash: "off",
      zoom: 0,
      autoFocus: "on",
      depth: 0,
      type: "front",
      whiteBalance: "auto",
      ratio: "16:9",
      canDetectFaces: true,
      faces: [],
      count: 0,
      defaultFaceImage: Images.defaultFaceIcon,
      thumbnailPreview: ["", "", "", "", ""],
      base64Image: [],
      isVisible: false,
      loading: false,
      faceId: "",
      callFaceReg: false,
      showAlertIdNoFace: false,
      userName: "",
      paramsData: this.props.route.params.params
        ? this.props.route.params.params
        : null,
      userData: this.props.route.params.user
        ? this.props.route.params.user
        : null,
    };
    this.modalizeRef = React.createRef();
    this.timer = null;
    this.userName = "";
  }
  modalCloseAction = (hhh) => {
    this.setState({ showAlertIdNoFace: false });
  };
  componentWillUnmount() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }
  componentDidMount() {
  }
  renderPreviewThumbnail = () => {
    if (this.state.thumbnailPreview.length >= 1) {
      return (
        <View style={{ marginHorizontal: 10 }}>
          <FlatList
            style={{ height: 120 }}
            numColumns={this.state.thumbnailPreview.length}
            key={this.state.thumbnailPreview.length}
            scrollEnabled={false}
            data={this.state.thumbnailPreview}
            renderItem={({ item, index }) => this.renderItem(item, index)}
            keyExtractor={(item) => item}
          ></FlatList>
        </View>
      );
    }
  };
  renderItem(item, index) {
    return (
      <View style={{ flex: 1 }}>
        {item != "" ? (
          <Image
            style={styles.previewImage}
            resizeMode="cover"
            source={{ uri: item }}
          ></Image>
        ) : (
          <Image
            style={[styles.previewImage, { tintColor: "white" }]}
            resizeMode="cover"
            source={`${this.state.defaultFaceImage}`}
          ></Image>
        )}
        <TouchableOpacity
          style={styles.closeButton}
          disabled={item === "" ? true : false}
          onPress={() => {
            this.onRemovePhoto(index);
          }}
        >
          <Text style={[styles.closeText]}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }
  onRemovePhoto(index) {
    const previewImage = this.state.thumbnailPreview;
    const base64Image = this.state.base64Image;
    base64Image[index] = "";
    previewImage[index] = "";
    this.state.count -= 1;
    this.setState({
      thumbnailPreview: previewImage,
      base64Image: base64Image,
      count: this.state.count,
    });
  }
  checkImageCount = () => {
    if (this.state.count == 5) {
      Alert.alert(
        "Success",
        "Registration successfully completed",
        [
          {
            text: "OK",
            onPress: () => NavigationService.navigate("FaceVerificationScreen"),
          },
        ],
        { cancelable: false }
      );
    } else {
      this.setState((prevState) => ({ count: prevState.count + 1 }));
    }
  };
  registerFace = async () => {
    this.setState({ loading: true });
    this.saveFaceReg();
  };
  getImageAndName = async (index) => {
    const { userData, paramsData } = this.state;
    const organizationDetails = await getData(LocalDBItems.organizationDetails);
    var org_name = organizationDetails.org_name.replace(/[ ]+/g, "");
    var full_name = userData.full_name.replace(/[ ]+/g, "");
    const collection_id = `face-collection-${org_name.toLowerCase()}`;
    return await addFaceRekognitionService(
      this.state.base64Image[index],
      `${full_name.toLowerCase()}${index}.jpeg`,
      full_name.toLowerCase(),
      collection_id
    );
  };
  saveFaceReg = async () => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    var faceIDArray = [];
    const faceResultArray = [];
    try {
      const [
        firstResponse,
        secondResponse,
        thirdResponse,
        fourthResponse,
        fifthResponse,
      ] = await Promise.all([
        this.getImageAndName(0),
        this.getImageAndName(1),
        this.getImageAndName(2),
        this.getImageAndName(3),
        this.getImageAndName(4),
      ]);
      if (
        firstResponse === null ||
        secondResponse === null ||
        thirdResponse === null ||
        fourthResponse === null ||
        fifthResponse === null
      ) {
        const [
          firstRetryResponse,
          secondRetryResponse,
          thirdRetryResponse,
          fourthRetryResponse,
          fifthRetryResponse,
        ] = await Promise.all([
          this.getImageAndName(0),
          this.getImageAndName(1),
          this.getImageAndName(2),
          this.getImageAndName(3),
          this.getImageAndName(4),
        ]);
        var faceId = "";
        if (firstRetryResponse != null) {
          faceId = firstRetryResponse.FaceRecords[0].Face.FaceId;
          this.saveFaceIDRegistration(faceId);
        } else {
          this.setState({ loading: false });
        }
      } else {
        faceId = firstResponse.FaceRecords[0].Face.FaceId;
        faceIDArray.push(firstResponse.FaceRecords[0].Face.FaceId);
        faceIDArray.push(secondResponse.FaceRecords[0].Face.FaceId);
        faceIDArray.push(thirdResponse.FaceRecords[0].Face.FaceId);
        faceIDArray.push(fourthResponse.FaceRecords[0].Face.FaceId);
        faceIDArray.push(fifthResponse.FaceRecords[0].Face.FaceId);
        storeData(LocalDBItems.saveFaceIDData, faceIDArray);
        this.saveFaceIDRegistration(faceId);
      }
    } catch (err) {
    }
  };
  navigateToDashboard() {
    this.timer = setInterval(() => {
      this.props.navigation.goBack();
    }, 2000);
  }
  renderRegistrationSuccessPopup() {
    return (
      <Modalize ref={this.modalizeRef} adjustToContentHeight={true}>
        {this.renderContent()}
      </Modalize>
    );
  }
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
        <Image
          style={[styles.profileImage]}
          resizeMode="cover"
          source={{ uri: this.state.thumbnailPreview[0] }}
        ></Image>
        <Image
          style={styles.checkedIcon}
          source={Images.checkTickIcon}
          resizeMode={"contain"}
        />
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 15,
        }}
      >
        <Text style={styles.nameText}>
          {this.userName ? this.userName : "--"}
        </Text>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignSelf: "center",
          marginTop: 15,
          marginHorizontal: 30,
        }}
      >
        <Text style={styles.successMessage}>
          Your face recognize is successfully configured!
        </Text>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignSelf: "center",
          marginTop: 30,
          marginBottom: 30,
          marginHorizontal: 30,
        }}
      >
        <Text style={styles.redirectText}>Redirecting to dashboard...</Text>
      </View>
    </View>
  );
  takePicture = async function () {
    this.state.count += 1;
    if (this.camera) {
      let base64 = "";
      let uri = "";
      await this.camera
        .takePictureAsync({
          base64: true,
          quality: 0.3,
          mirrorImage: false,
          skipProcessing: true,
          fixOrientation: false,
        })
        .then((data) => {
          base64 = data.base64;
          uri = data.uri;
          this.state.thumbnailPreview.map((item, index) => {
            if (item == "" && this.state.count > index) {
              const thumbnailPreview = [...this.state.thumbnailPreview];
              const base64Image = [...this.state.base64Image];
              base64Image[index] = data.base64;
              thumbnailPreview[index] = data.uri;
              this.setState({
                thumbnailPreview: thumbnailPreview,
                base64Image: base64Image,
              });
            }
          });
        });
    }
  };

  toggle = (value) => () =>
    this.setState((prevState) => ({ [value]: !prevState[value] }));

  facesDetected = ({ faces }) => {
    if (faces.length > 0) {
      this.setState({ faces, showAlertIdNoFace: false });
    } else {
      if (this.state.count < 5) {
        this.setState({ faces, showAlertIdNoFace: true });
      }
    }
  };
  saveFaceIDRegistration = async (faceId) => {
    const employeeDetails = await getData(LocalDBItems.employeeDetails);
    let params = {};
    if (this.state.userData != null && this.state.userData.isFromAddMember) {
      params = { empid: this.state.userData.empId, faceid: faceId };
    } else {
      params = { empid: this.state.userData.id, faceid: faceId };
    }
    const requestObj = {
      endpoint: BaseUrl.API_BASE_URL + Endpoint.SAVE_FACEID_REGISTRATION,
      type: "patch",
      params: params,
    };
    const apiResponseData = await apiService(requestObj);
    setTimeout(() => {
      this.setState({
        loading: false,
      });
      if (apiResponseData) {
        storeData(LocalDBItems.isUserAuthenticated, true);
        this.setState({ loading: false });
        if (this.state.userData != null) {
          if (this.state.userData.isFromAddMember) {
            this.props.navigation.pop(2);
          } else {
            this.props.navigation.goBack();
            this.props.route.params.onGoBack();
          }
        } else {
          if (this.modalizeRef.current) {
            this.modalizeRef.current.open();
            this.navigateToDashboard();
          }
        }
      }
    }, 2500);
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
        onFaceDetectionError={(error) => console.log("FDError", error)}
      >
        <View
          style={{
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
            onPress={() => this.props.navigation.goBack()}
          >
            <Icon name="angle-left" size={30} color="white" />
            <Text style={[styles.flipText, { paddingLeft: 15 }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cameraFaceContainer}>
          <View style={{ flex: 1 }}>
            <Image
              style={styles.CameraFaceIcon}
              source={Images.defaultFaceMaskIcon}
              resizeMode={"contain"}
            />
          </View>
        </View>
        {this.renderPreviewThumbnail()}
        {this.state.count < 5 ? (
          <TouchableOpacity
            style={[
              {
                width: "85%",
                marginBottom: 30,
                height: 60,
                marginHorizontal: 24,
                justifyContent: "flex-end",
                alignSelf: "center",
              },
            ]}
            onPress={this.takePicture.bind(this)}
          >
            <LinearGradient
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.0, y: 0.25 }}
              colors={["#fe717f", "#fa8576", "#f6976e"]}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Capture</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => this.registerFace()}
          >
            <LinearGradient
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.0, y: 0.25 }}
              colors={["#fe717f", "#fa8576", "#f6976e"]}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {canDetectFaces && this.renderLandmarks()}
      </RNCamera>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Loader loading={this.state.loading} />
        {this.renderCamera()}
        <CustomPopUpModal
          modalVisible={this.state.showAlertIdNoFace}
          modalCloseAction={this.modalCloseAction}
          isVerifcationPopUp={true}
          isReverification={false}
        />
      </View>
    );
  }
}
