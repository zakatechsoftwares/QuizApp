import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import SigninPage from "./signinPage";
import { useDispatch, Provider, useSelector } from "react-redux";
import { Button } from "react-native";
import auth from "@react-native-firebase/auth";
import store from "./redux/userSlice";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  setLoading,
  setCurrentGroupCadre,
  setCurrentGroupName,
  setDbUser,
  setPaymentStatus,
  setEmailVerified,
  setUserEmail,
  setUserId,
  setDbUserFirstName,
  setDbUserLastName,
  setDbUserMiddleName,
} from "./redux/userSlice";

function App() {
  const dispatch = useDispatch();

  let dbUserFirstName = useSelector((state) => state.user).dbUserFirstName;
  let dbUserLastName = useSelector((state) => state.user).dbUserLastName;
  let dbUserMiddleName = useSelector((state) => state.user).dbUserMiddleName;
  let dbUserError = useSelector((state) => state.user).errorMessage;
  let userEmail = useSelector((state) => state.user).userEmail;
  let userId = useSelector((state) => state.user).userId;
  let initializing = useSelector((state) => state.user).loading;
  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;
  let paymentStatus = useSelector((state) => state.user).paymentStatus;
  let runAppUseEffect = useSelector((state) => state.user).runAppUseEffect;
  let emailVerified = useSelector((state) => state.user).emailVerified;

  const LogOut = async () => {
    await auth()
      .signOut()
      .then(() => {
        try {
          GoogleSignin.signOut();
          GoogleSignin.revokeAccess();
        } catch (error) {
          console.log(error.message);
        }

        //setDbUser(false);
      })
      .then(() => {
        dispatch(setUserEmail(null));
        //dispatch(setCurrentGroupCadre(null));
        dispatch(setCurrentGroupCadre(null));
        dispatch(setCurrentGroupName(null));
        dispatch(setDbUser(null));
        dispatch(setUserEmail(null));
        dispatch(setEmailVerified(false));
        dispatch(setDbUserFirstName(null));
        dispatch(setDbUserLastName(null));
        dispatch(setDbUserMiddleName(null));

        console.log("signed out");
      })
      .catch((error) => console.log(error.message));
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((credentials) => {
      if (credentials) {
        dispatch(
          setEmailVerified(credentials.emailVerified ? "true" : "false")
        );
        dispatch(setUserEmail(credentials.email));
        dispatch(setUserId(credentials.uid));
      }
    });

    return subscriber;
  }, []);

  if (userEmail) {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>UserId: {userId}</Text>
        <Text>UserEmail: {userEmail}</Text>
        <Text>emailVerified: {emailVerified}</Text>
        <Button title="Sign out" onPress={() => LogOut()} />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (!userEmail) {
    return <SigninPage />;
  }
}

export default () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    margin: 10,
  },
});
