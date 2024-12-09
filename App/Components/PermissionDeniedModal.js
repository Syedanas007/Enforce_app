import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from "react-native";
import color from '../Theme/Colors'
import Images from '../Theme/Images'
import LinearGradient from 'react-native-linear-gradient';

const PermissionDeniedModal = ({ modalVisible, modalCloseAction,}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        modalCloseAction()
      }}
    >
      <View style={styles.centeredView}>

        <View style={styles.modalView}>
          <View style={styles.containerView}>
            <View style={styles.topView}>
              <View style={styles.roundedView}>
                <Image source={Images.modalLocationImage} style={{ width: 50, height: 50 }} />
              </View>
              <View style={{ top: -30, marginHorizontal: 20 }}>
                <Text style={styles.modalText1}> {'Permission Denied'}</Text>
                <Text style={[styles.modalText2,{color:color.darkGrey}]}>{'You have denied some permission  which uses the app'}</Text>

              </View>

            </View>

              <View style={{ flexDirection: 'row', marginHorizontal: 30, justifyContent: 'space-between', marginTop: 10, marginBottom: 20 }}>
                <TouchableOpacity style={{ marginLeft: 10, flex: 1, justifyContent: 'center', alignSelf: 'center' }} onPress={() => modalCloseAction()}>
                  <LinearGradient
                    start={{ x: 0.5, y: 1.0 }} end={{ x: 0.0, y: 0.25 }}
                    colors={['#fe717f', '#fa8576', '#f6976e']} style={styles.checkInButton}>
                    <Text style={styles.checkInText}>
                      Settings
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
    flexDirection: 'column'
  },
  modalView: {
    margin: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: "center",
    shadowColor: "#000",
    width:'100%',
    height:'100%',
  },
  containerView: {
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
  },
  roundedView: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: "center",
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4
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
    borderRadius: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText1: {
    textAlign: "center",
    fontSize: 21
  },
  modalText2: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 13,
    color: color.lightGrey
  },
  modalText3: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
  },
  dropDownContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fcfcfc',
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDownInputContainer: {
    borderBottomColor: 'transparent',
    paddingLeft: 16,
    paddingRight: 16,
    height: 120
  },
  checkInText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: color.white,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: color.pinkBorder,
    backgroundColor: 'transparent',
  },
  checkInButton: {
    width: '100%',
    height: 40,
    borderRadius: 24,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default PermissionDeniedModal;