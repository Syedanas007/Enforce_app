import React, { useState, useRef, useEffect } from "react";
import { Text, View, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from "react-native-maps";
import UtilityHelper from "../Components/UtilityHelper";
import GeoCoder from "../Components/GeoCoder";
import Icons from "react-native-vector-icons/MaterialIcons";

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
var LATITUDE = 29.95539;
var LONGITUDE = 78.07513;

const MapViewEnforce = ({ coordinate, height, getWFHInfo, locationName }) => {
  const mapRef = useRef(null);
  const geoCoder = useRef(new GeoCoder());
  const markerRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  var latitude = coordinate ? coordinate.latitude : LATITUDE;
  var longitude = coordinate ? coordinate.longitude : LONGITUDE;
  const [draggable, setDraggable] = useState(true);

  const [selectedCoordinate, setSelectedCoordinate] = useState({
    latitude: latitude,
    longitude: longitude,
  });
  const [userCurrentLcoation, setuserCurrentLcoation] = useState();
  const [address, setSelectedAddress] = useState("");

  const [region, setRegion] = useState({
    longitude: longitude,
    latitude: latitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (coordinate) {
      setSelectedCoordinate(coordinate);
    }
    geoCoder.current.initiaLizeGeoCoder();
  }, []);

  useEffect(() => {
    setuserCurrentLcoation(coordinate);
  }, [coordinate]);

  useEffect(() => {
    let hasError = locationName != "" ? false : true;
    setHasError(hasError);
    setSelectedAddress(locationName);
  }, [locationName]);

  async function onDragabaleMarkerEvent(selectedCoordinate) {
    setSelectedCoordinate(selectedCoordinate);
    let isInRadius = UtilityHelper.isLocationWithinTheRadius(
      selectedCoordinate,
      coordinate,
      500
    );
    if (isInRadius) {
      let placeInfo = await geoCoder.current.getPlaceFromCordinate(
        selectedCoordinate.latitude,
        selectedCoordinate.longitude
      );
      let hasError = placeInfo.formatted_address ? false : true;
      setHasError(hasError);
      setSelectedAddress(placeInfo.formatted_address);
      getWFHInfo(placeInfo);
    } else {
      Alert.alert(
        "Dragging the marker outside the radius is not allowed",
        "Please select precise location"
      );
      setDraggable(false);
      if (coordinate) {
        setSelectedCoordinate(userCurrentLcoation);
        resetMapZoomLevel(userCurrentLcoation);
      }
    }
  }

  function resetMapZoomLevel(coordinatePoint) {
    let region = {
      latitude: coordinatePoint.latitude,
      longitude: coordinatePoint.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    markerRef.current.animateMarkerToCoordinate(coordinatePoint, 100);
    mapRef.current.animateToRegion(region, 100);
  }

  return (
    <>
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={{ height: height, marginHorizontal: 10 }}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={region}
        onRegionChangeComplete={(region) => setRegion(region)}
      >
        <Circle
          key={"19"}
          center={selectedCoordinate}
          radius={100}
          fillColor="rgba(40, 109, 237, 0.14)"
          strokeColor="rgba(40, 109, 237, 0.14)"
          strokeWidth={1}
        />
        <Marker
          ref={markerRef}
          draggable={true}
          zIndex={100}
          coordinate={selectedCoordinate}
          onPress={() => setDraggable(true)}
          onDragEnd={(e) => onDragabaleMarkerEvent(e.nativeEvent.coordinate)}
        >
          <Marker.Animated
            style={{ width: 50, height: 50 }}
            coordinate={selectedCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Icons name="location-pin" size={40} color="green" />
          </Marker.Animated>
        </Marker>
      </MapView>
      <View
        style={{
          marginHorizontal: 10,
          marginTop: 5,
          flexDirection: "row",
          alignItems: "center",
          marginRight: 20,
        }}
      >
        <Icons name="location-pin" size={25} color="grey" />
        <Text style={{ color: "grey", flex: 1, flexWrap: "wrap" }}>
          {hasError ? "Unable to fetch location" : address}
        </Text>
      </View>
    </>
  );
};
export default MapViewEnforce;
