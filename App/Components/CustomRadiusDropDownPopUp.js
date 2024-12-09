import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import color from "../Theme/Colors";
import Images from "../Theme/Images";

import DropDownPicker from "react-native-dropdown-picker";
import LinearGradient from "react-native-linear-gradient";

const CustomPopUpModal = ({
  modalVisible,
  modalCloseAction,
  modalReverifyAction,
  isVerifcationPopUp,
  verrifcationAction,
  isReverification,
  items,
  dropDownSelection,
  isDisabled,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        //  Alert.alert("Modal has been closed.");
        modalCloseAction();
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
                    isVerifcationPopUp
                      ? Images.faceid
                      : Images.modalLocationImage
                  }
                  style={{ width: 50, height: 50 }}
                />
              </View>
              <View style={{ top: -30, marginHorizontal: 20 }}>
                <Text style={styles.modalText1}> Are you on site?</Text>
                <Text
                  style={[
                    styles.modalText2,
                    {
                      color: isVerifcationPopUp
                        ? color.darkGrey
                        : color.lightGrey,
                    },
                  ]}
                >
                  {isVerifcationPopUp
                    ? "We could not verify because we could not find the right face, Please try again"
                    : "if you are going from the site yopu can assign task to any person present in your team"}
                </Text>
                {isVerifcationPopUp ? null : (
                  <Text style={styles.modalText3}>
                    Please select your team member whom you assign the task
                  </Text>
                )}
                {isVerifcationPopUp ? null : (
                  <DropDownPicker
                    zIndex={10000}
                    items={items}
                    placeholder="Select Member"
                    multiple={false}
                    searchable={true}
                    searchablePlaceholder="Select Member"
                    searchablePlaceholderTextColor="gray"
                    seachableStyle={{}}
                    containerStyle={{ height: 70, marginHorizontal: 10 }}
                    dropDownInputContainer={[
                      styles.dropDownInputContainer,
                      { backgroundColor: "lightgrey" },
                    ]}
                    style={styles.dropDownContainer}
                    itemStyle={{
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 40,
                    }}
                    dropDownStyle={{
                      marginTop: 25,
                      backgroundColor: "#fcfcfc",
                    }}
                    onChangeItem={(item, index) =>
                      dropDownSelection(item, index)
                    }
                  />
                )}
              </View>
            </View>
            {isVerifcationPopUp ? (
              <>
                {isReverification ? (
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
                        flex: 1,
                        marginRight: 10,
                        justifyContent: "center",
                        alignSelf: "center",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: color.pinkBorder,
                        height: 40,
                      }}
                      onPress={() => modalCloseAction()}
                    >
                      <Text style={styles.cancelButton}>Cancel</Text>
                      {/* </LinearGradient> */}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        marginLeft: 10,
                        flex: 1,
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                      onPress={() => modalReverifyAction()}
                    >
                      <LinearGradient
                        start={{ x: 0.5, y: 1.0 }}
                        end={{ x: 0.0, y: 0.25 }}
                        colors={["#fe717f", "#fa8576", "#f6976e"]}
                        style={styles.checkInButton}
                      >
                        <Text style={styles.checkInText}>Reverify</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
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
                      onPress={() => modalCloseAction()}
                    >
                      <LinearGradient
                        start={{ x: 0.5, y: 1.0 }}
                        end={{ x: 0.0, y: 0.25 }}
                        colors={["#fe717f", "#fa8576", "#f6976e"]}
                        style={styles.checkInButton}
                      >
                        <Text style={styles.checkInText}>Ok</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </>
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
                  onPress={() => modalCloseAction()}
                >
                  <Text style={styles.cancelButton}>Cancel</Text>
                  {/* </LinearGradient> */}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    flex: 1,
                    justifyContent: "center",
                    alignSelf: "center",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onPress={() => modalReverifyAction()}
                  disabled={isDisabled}
                >
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.0, y: 0.25 }}
                    colors={["#fe717f", "#fa8576", "#f6976e"]}
                    style={styles.checkInButton}
                  >
                    <Text style={styles.checkInText}>Submit</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            {/* <View style={{flexDirection:'row',marginHorizontal:30,justifyContent:'space-between',marginTop:40,marginBottom:30}}>
                          <TouchableOpacity style={{ flex:1,marginRight: 10, justifyContent: 'center', alignSelf: 'center',borderRadius:20,borderWidth:1,borderColor:color.pinkBorder,height:40 }} onPress={() => this.navigateToCheckInScreen()}>
                      
                          <Text style={styles.cancelButton}>
                            Cancel
                          </Text>
                    </TouchableOpacity>
                          <TouchableOpacity style={{marginLeft: 10,flex:1,justifyContent: 'center', alignSelf: 'center' }} onPress={() => modalCloseAction()}>
                        <LinearGradient
                          start={{ x: 0.5, y: 1.0 }} end={{ x: 0.0, y: 0.25 }}
                          colors={['#fe717f', '#fa8576', '#f6976e']} style={styles.checkInButton}>
                          <Text style={styles.checkInText}>
                            Submit
                          </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    </View> */}
          </View>
          {/* <Text style={styles.modalText}>Hello World!</Text>

            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress ={() => modalCloseAction('mohhh')}
            >
              <Text style={styles.textStyle}>Hide Modal</Text>
            </TouchableHighlight> */}
        </View>
      </View>

      {/* <TouchableHighlight
        style={styles.openButton}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Text style={styles.textStyle}>Show Modal</Text>
      </TouchableHighlight> */}
      {/* </View> */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    // width:'100%',
    // height:'100%',
    // margin:-20,
    // flex: 1,

    // backgroundColor: 'rgba(0,0,0,0.5)',
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    // marginTop: 22,
    // paddingHorizontal:10
  },
  modalView: {
    margin: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    // backgroundColor:'green',
    // borderRadius: 20,
    // padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    width: "100%",
    height: "100%",

    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    // flex: 1
  },
  containerView: {
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    // padding: 35,
    // alignItems: "center",
    shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2
    // },

    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    // flex:1
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
    fontSize: 17,
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

export default CustomPopUpModal;
