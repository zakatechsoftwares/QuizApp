import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import Register from "./register";

import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useDispatch } from "react-redux";
import {
  setEmailVerified,
  fetchUser,
  setUserEmail,
  setUserId,
  setLoading,
  setDbUser,
  setPaymentStatus,
  setDbUserFirstName,
  setDbUserLastName,
  setDbUserMiddleName,
  setDbUserDateJoined,
  setDbUserExempted,
} from "./redux/userSlice";
import firestore from "@react-native-firebase/firestore";

const SigninPage = ({ navigation }) => {
  let dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [email1, setEmail1] = useState("");
  const [password, setPassword] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [show, setShow] = useState(false);

  async function onGoogleButtonPress() {
    dispatch(setLoading(true));
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    setInitializing(true);
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    setInitializing(true);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  const passwordReset = () => {
    if (email) {
      auth()
        .sendPasswordResetEmail(email)
        .then(Alert.alert("Password reset email sent to your mail"))
        .catch((err) => console.log(err));
    } else {
      Alert.alert("Enter your email");
    }
  };

  const Login = async () => {
    if (email && password) {
      dispatch(setLoading(true));
      auth()
        .signInWithEmailAndPassword(email, password)
        .then((credentials) => {
          // dispatch(setLoading(false));
          // dispatch(setUserEmail(credentials.user.email));
          // dispatch(setUserId(credentials.user.uid));
          // dispatch(setEmailVerified(credentials.user.emailVerified));
          // dispatch(fetchUser(credentials.user.uid));
          // Alert.alert("you are signed in with email and password");

          (async () => {
            try {
              firestore()
                .collection("users")
                .doc(credentials.uid)
                .get()
                .then((userDoc) => {
                  if (userDoc.exists) {
                    const user = userDoc.data();
                    let paid = false;

                    let data1 =
                      user &&
                      Array.isArray(user.payments) &&
                      user.payments.length > 0
                        ? user?.payments[user?.payments?.length - 1]
                            ?.nextDueDate > Date.now()
                        : false;

                    let data2 = user?.exempted ?? false;
                    let data3 =
                      user !== undefined && user?.dateJoined !== undefined
                        ? Date.now() - user?.dateJoined ??
                          Date.now() < 7 * 86400000
                        : false;

                    paid = data2 || data1 || data3 ? true : false;

                    dispatch(setLoading(false));
                    dispatch(setEmailVerified(credentials.emailVerified));
                    //dispatch(fetchUser(credentials.uid));
                    dispatch(setUserEmail(credentials.email));
                    dispatch(setDbUser(JSON.stringify(user)));
                    dispatch(setDbUserFirstName(user.firstName));
                    dispatch(setDbUserLastName(user.lastName));
                    dispatch(setDbUserMiddleName(user.middleNameName));
                    dispatch(setDbUserDateJoined(user.dateJoined));
                    dispatch(setDbUserExempted(user.exempted));

                    dispatch(setUserId(credentials.uid));
                    dispatch(setPaymentStatus(paid));
                    setInitializing(false);
                    Alert.alert(user.email);
                  }
                })
                .catch((err) => {
                  "dbUser could not be found" + err.message;
                });

              // let data = JSON.stringify({ user, paid });

              // return data;
            } catch (error) {
              // Alert.alert("Error fetching user:", error);
              throw error?.message;
            }
          })();
        })
        .catch((error) => {
          dispatch(setLoading(false));
          Alert.alert("Error!", error.message);
          if (error.code === "auth/user-not-found") {
            Alert.alert("You are not registered");
          }
          if (
            error.code === "auth/invalid-email" ||
            error.code === "auth/wrong-password"
          ) {
            Alert.alert("Enter a valid email and password");
          }
          if (error.code === "auth/too-many-requests") {
            Alert.alert(
              "it seems you have not verified your account:Click on link sent to your email to verify your email"
            );
          }
          if (error.code === "firestore/permission-denied") {
            Alert.alert(
              "The caller does not have permission to execute the specified operation"
            );
          }
        });
    } else {
      Alert.alert("Enter a valid email and password");
      dispatch(setLoading(false));
    }
  };

  // Handle user state changes
  // function onAuthStateChange(user) {
  //   // setUser(user);

  //   if (initializing) setInitializing(false);
  // }

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "505311216624-aa9fn3b0830tub61h4iort30qqr8pib6.apps.googleusercontent.com",
      offlineAccess: true,
    });
    setInitializing(false);
    dispatch(setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      {initializing && <ActivityIndicator />}
      {show || initializing || (
        <View style={{ justifyContent: "space-between" }}>
          <Text style={{ textAlign: "center" }}>SIGN IN</Text>
          <TextInput
            name="email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
            }}
            style={styles.input}
            placeholder="Enter Email"
          />
          <TextInput
            name="password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
            }}
            placeholder="Enter Password"
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity
            activeOpacity={0.2}
            onPress={Login}
            style={styles.button}
          >
            <Text style={styles.text}>Login</Text>
            {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.2}
            onPress={passwordReset}
            style={styles.button}
          >
            <Text style={styles.text}>Forgot Password</Text>
            {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
          </TouchableOpacity>

          <GoogleSigninButton
            style={{ width: 200, height: 48 }}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={() => {
              onGoogleButtonPress()
                .then((credentials) => {
                  // dispatch(setUserEmail(credentials.user.email));
                  // dispatch(setUserId(credentials.user.uid));
                  // dispatch(setEmailVerified(credentials.user.emailVerified));
                  // dispatch(fetchUser(credentials.user.uid));
                  // dispatch(setLoading(false));
                  // Alert.alert("you are now signed in with google button");

                  (async () => {
                    try {
                      firestore()
                        .collection("users")
                        .doc(credentials.uid)
                        .get()
                        .then((userDoc) => {
                          if (userDoc.exists) {
                            const user = userDoc.data();
                            let paid = false;

                            let data1 =
                              user &&
                              Array.isArray(user.payments) &&
                              user.payments.length > 0
                                ? user?.payments[user?.payments?.length - 1]
                                    ?.nextDueDate > Date.now()
                                : false;

                            let data2 = user?.exempted ?? false;
                            let data3 =
                              user !== undefined &&
                              user?.dateJoined !== undefined
                                ? Date.now() - user?.dateJoined ??
                                  Date.now() < 7 * 86400000
                                : false;

                            paid = data2 || data1 || data3 ? true : false;

                            dispatch(setLoading(false));
                            dispatch(
                              setEmailVerified(credentials.emailVerified)
                            );
                            //dispatch(fetchUser(credentials.uid));
                            dispatch(setUserEmail(credentials.email));
                            dispatch(setDbUser(JSON.stringify(user)));
                            dispatch(setDbUserFirstName(user.firstName));
                            dispatch(setDbUserLastName(user.lastName));
                            dispatch(setDbUserMiddleName(user.middleNameName));
                            setInitializing(false);
                            dispatch(setUserId(credentials.uid));
                            dispatch(setPaymentStatus(paid));
                            dispatch(setDbUserDateJoined(user.dateJoined));
                            dispatch(setDbUserExempted(user.exempted));
                          }
                        })
                        .catch((err) => {
                          dispatch(setLoading(false));
                          "dbUser could not be found" + err.message;
                        });

                      // let data = JSON.stringify({ user, paid });

                      // return data;
                    } catch (error) {
                      // Alert.alert("Error fetching user:", error);
                      throw error?.message;
                      dispatch(setLoading(false));
                    }
                  })();
                })
                .catch((error) => {
                  setInitializing(false);
                  Alert.alert("An error occured" + error.message);
                  dispatch(setLoading(false));
                });
            }}
            // disabled={initializing}
          />
          {show || (
            <Pressable style={styles.button} onPress={() => setShow(true)}>
              <Text style={styles.text}>Register if New User</Text>
            </Pressable>
          )}
        </View>
      )}
      <View>
        {show && <Register />}
        {show && (
          <Pressable style={styles.button} onPress={() => setShow(false)}>
            <Text style={styles.text}>Have account?; Sign in</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default SigninPage;

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 2,
    width: 200,
    margin: 4,
    paddingHorizontal: 5,
    fontSize: 16,
    height: 48,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    margin: 4,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "blue",
    width: 200,
    height: 48,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});
