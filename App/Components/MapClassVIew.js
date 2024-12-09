import React, { useState, useRef, useEffect } from "react";
//import react in our code.
import { View, Image, StyleSheet, Platform, Dimensions, DeviceEventEmitter, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors, Helpers, Images, Metrics } from "../Theme";
import haversine from "haversine";
import { getData, LocalDBItems, storeData, wipeData } from '../Services/LocalStorage'
import UtilityHelper from "./UtilityHelper";
import Geolocation from 'react-native-geolocation-service';
import { getPathLength } from 'geolib';
import Icon from "react-native-vector-icons/FontAwesome5Pro";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
var LATITUDE = 29.95539;
var LONGITUDE = 78.07513;

/**
* Class to render the map view on the screen
location props will be fetched
*/
export default class MapForPolyline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      locationTrackingCOrindates: [],
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0
      }
    };
    this.cordinateObj = {
      latitude: 9.947236,
      longitude: 76.347843
    }
    this.markekerCordinte = {
      latitude: 9.947236,
      longitude: 76.347843
    }
    this.isInitialLoad = true
  }

  /**
  * Method called when the class is initialized
  * Fetch the location array from DB
  * If location array is empty then fetch for current location coordinate
  * Track location on map will be called
  */
  async componentDidMount() {
    let locationArray = await getData(LocalDBItems.locationArrayForTracing)
    if (locationArray && locationArray.length > 0) {
      let location = locationArray[locationArray.length - 1]
      this.trackLocationOnMap(location)
    }
    else {
      Geolocation.getCurrentPosition(async (position) => {
        let location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
        this.trackLocationOnMap(location)
      })
    }
  }
  handleEvent = (locationObj) => {
  }
  /**
     * Method to trackLocationOnMap 
     * set the current location to the marker coordinate obj
     * Calculate the distance travelled from the previous position to current position
     * Set state method called by setting the variables and also to re render the view
     * map fit to coordinate method called to adjust the view port to the screen
     * Set timeout added to lazy load the render the map
     */
  trackLocationOnMap = async (location) => {
    let updatedLocationArray = await getData(LocalDBItems.locationArrayForTracing)
    this.markekerCordinte = location
    let distanceTravelledWithLocation = getPathLength(updatedLocationArray) / 1000
    this.setState({
      latitude: location.latitude,
      longitude: location.longitude,
      routeCoordinates: updatedLocationArray.length == 0 ? [location] : updatedLocationArray,
      coordinate: location,
      distanceTravelled: distanceTravelledWithLocation,
      prevLatLng: location
    }, () => {
      if (this.map) {
        setTimeout(() => {
          this.map.fitToCoordinates(updatedLocationArray, { edgePadding: { top: 20, bottom: 20, left: 20, right: 20 }, animated: true })
        }, 100);
      }
    });
  }
  /**
     * Method to called when the map is renderd on the screen
     * Check the coordinate array length and if its greater than zero then fit to coordinate fucntion will be called 
     */
  onMapReady = () => {
    let coordinatesArrayForPolyLine = this.state.routeCoordinates
    if (coordinatesArrayForPolyLine && coordinatesArrayForPolyLine.length > 0) {
      let cordinate = coordinatesArrayForPolyLine[0]
      this.map.fitToCoordinates(coordinatesArrayForPolyLine ? coordinatesArrayForPolyLine : [cordinate], { edgePadding: { top: 10, right: 10, bottom: 10, left: 10 }, animated: false })
    }
    else {
    }
  }

  /**
 * Method to render the view to the screen
 */
  render() {
    return (
      <View style={{ flex: 1 }}>

        <MapView
          ref={map => {
            this.map = map;
          }}
          provider={PROVIDER_GOOGLE}
          onMapReady={this.onMapReady()}
          style={{ height: this.props.height, width: windowWidth, marginHorizontal: 10 }}
          initialRegion={{
            latitude: 25.2048,
            longitude: 55.2708,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,

          }}
        >
          <MapView.Marker
            ref={(marker => { this.marker = marker })}
            style={{ width: 40, height: 40 }}
            coordinate={this.props.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Icon name="map-marker-alt" size={40} color={Colors.darkGrey} />
          </MapView.Marker>

          <MapView.Marker
            ref={(marker => { this.marker = marker })}
            style={{ width: 40, height: 40 }}
            coordinate={this.markekerCordinte}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image
              source={Images.mapCurrentLocation}
              style={{ width: 40, height: 40 }}
            />
          </MapView.Marker>
          {this.state.routeCoordinates &&
            <Polyline coordinates={this.state.routeCoordinates} strokeColor={'black'} strokeWidth={2} />
          }
        </MapView>
        <View style={[styles.buttonContainer]}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              Distance covered: {parseFloat(this.state.distanceTravelled).toFixed(2)} km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    bottom: 10,
    flexDirection: "row",
    zIndex: 10, position: 'absolute'
    // marginVertical: 20,
    // backgroundColor: "red"
  },
  bottomBarContent: {
    fontSize: 18,
    color: '#fe717f',
    fontWeight: 'bold',
    paddingLeft: 5
  }
});