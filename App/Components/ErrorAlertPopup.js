import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import color from "../Theme/Colors";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ErrorAlertPopup = ({
  modalVisible,
  modalCloseAlertAction,
  isForceCheckoutPopup,
  modalCheckOutAction,
  modalEndOfWorkAction,
  modalLogoutAction
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const storeDataReport = async () => {
    try {
      await AsyncStorage.setItem("newNameKey", selectedValue);
      const timeValue = JSON.stringify({
        hour: selectedHour,
        minute: selectedMinute,
        period: selectedPeriod
      });
      const formattedTime = `${selectedHour}:${selectedMinute}:00 ${selectedPeriod}`;
      await AsyncStorage.setItem("forcetime", formattedTime);
          console.log(selectedHour,selectedMinute,selectedPeriod,formattedTime,"formattedTime")

      modalLogoutAction();
    } catch (error) {
      console.error(error);
    }
  };

  const onValueChange = (itemValue) => {
    setSelectedValue(itemValue);
    if (itemValue === 'Forgot to Checkout') {
      setShowTimePicker(true);
    } else {
      setShowTimePicker(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={modalCloseAlertAction}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.containerView}>
            <View style={styles.topView}>
              {isForceCheckoutPopup && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={modalCloseAlertAction}
                >
                  <Icon name="close" size={30} color="grey" />
                </TouchableOpacity>
              )}
              <View style={styles.modalContent}>
                <Text style={styles.modalText1}>FORCE CHECKOUT</Text>
                <Text style={styles.modalText2}>Are you sure to force check out?</Text>
                <Text style={styles.modalText2}>Reason for Force Checkout</Text>
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={onValueChange}
                >
                  <Picker.Item label="Select an Option" value="" />
                  <Picker.Item label="Forgot to Checkout" value="Forgot to Checkout" />
                  <Picker.Item label="Still am in the Location" value="Still am in the Location" />
                </Picker>
                {showTimePicker && (
                  <View style={styles.customPicker}>
                    <Text style={{textAlign:'center'}}>Hour</Text>
                    <Picker
                      selectedValue={selectedHour}
                      onValueChange={(item) => setSelectedHour(item)}
                     
                      
                    >
                      {hours.map(hour => (
                        <Picker.Item key={hour} label={hour} value={hour} />
                      ))}
                    </Picker>
                    <Text style={{textAlign:'center'}}>Minutes</Text>
                    <Picker
                      selectedValue={selectedMinute}
                      onValueChange={(item) => setSelectedMinute(item)}
                    
                    >
                      {minutes.map(minute => (
                        <Picker.Item key={minute} label={minute} value={minute} />
                      ))}
                    </Picker>
                    <Text style={{textAlign:'center'}}>AM/PM</Text>
                    <Picker
                      selectedValue={selectedPeriod}
                      onValueChange={(item) => setSelectedPeriod(item)}
                    
                    >
                      {periods.map(period => (
                        <Picker.Item key={period} label={period} value={period} />
                      ))}
                    </Picker>
                  </View>


                )}
              </View>
            </View>
            {isForceCheckoutPopup ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={modalCheckOutAction}
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
                  style={styles.actionButton}
                  onPress={modalEndOfWorkAction}
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
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={modalCloseAlertAction}
                >
                  <Text style={styles.cancelButtonText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={storeDataReport}
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
    </Modal >
  );
};

const styles = StyleSheet.create({
  customPicker:{
    display:'flex',
  },
  centeredView: {
    alignItems: "center",
    flexDirection: "column",
  },
  centeredView2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    margin: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },


  modalsView: {
    margin: 0,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 100,
  },

  containerView: {
    width: "80%",
    margin: 40,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
  },
  closeButton: {
    position: "absolute",
    width: 40,
    height: 40,
    right: 10,
    top: 10,
  },
  topView: {
    borderRadius: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  modalContent: {
    top: -30,
    marginHorizontal: 20,
  },
  modalText1: {
    textAlign: "center",
    fontSize: 21,
  },
  modalText2: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 13,
    color: color.darkGrey,
    fontWeight: "bold",
  },
  customText: {
    textAlign: "center",
    fontSize: 15,
    color: color.darkGrey,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: 30,
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
  },
  checkInButton: {
    width: "100%",
    height: 40,
    borderRadius: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
  checkInText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    color: color.white,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: color.pinkBorder,
    height: 40,
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "uppercase",
    color: color.pinkBorder,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    fontSize: 100,
    padding: 100,
    color: 'black',
  },
  selectedItem: {
    fontSize: 100,
    padding: 100,
    color: 'blue',
    fontWeight: 'bold',
  },
  separator: {
    fontSize: 10,
    paddingHorizontal: 50,
  },
});

export default ErrorAlertPopup;
