import { StyleSheet } from "react-native";
import { Helpers, Colors } from "../../Theme";

export default StyleSheet.create({
  defaultFontFamily: {
    fontFamily: 'lucida grande',
},
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
    width: "100%",
    height: "100%",
    //flex: 1,
    position: "relative",
  },
  logoText: {
    //position: 'absolute',
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 120,
  },
  logoTextIcon: {
    height: 350,
    width: 300,
  },
  textInputText: {
    backgroundColor: Colors.white,
    width: "75%",
    height: 40,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "flex-start",
    alignSelf: "center",
    flexDirection: "row",
    marginHorizontal: 24,
  },
  signInButton: {
    width: "75%",
    height: 40,
    borderRadius: 16,
    alignSelf: "center",
    justifyContent: "center",
    marginHorizontal: 24,
  },
  signInText: {
    textAlign: "center",
    fontSize: 14,
    textTransform: "uppercase",
    color: Colors.white,
    fontWeight: "600",
    backgroundColor: "transparent",
  },
  placementIcon: {
    padding: 10,
  },
  forgotPasswordButton: {
    justifyContent: "center",
    marginTop: 20,
    alignSelf: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.white,
  },
});
