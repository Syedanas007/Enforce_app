import { StyleSheet } from "react-native";
import { Helpers } from "../../Theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
  },
  logoTextIcon: {
    height: 350,
    width: 300,
  },
});
