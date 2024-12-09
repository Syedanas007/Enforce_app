import { StyleSheet } from "react-native";
import { Helpers, Colors } from "../../Theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fa",
  },
  logoContainer: {
    ...Helpers.fullWidth,
    height: 300,
    marginBottom: 25,
  },
  navigationLinearGradient: {
    width: "100%",
    height: "12%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  titleText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  topContainer: {
    flex: 1,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 17,
    marginHorizontal: 24,
    color: "grey",
  },
  permissionContainer: {
    flex: 0.5,
    marginHorizontal: 24,
    flexDirection: "column",
  },
  permisionView: {
    marginTop: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#00000019",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  permissionText: {
    fontSize: 17,
  },
  checkedIcon: {
    width: 30,
    height: 30,
    tintColor: "#ff6983",
  },
  permissionCellContainer: {
    flexDirection: "row",
  },
  checkedContainer: {
    flex: 0.1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginLeft: 20,
  },
  allowButton: {
    width: "100%",
    height: 60,
    borderRadius: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
  allowText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.white,
    backgroundColor: "transparent",
  },
  privacyContainer: {
    flexDirection: "row",
    marginBottom: 20,
    height: 60,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  privacyPolicyText: {
    fontSize: 16,
    color: "#ff6983",
  },
  privacyPolicyNormalText: {
    fontSize: 16,
    paddingLeft: 10,
  },
});
