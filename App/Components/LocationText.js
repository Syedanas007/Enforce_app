import * as React from "react";
import { View, TextInput, StyleSheet } from "react-native";

const LocationText = ({ locationName, isEditabe, setLocationName }) => {
  return (
    <View style={styles.background}>
      <TextInput
        multiline
        style={styles.textInput}
        onChangeText={(text) => setLocationName(text)}
        placeholder={"Enter location/Project"}
        value={locationName}
        editable={isEditabe}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  background: {
    marginTop: 1,
    margin: 10,
    flexDirection: "column",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "lightgray",
    height: 60,
    borderRadius: 4,
  },
  textInput: {
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    marginHorizontal: 2,
    paddingHorizontal: 5,
    fontSize: 12,
  },
});

export default LocationText;
