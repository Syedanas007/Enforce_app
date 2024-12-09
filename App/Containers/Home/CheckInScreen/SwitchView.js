import * as React from "react";
import {
  Text,
  View,
  Switch,
} from "react-native";
import styles from "./style";
import { RadioButton } from "react-native-paper";

const SwitchView = ({
  onChooseOffice,
  isOffice,
  onChooseWrkFromHome,
  isWorkFromHome,
  onChooseManual,
  isManual,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Text style={styles.teamText}>Office</Text>
        <Switch
          value={isOffice}
          color={"#fe717f"}
          onValueChange={onChooseOffice}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Text style={styles.teamText}>WFH</Text>
        <Switch
          value={isWorkFromHome}
          color={"#fe717f"}
          onValueChange={onChooseWrkFromHome}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Text style={styles.teamText}>Manual</Text>
        <Switch
          value={isManual}
          color={"#fe717f"}
          onValueChange={onChooseManual}
        />
      </View>
    </View>
  );
};

const SwitchViewNew = ({
  onChooseOffice,
  isOffice,
  onChooseWrkFromHome,
  isWorkFromHome,
  onChoosePlace,
  isPlace,
}) => {
  return (
    <View
      style={{
        flexDirection: "column",
        padding: 20,
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          height: 60,
        }}
      >
        <Text style={[styles.teamText, { color: "grey" }]}>Office / WFH</Text>
        <Switch
          value={isPlace}
          color={"#229b6f"}
          onValueChange={onChoosePlace}
        />
        <Text style={[styles.teamText, { color: "grey" }]}>Place</Text>
      </View>
      <View
        style={{
          height: 1,
          marginTop: 20,
          backgroundColor: "#DCDCDC",
          flex: 1,
        }}
      ></View>
      {isPlace == false && (
        <OfficeAndWfhView
          onChooseOffice={onChooseOffice}
          isOffice={isOffice}
          isWorkFromHome={isWorkFromHome}
          onChooseWrkFromHome={onChooseWrkFromHome}
        />
      )}
    </View>
  );
};

const OfficeAndWfhView = ({
  onChooseOffice,
  isOffice,
  onChooseWrkFromHome,
  isWorkFromHome,
}) => {
  return (
    <View style={{ flexDirection: "row", marginTop: 30, height: 60 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#DCDCDC",
          padding: 10,
          borderRadius: 20,
          justifyContent: "center",
          height: 40,
          alignItems: "center",
        }}
      >
        <Text style={[styles.teamText, { color: "grey" }]}>Office</Text>
        <RadioButton
          color="#229b6f"
          status={isOffice ? "checked" : "unchecked"}
          onPress={onChooseOffice}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          marginLeft: 20,
          backgroundColor: "#DCDCDC",
          padding: 10,
          borderRadius: 20,
          justifyContent: "center",
          height: 40,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Text style={[styles.teamText, { color: "grey" }]}>WFH</Text>
        <RadioButton
          color="#229b6f"
          status={isWorkFromHome ? "checked" : "unchecked"}
          onPress={onChooseWrkFromHome}
        />
      </View>
    </View>
  );
};

export default SwitchViewNew;
