import React, { useState } from "react";
import { Modal, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import color from "../../../Theme/Colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UtilityHelper from "../../../Components/UtilityHelper";
import { Colors } from "react-native/Libraries/NewAppScreen";

const ViewDescriptionPopupScreen = ({
  modalVisible,
  viewDescriptionValue,
  modalCloseAlertAction,
  isViewDecription,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        modalCloseAlertAction();
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.containerView}>
            <View style={styles.topView}>
              {isViewDecription && (
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 40,
                    height: 40,
                    right: 5,
                    top: 15,
                  }}
                  onPress={() => modalCloseAlertAction()}
                >
                  <Icon name="close" size={30} color="grey" />
                </TouchableOpacity>
              )}
              <View style={{ top: 15, height: 50, marginHorizontal: 20 }}>
                <Text style={styles.modalText1}> {"View Description"}</Text>
                <View
                  style={{
                    width: "100%",
                    top: 10,
                    height: 1,
                    backgroundColor: Colors.darkGrey,
                  }}
                ></View>
              </View>
              <View style={styles.projectDetailContainer}>
                <View style={styles.projectTopContainer}>
                  <View style={styles.customerContainer}>
                    <Text style={styles.customerHeaderText}>Customer Name</Text>
                    <Text style={styles.customerValueText}>
                      {viewDescriptionValue.cst_name}
                    </Text>
                  </View>
                  <View style={styles.customerContainer}>
                    <Text style={styles.contactHeaderText}>Contact</Text>
                    <Text style={styles.contactValueText}>
                      {viewDescriptionValue.phone}
                    </Text>
                  </View>
                </View>
                <View style={styles.projectTopContainer}>
                  <View style={styles.customerContainer}>
                    <Text style={styles.customerHeaderText}>
                      Customer Email
                    </Text>
                    <Text style={styles.customerValueText}>
                      {viewDescriptionValue.email}
                    </Text>
                  </View>
                  <View style={styles.customerContainer}>
                    <Text style={styles.contactHeaderText}>Status</Text>
                    <Text style={styles.contactValueText}>
                      {viewDescriptionValue.project_status_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.projectTopContainer}>
                  <View style={styles.customerContainer}>
                    <Text style={styles.customerHeaderText}>Project Name</Text>
                    <Text style={styles.customerValueText}>
                      {viewDescriptionValue.project_name}
                    </Text>
                  </View>
                  <View style={styles.customerContainer}>
                    <Text style={styles.contactHeaderText}>
                      Project Prefix
                    </Text>
                    <Text style={styles.contactValueText}>
                      {viewDescriptionValue.project_prefix}
                    </Text>
                  </View>
                </View>
                <View style={[styles.projectTopContainer]}>
                  <View style={styles.customerContainer}>
                    <Text style={styles.customerHeaderText}>Start Date</Text>
                    <Text style={styles.customerValueText}>
                      {UtilityHelper.getDateAndTimeToString(
                        viewDescriptionValue.start_date
                      )}
                    </Text>
                  </View>
                  <View style={[styles.customerContainer]}>
                    <Text style={styles.contactHeaderText}>End Date</Text>
                    <Text style={styles.contactValueText}>
                      {UtilityHelper.getDateAndTimeToString(
                        viewDescriptionValue.end_date
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
    width: "88%",
    margin: 40,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    height: "47%",
  },
  roundedView: {
    width: 100,
    height: 100,
    backgroundColor: "white",
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
    elevation: 5,
  },
  topView: {
    flex: 1,
    borderRadius: 20,
    flexDirection: "column",
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
    fontStyle: "normal",
    fontWeight: "600",
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
  projectDetailContainer: {
    flex: 1,
    width: "100%",
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
    fontSize: 15,
    color: "#c9c9c9",
  },

  contactHeaderText: {
    fontSize: 15,
    color: "#c9c9c9",
    textAlign: "right",
  },
  customerValueText: {
    fontSize: 14,
    color: "black",
  },
  viewText: {
    fontSize: 15,
    color: "black",
  },
  contactValueText: {
    fontSize: 14,
    color: "black",
    textAlign: "right",
  },
});

export default ViewDescriptionPopupScreen;
