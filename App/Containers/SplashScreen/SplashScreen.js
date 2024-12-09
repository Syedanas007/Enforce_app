import * as React from "react";
import { Text, View, Image } from "react-native";
import styles from "./SplashScreenStyle";
import { Helpers, Images } from "../../Theme";
import * as NavigationService from "../../Services/NavigationService";
import { getData, LocalDBItems } from "../../Services/LocalStorage";

/**
 * SPLASH SCREEN
 * User will navigate to login screen or the home screen based on the earlier login.
 * If the user is not Login, user navigate to login screen.
 * If user is already login, then navigate to home screen.  
 */

export default class SplashScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.timer = null;
  }
  componentDidMount = () => {
    this.navigationIsAuth();
  };
  navigationIsAuth = async () => {
    const isLogin = await getData(LocalDBItems.isUserAuthenticated);
    this.timer = setInterval(() => {
      if (isLogin) {
        NavigationService.navigateAndReset("App", {});
      } else {
        NavigationService.navigateAndReset("Auth", {});
      }
    }, 5000);
  };
  componentWillUnmount() {
    if (this.timer != null) {
      clearInterval(this.timer);
    }
  }
  render() {
    return (
      <View style={[Helpers.fillRowCenter, styles.container]}>
        <View style={[Helpers.center, styles.logo]}>
          <Image
            style={Helpers.fullSize}
            source={Images.logo}
            resizeMode={"cover"}
          />
          <View style={styles.logoText}>
            <Image
              style={styles.logoTextIcon}
              source={Images.logoText}
              resizeMode={"contain"}
            />
          </View>
          <View
            style={{ alignItems: "flex-end", position: "absolute", bottom: 40 }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 14 }}>
              App version : 3.4
            </Text>
          </View>
        </View>
      </View>
    );
  }
}
