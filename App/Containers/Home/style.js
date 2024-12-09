import { StyleSheet } from 'react-native'
import { Helpers, Metrics, Fonts, Colors } from '../../Theme'
import {Dimensions} from 'react-native';


const width_screen = Dimensions.get('window').width;
const height_screen = Dimensions.get('window').height;



const landmarkSize = 2;
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  logoContainer: {
    ...Helpers.fullWidth,
    height: 300,
    marginBottom: 25,
  },
  navigationLinearGradient: {
    height: '12%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    position: 'relative',
  
  },
  flipText: {
    color: "white",
    fontSize: 17,
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
  CameraFaceIcon: {
    // height: 500,
    // width: width_screen - 10,
     height: height_screen - 260,
     width: width_screen + 100,
    tintColor: "white",
  },
  cameraFaceContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
     top: 20,
    flexDirection: "column",
  },
  titleText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    width: '75%'
  },
  checkInButton: {
    width: '100%',
    height: 44,
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
},
checkInText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: Colors.white,
    backgroundColor: 'transparent',
},
breakInButton: {
  width: '88%',
  height: 44,
  borderRadius: 16,
  alignSelf: 'center',
  backgroundColor: Colors.white,
  justifyContent: 'center',
  marginBottom: 30,
  marginHorizontal: 24,
  borderColor: 'gray',
  borderWidth: 1,

},
breakInText: {
  textAlign: 'center',
  fontSize: 14,
  fontWeight: '600',
  textTransform: 'uppercase',
  color: '#fa8576',
  backgroundColor: 'transparent',
},
topContainer: {
  flexDirection: "column",
  marginTop: 20,
},
topSubContainer: {
  justifyContent: "center",
  flexDirection: "row",
},
innerContainer: {
  flex: 1,
  height: 102,
  borderRadius: 6,
  backgroundColor: Colors.pinkBorder,
  marginHorizontal: 13,
  marginBottom: 13,
},
innerImageContainer: {
  justifyContent: "flex-end",
  alignItems: "flex-end",
  paddingTop: 15,
  paddingRight: 15,
},
innerTextContainer: {
  flexDirection: "column",
  marginLeft: 21,
},
innerIcon: {
  height: 24,
  width: 24,
},
headingText: {
  fontSize: 14,
  fontWeight: "500",
  fontStyle: "normal",
  lineHeight: 24,
  letterSpacing: 0.32,
  color: Colors.white,
},
subContentText: {
  fontSize: 18,
  fontWeight: "600",
  fontStyle: "normal",
  lineHeight: 24,
  letterSpacing: 0.32,
  color: Colors.white,
},
buttonContainer: {
  flexDirection: 'column',
  justifyContent: 'flex-end',
  // marginTop: 48,
  marginBottom: 20,
},
})
