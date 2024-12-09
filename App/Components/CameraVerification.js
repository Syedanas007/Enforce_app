import React, { PureComponent } from "react";
import { RNCamera, FaceDetector } from "react-native-camera";
import Icon from "react-native-vector-icons/dist/FontAwesome";
import {
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { View } from "react-native";

const landmarkSize = 2;

export default class CameraVerification extends PureComponent {
  state = {
    flash: "off",
    zoom: 0,
    autoFocus: "on",
    autoFocusPoint: {
      normalized: { x: 0.5, y: 0.5 }, // normalized values required for autoFocusPointOfInterest
      drawRectPosition: {
        x: Dimensions.get("window").width * 0.5 - 32,
        y: Dimensions.get("window").height * 0.5 - 32,
      },
    },
    depth: 0,
    type: "front",
    whiteBalance: "auto",
    ratio: "16:9",
    recordOptions: {
      mute: false,
      maxDuration: 5,
      //quality: RNCamera.Constants.VideoQuality["4:3"]
    },
    canDetectFaces: true,
    faces: [],
    count: 0,
  };

  touchToFocus(event) {
    const { pageX, pageY } = event.nativeEvent;
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;
    const isPortrait = screenHeight > screenWidth;

    let x = pageX / screenWidth;
    let y = pageY / screenHeight;
    // Coordinate transform for portrait. See autoFocusPointOfInterest in docs for more info
    if (isPortrait) {
      x = pageY / screenHeight;
      y = -(pageX / screenWidth) + 1;
    }

    this.setState({
      autoFocusPoint: {
        normalized: { x, y },
        drawRectPosition: { x: pageX, y: pageY },
      },
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
  takePicture = async function () {
    if (this.camera) {
      let base64 = "";
      await this.camera
        .takePictureAsync({
          base64: true,
          quality: 0.3,
        })
        .then((data) => {
          base64 = data.base64;
        });
    }
  };

  toggle = (value) => () =>
    this.setState((prevState) => ({ [value]: !prevState[value] }));

  facesDetected = ({ faces }) => this.setState({ faces });

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
      <View key={`landmarks-${face.faceID}`}>
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

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>
  );

  renderLandmarks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>
  );
  renderCamera() {
    const { canDetectFaces } = this.state;

    const drawFocusRingPosition = {
      top: this.state.autoFocusPoint.drawRectPosition.y - 32,
      left: this.state.autoFocusPoint.drawRectPosition.x - 32,
    };
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
        autoFocusPointOfInterest={this.state.autoFocusPoint.normalized}
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
          FaceDetector.Constants.Landmarks
            ? FaceDetector.Constants.Landmarks.all
            : undefined
        }
        onFacesDetected={canDetectFaces ? this.facesDetected : null}
        faceDetectionMode={
          FaceDetector.Constants.Mode
            ? FaceDetector.Constants.Mode.fast
            : undefined
        }
        faceDetectionClassifications={
          FaceDetector.Constants.Classifications
            ? FaceDetector.Constants.Classifications.all
            : undefined
        }
      >
        <View
          style={{
            flex: 0.5,
            height: 72,
            backgroundColor: "transparent",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <View
            style={{
              backgroundColor: "transparent",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          ></View>
        </View>
        <View style={{ bottom: 0 }}>
          <View
            style={{
              height: 20,
              backgroundColor: "transparent",
              flexDirection: "row",
              alignSelf: "flex-end",
            }}
          ></View>
          {this.state.zoom !== 0 && (
            <Text style={[styles.flipText, styles.zoomText]}>
              Zoom: {this.state.zoom}
            </Text>
          )}
          <View
            style={{
              height: 56,
              backgroundColor: "transparent",
              flexDirection: "row",
              alignSelf: "flex-end",
            }}
          >
            <TouchableOpacity
              style={[
                styles.flipButton,
                styles.picButton,
                { flex: 0.3, alignSelf: "flex-end" },
              ]}
              onPress={this.takePicture.bind(this)}
            >
              <Text style={styles.flipText}> SNAP </Text>
            </TouchableOpacity>
          </View>
        </View>
        {canDetectFaces && this.renderFaces()}
        {canDetectFaces && this.renderLandmarks()}
      </RNCamera>
    );
  }
  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: "#000",
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: "white",
    borderWidth: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  autoFocusBox: {
    position: "absolute",
    height: 64,
    width: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
    opacity: 0.4,
  },
  flipText: {
    color: "white",
    fontSize: 15,
  },
  zoomText: {
    position: "absolute",
    bottom: 70,
    zIndex: 2,
    left: 2,
  },
  picButton: {
    backgroundColor: "darkseagreen",
  },
  facesContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: "absolute",
    borderColor: "#FFD700",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: "absolute",
    backgroundColor: "red",
  },
  faceText: {
    color: "#FFD700",
    fontWeight: "bold",
    textAlign: "center",
    margin: 10,
    backgroundColor: "transparent",
  },
  text: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: "absolute",
    borderColor: "#F00",
    justifyContent: "center",
  },
  textBlock: {
    color: "#F00",
    position: "absolute",
    textAlign: "center",
    backgroundColor: "transparent",
  },
});
