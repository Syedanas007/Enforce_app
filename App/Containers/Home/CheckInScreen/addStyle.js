import { StyleSheet } from "react-native";
import { Helpers, Colors } from "../../../Theme";

const landmarkSize = 2;
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  logoContainer: {
    ...Helpers.fullWidth,
    height: 300,
    marginBottom: 25,
  },
  logo: {
    flex: 1,
    position: "relative",
  },
  logoText: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 120,
    flexDirection: "column",
  },
  logoTextIcon: {
    height: 300,
    width: 250,
  },
  CameraFaceIcon: {
    height: 500,
    width: 450,
    tintColor: "white",
  },
  cameraFaceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
   // top: 80,
    flexDirection: "column",
  },
  getStartedButton: {
    width: "100%",
    height: 60,
    borderRadius: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
  getStartedText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.white,
    backgroundColor: "transparent",
  },
  closeText: {
    fontSize: 12,
  },
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
    fontSize: 17,
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
  closeButton: {
    width: 75,
    marginTop: 0,
    height: 20,
    backgroundColor: "white",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    opacity: 0.5,
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: 75,
    height: 75,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'green',
  },
  captureButton: {
    width: "85%",
    marginBottom: 30,
    height: 60,
    marginHorizontal: 24,
    justifyContent: "flex-end",
    alignSelf: "center",
  },
  popupView: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    marginTop: 20,
    padding: 20,
  },

  content__icon: {
    width: 32,
    height: 32,

    marginBottom: 20,
  },
  checkedIcon: {
    width: 25,
    height: 25,
    // tintColor: 'green',
    position: 'absolute',
    top: -10
},
  nameText: {
    marginBottom: 2,
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  successMessage: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 21,
    marginHorizontal: 24,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',

  },
  redirectText: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    marginHorizontal: 24,
    fontWeight: '200',
    lineHeight: 22,
    color: 'red',
    textTransform: 'uppercase',

  },

});
