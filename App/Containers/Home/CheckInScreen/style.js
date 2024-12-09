import { StyleSheet } from "react-native";
import { Colors } from "../../../Theme";
import {Dimensions} from 'react-native';

const width_screen = Dimensions.get('window').width;
const height_screen = Dimensions.get('window').height;



const landmarkSize = 2;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  navigationLinearGradient: {
    width: "100%",
    height: "12%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    flexDirection: "row",
  },
  titleText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  flipText: {
    color: "white",
    fontSize: 17,
  },
  startButton: {
    width: "100%",
    height: 44,
    borderRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
  },
  startText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.white,
    backgroundColor: "transparent",
  },
  cancelButton: {
    width: "100%",
    height: 44,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: "#c5c5c5",
    justifyContent: "center",
  },
  
  projectDetailContainer: {
    flex: 1,
    height: 120,
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#00000019",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  projectTopContainer: {
    flexDirection: "row",
    padding: 10,
  },
  customerContainer: {
    flex: 1,
    padding: 5,
  },
  customerHeaderText: {
    fontSize: 10,
    color: "#c9c9c9",
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',  // Centers the heading
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e1e1e',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#444',
    flex: 2,
    textAlign: 'right',
  },
  iconButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  messageContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  message: {
    fontSize: 17,
    color: '#555',
  },
  contactHeaderText: {
    fontSize: 10,
    color: "#c9c9c9",
    textAlign: "right",
  },
  customerValueText: {
    fontSize: 10,
    color: "black",
  },
  viewText: {
    fontSize: 15,
    color: "black",
  },
  contactValueText: {
    fontSize: 10,
    color: "black",
    textAlign: "right",
  },
  teamContainer: {
    width: "100%",
    height: 50,
    marginTop: 40,
  },
  teamButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "red",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    flexDirection: "row",
  },
  teamText: {
    fontSize: 17,
    color: "red",
    paddingRight: 10,
  },
  dropDownContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#fcfcfc",
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  dropDownInputContainer: {
    borderBottomColor: "transparent",
    paddingLeft: 16,
    paddingRight: 16,
    height: 12,
  },
  tabsContainerStyle: {
    height: 40,
  },
  tabStyle: {
    backgroundColor: "white",
    borderColor: "#fe717f",
  },
  tabTextStyle: {
    color: "#fe717f",
    fontSize: 14,
  },
  activeTabStyle: {
    backgroundColor: "#fe717f",
  },
  activeTabTextStyle: {
    fontSize: 14,
    color: "white",
  },
  addTeamMemberContainer: {
    flexDirection: "column",
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#00000019",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    marginBottom: 10,
    marginTop: 10,
  },
  addMemberNameContainer: {
    flex: 1,
  },
  addMemberDesignationContainer: {
    flex: 1,
  },
  addMemberTypeContainer: {
    flex: 1,
  },
  addHeaderText: {
    color: "#fe717f",
    fontSize: 14,
  },
  addValueText: {
    color: "black",
    fontSize: 14,
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
  content: {
    flex: 1,
    marginTop: 10,
    padding: 20,
    marginHorizontal: 10,
  },

  content__icon: {
    width: 32,
    height: 32,

    marginBottom: 20,
  },
  checkedIcon: {
    width: 20,
    height: 20,
    // tintColor: 'green',
    position: "absolute",
    top: -10,
    alignSelf: "center",
  },
  nameText: {
    marginBottom: 2,
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },
  successMessage: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 21,
    marginHorizontal: 24,
    fontWeight: "200",
    lineHeight: 22,
    color: "#666",
  },
  redirectText: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    marginHorizontal: 24,
    fontWeight: "200",
    lineHeight: 22,
    color: "red",
    textTransform: "uppercase",
  },
  projectText: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    marginHorizontal: 24,
    fontWeight: "200",
    lineHeight: 22,
    color: "red",
    textTransform: "uppercase",
    textAlign:"center"
  },
  previewImage: {
    width: 75,
    height: 75,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "green",
  },
  cancelImage: {
    height: 20,
    width: 20,
  },
  checkInButton: {
    width: "100%",
    height: 60,
    borderRadius: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
  checkInText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: Colors.white,
    backgroundColor: "transparent",
  },
  projectDetails:{
    fontSize: 140,
    color: "#666",
    textAlign:"right"
  }
});
