import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import React, { useRef, useContext, useState, useEffect } from "react";
import firestore from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PayWithFlutterwave from "flutterwave-react-native";
import { useSelector, useDispatch } from "react-redux";
import { setRunAppUseEffect } from "./redux/userSlice";

const PaymentPage = () => {
  const dispatch = useDispatch();
  // const paystackWebViewRef = useRef(paystackProps.PayStackRef);
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);

  const [country, setCountry] = useState("");
  // const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const generateTransactionRef = (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return `flw_tx_ref_${result}`;
  };

  useEffect(() => {
    (async () => {
      AsyncStorage.getItem("yourCountryName")
        .then((value) => {
          if (value !== null) {
            setCountry(JSON.parse(value));
          } else {
            Location.requestForegroundPermissionsAsync().then(({ status }) => {
              if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
              }

              Location.getCurrentPositionAsync({}).then((location) => {
                fetch(
                  `http://api.geonames.org/countryCodeJSON?lat=${location.coords.latitude}&lng=${location.coords.latitude}&username=zakatechsoftware`
                )
                  .then((data) => data.json())
                  .then((json) => {
                    setCountry(json);
                    AsyncStorage.setItem(
                      "yourCountryName",
                      JSON.stringify(json)
                    );
                  })
                  .catch((err) => console.log("error occured"));
              });
            });
          }
        })
        .catch((err) => console.log(err.message));
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ textAlign: "center" }}>
        Your subscription has expired. {"\n"}kindly renew your subscription to
        be able to ATTEMPT QUIZ TESTS and REMOVE ads on the Mobile Quiz App
      </Text>
      <PayWithFlutterwave
        onRedirect={async (res) => {
          if (res.status === "successful") {
            let nextDueDate = dbUser?.payments
              ? dbUser.payments[dbUser.payments.length - 1]?.nextDueDate
              : 0;
            nextDueDate =
              nextDueDate > Date.now()
                ? nextDueDate - Date.now() + 30 * 86400000
                : Date.now() + 30 * 86400000;
            const docRef = await firestore()
              .collection("users")
              .doc(dbUser.userId);

            docRef
              .update({
                payments:
                  // [...dbUser.payments, {
                  //   nextDueDate: nextDueDate ,
                  //   reference: res.transaction_id
                  // }]

                  firestore.FieldValue.arrayUnion({
                    nextDueDate: nextDueDate,
                    reference: res.transaction_id,
                  }),
              })
              .then(dispatch(setRunAppUseEffect()))
              .catch((err) => {
                console.log(err.message);
              });
          }
        }}
        options={{
          tx_ref: generateTransactionRef(10),
          authorization: "FLWPUBK_TEST-e4bb46908aa02f101fc0420306b1bc17-X", //"FLWPUBK-99f8982cc3147c237e55b3ff84f2d124-X", //FLTWAVE_KEY,
          customer: {
            email: dbUser?.email,
          },
          amount: country.countryName === "Nigeria" ? 2000 : 5,
          currency: country.countryName === "Nigeria" ? "NGN" : "USD",
          payment_options: "card",
        }}
      />
    </View>
  );
};

export default PaymentPage;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "green",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 100,
    },
  },
});
