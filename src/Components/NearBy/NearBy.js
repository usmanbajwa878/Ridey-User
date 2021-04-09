import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import carIcon from "../../assets/images/cars/top-Comfort.png";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styles from "./NearBy.styles";
import RouteNames from "../../Navigation/routeNames";
import { socket } from "../../Store/store";
import Constants from '../../Constants/appConstants/Global';

const handleMakeConnection = (
  actions,
  navigation,
  requestData,
  driverData,
  userData
) => {
  const data = {
    requestData,
    driverData,
    userData
  };
  console.log("isnide connection make call", data);
  socket.emit("pendingRequest", data);

  socket.on("AcceptRequestUser", (tripData) => {
    console.log("accept", tripData);
    navigation.navigate(RouteNames.Tracking, {
      requestData: requestData,
      tripData: tripData,
    });
  });

  // const tripData =
  // {
  //     driverId: driverData[0].driverId,
  //     userId: userData.userId,
  //     fare: requestData.selected.fare,
  //     status: "Accepted",
  //     driver: driverData[0].driver,
  //     vehicle: driverData[0].vehicle
  // }
  // actions.request
  //     .actionCreateTrip(tripData)
  //     .then(() => { })
  //     .catch((e) => console.log(e))
  //     .then(() => navigation.navigate(RouteNames.Tracking, {
  //         requestData: requestData,
  //         tripData: tripData
  //     }))
};

const NearBy = ({
  actions,
  navigation,
  requestData,
  nearByDrivers,
  requestStatus,
  requestError,
  user,
  tripData,
}) => {
  const driverData = nearByDrivers ? nearByDrivers : [];
  let handler;
  console.log(requestStatus, requestError);
  let mapRef = useRef(null);

  // socket.on('AcceptRequestUser',tripData=>{
  //     console.log("accept",tripData)
  //     navigation.navigate(RouteNames.Tracking, {
  //                  requestData: requestData,
  //                  tripData: tripData
  //              })
  //  })
  const [region, setRegion] = useState({
    latitude: 31.4515431,
    longitude: 74.3949027,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [messageText, setMessageText] = useState(
    "SEARCHING NEAR BY DRIVERS FOR YOU"
  );
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = {
      requestData: requestData,
      userData:user,
      driverData:driverData

      
    };
    // const wsSocket = new WebSocket(Constants.URL,'echo-protocol');
    // wsSocket.send(data)
    // wsSocket.addEventListener('AcceptRequestUser',(incomingData)=>{
    //  navigation.navigate(RouteNames.Tracking, {
    //     requestData: requestData,
    //     tripData: incomingData,
    //   });
    // })
    socket.emit("pendingRequest", data);
    socket.on("AcceptRequestUser", (tripData) => {
      console.log("accept", tripData);
      navigation.navigate(RouteNames.Tracking, {
        requestData: requestData,
        tripData: tripData,
      });
    });
    if (driverData.length > 0) {
      setTimeout(() => {
        handler = handleMakeConnection(
          actions,
          navigation,
          requestData,
          driverData,
          user
        );
      }, 2000);
    }
    return () => clearTimeout(handler);
  }, []);

  useEffect(() => {
      socket.on("AcceptRequest", (tripData) => {
        console.log("accept", tripData);
        navigation.navigate(RouteNames.Tracking, {
          requestData: requestData,
          tripData: tripData,
        });
      });
      socket.on("AcceptRequestUser", (tripData) => {
        console.log("accept", tripData);
        navigation.navigate(RouteNames.Tracking, {
          requestData: requestData,
          tripData: tripData,
        });
        const data={
          tripData:tripData,
          user:user,
          roomId:tripData.roomId
        }
        socket.emit('roomConnection',data);
      });
 
  });

  return (
    <View style={styles.container}>
      <MapView
        pitchEnabled={true}
        ref={mapRef}
        showsCompass={true}
        showsUserLocation={true}
        provider={PROVIDER_GOOGLE}
        followsUserLocation={true}
        style={styles.map}
        initialRegion={region}
      >
        {driverData.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: item.coordinates.coordinates[0],
              longitude: item.coordinates.coordinates[1],
            }}
            icon={carIcon}
          >
            <Image
              resizeMode="contain"
              source={carIcon}
              style={styles.carIcon}
            />
          </Marker>
        ))}
      </MapView>
      <View style={styles.bottomContainer}>
        {loading && (
          <View>
            <Text style={styles.headerText}>{messageText}</Text>
            <ActivityIndicator size="large" color="red" />
          </View>
        )}
        {!requestStatus && !loading && (
          <View>
            <Text style={styles.headerText}>{requestError}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text>OK</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
export default NearBy;
