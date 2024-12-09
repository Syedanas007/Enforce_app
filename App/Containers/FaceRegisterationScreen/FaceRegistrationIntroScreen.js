import * as React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import styles from "./style";
import { Helpers, Images } from "../../Theme";
import * as NavigationService from "../../Services/NavigationService";
import LinearGradient from "react-native-linear-gradient";

/**
 * FaceRegistrationIntoScreen
 * User navigates to FaceRegistrationIntoScreen - to give the instruction how its works
 * User can click continue button, after reading the instructions.
 */
export default class FaceRegistrationIntoScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {};
  navigateToRegisterScreen() {
    NavigationService.navigate("FaceRegistrationScreen");
  }
  render() {
    return (
      <View style={[Helpers.fillRowCenter, styles.container]}>
        <View style={[Helpers.center, styles.logo]}>
          {/* You will probably want to insert your logo here */}
          <ImageBackground
            style={Helpers.fullSize}
            source={Images.logo}
            blurRadius={100}
            resizeMode={"cover"}
          />
          <View style={styles.logoText}>
            <View style={{ flex: 1 }}>
              <Image
                style={styles.logoTextIcon}
                source={Images.defaultFaceMaskIcon}
                resizeMode={"contain"}
              />
            </View>
          </View>
          <View
            style={{
              width: "70%",
              position: "absolute",
              bottom: 180,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ textAlign: "center", color: "white", fontSize: 18 }}>
              Please move your face in front of your camera and turn lights on
              around you for better quality.
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: "85%",
              bottom: 30,
              position: "absolute",
              justifyContent: "flex-end",
              alignSelf: "center",
            }}
            onPress={() => this.navigateToRegisterScreen()}
          >
            <LinearGradient
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.0, y: 0.25 }}
              colors={["#fe717f", "#fa8576", "#f6976e"]}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
