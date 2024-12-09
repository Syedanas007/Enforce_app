import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import color from "../Theme/Colors";
import Images from "../Theme/Images";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import DropDownPicker from "react-native-dropdown-picker";
import LinearGradient from "react-native-linear-gradient";

const AlertPopup = ({
  modalVisible,
  modalCloseAlertAction,
  isCheckOutPopup,
  modalCheckOutAction,
  modalEndOfWorkAction,
  modalLogoutAction,
}) => {
  // [setModalVisible] = useState(false);
  return (
    <Modal
      // style={{flex:1}}
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        modalCloseAlertAction();
      }}
    >
      <View style={styles.centeredView}>
        {/* <View style={styles.centeredView}> */}
        <View style={styles.modalView}>
          <View style={styles.containerView}>
            <View style={styles.topView}>
              <View style={styles.roundedView}>
                <Image
                  source={
                    isCheckOutPopup ? Images.attendance : Images.exception
                  }
                  style={{ width: 50, height: 50 }}
                />
              </View>
              {isCheckOutPopup && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    right: 10,
                    top: 10,
                  }}
                  onPress={() => modalCloseAlertAction()}
                >
                  <Icon name="close" size={30} color="grey" />
                </TouchableOpacity>
              )}
              <View style={{ top: -30, marginHorizontal: 20 }}>
                <Text style={styles.modalText1}>
                  {" "}
                  {isCheckOutPopup ? "Check Out" : "Log out?"}
                </Text>
                <Text
                  style={[
                    styles.modalText2,
                    {
                      color: isCheckOutPopup ? color.darkGrey : color.darkGrey,
                    },
                  ]}
                >
                  {isCheckOutPopup
                    ? "Are you sure you want to Check out? "
                    : "Are you sure you want to logout?"}
                </Text>
              </View>
            </View>
            {isCheckOutPopup ? (
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
                    marginLeft: 10,
                    flex: 1,
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                  onPress={() => modalCheckOutAction()}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={styles.checkInButton}
                  >
                    <Text style={styles.checkInText}>Check Out</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    flex: 1,
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                  onPress={() => modalEndOfWorkAction()}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={styles.checkInButton}
                  >
                    <Text style={styles.checkInText}>End of Day</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 30,
                  justifyContent: "space-between",
                  marginTop: 40,
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
                  onPress={() => modalCloseAlertAction()}
                >
                  {/* <LinearGradient
                    start={{ x: 0.5, y: 1.0 }} end={{ x: 0.0, y: 0.25 }}
                    colors={['#fe717f', '#fa8576', '#f6976e']} style={styles.checkInButton}> */}
                  <Text style={styles.cancelButton}>No</Text>
                  {/* </LinearGradient> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    flex: 1,
                    justifyContent: "center",
                    alignSelf: "center",
                  }}
                  onPress={() => modalLogoutAction()}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={styles.checkInButton}
                  >
                    <Text style={styles.checkInText}>Yes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    alignItems: "center",
    flexDirection: "column",
  },
  modalView: {
    margin: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    width: "100%",
    height: "100%",
  },
  containerView: {
    width: "80%",
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
  },
  roundedView: {
    // margin: 20,
    width: 100,
    height: 100,
    backgroundColor: "white",
    // borderRadius: 20,
    // padding: 35,
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
  },
  topView: {
    // margin: 20,
    // width:100,
    // height:100,
    // backgroundColor: "red",
    borderRadius: 20,
    flexDirection: "column",
    // padding: 35,
    // // alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText1: {
    // marginTop: 15,
    textAlign: "center",
    fontSize: 21,
  },
  modalText2: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 13,
    color: color.lightGrey,
  },
  modalText3: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
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
    // paddingBottom:  16
  },
  dropDownInputContainer: {
    borderBottomColor: "transparent",
    paddingLeft: 16,
    paddingRight: 16,
    height: 120,
  },
  checkInText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    color: color.white,
    backgroundColor: "transparent",
  },
  cancelButton: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "uppercase",
    color: color.pinkBorder,
    backgroundColor: "transparent",
  },
  checkInButton: {
    width: "100%",
    height: 40,
    borderRadius: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
});

export default AlertPopup;
