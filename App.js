import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import SigninPage from "./signinPage";
import { useDispatch, Provider, useSelector } from "react-redux";
import { Button } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
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
  setRunAppUseEffect,
  setOpenGroupList,
  setDbUserDateJoined,
  setDbUserExempted,
} from "./redux/userSlice";
import { NavigationContainer } from "@react-navigation/native";
import {
  DrawerItemList,
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";

import StackProfilePage from "./profiles/stackProfilePage";
import StackQuestionPage from "./question/stackQuestionPage";
import StackQuizPage from "./quiz/stackQuizPage";
import FlashCardStack from "./flashCards/flashCardStack";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";
import messaging from "@react-native-firebase/messaging";

const adUnitIdBanner = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "ios"
  ? "ca-app-pub-1200533271102374/2397484198"
  : "ca-app-pub-1200533271102374/8278412555";

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === "ios"
  ? "ca-app-pub-1200533271102374/2014340817"
  : "ca-app-pub-1200533271102374/3189737409";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ["fashion", "clothing", "education", "quiz", "examinations", ""],
});

const Drawer = createDrawerNavigator();

function App() {
  const dispatch = useDispatch();
  const isMounted = useRef(false);

  let dbUserFirstName = useSelector((state) => state.user).dbUserFirstName;
  let dbUserLastName = useSelector((state) => state.user).dbUserLastName;
  let dbUserMiddleName = useSelector((state) => state.user).dbUserMiddleName;
  let dbUserDateJoined = useSelector((state) => state.user).dbUserDateJoined;
  let dbUserExempted = useSelector((state) => state.user).dbUserExempted;
  let dbUserError = useSelector((state) => state.user).errorMessage;
  let userEmail = useSelector((state) => state.user).userEmail;
  let userId = useSelector((state) => state.user).userId;
  let initializing = useSelector((state) => state.user).loading;
  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;
  let paymentStatus = useSelector((state) => state.user).paymentStatus;
  let runAppUseEffect = useSelector((state) => state.user).runAppUseEffect;
  let emailVerified = useSelector((state) => state.user).emailVerified;
  let loading = useSelector((state) => state.user).loading;

  const quizGroupNameRaw = currentGroupName || "";
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  useEffect(() => {
    messaging().onNotificationOpenedApp((remoteMessage) => {
      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          Alert.alert(
            remoteMessage.notification.title,
            remoteMessage.notification.body
          );
        }
      });

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert(
        remoteMessage.notification.title,
        remoteMessage.notification.body
      );
    });

    return unsubscribe;
  }, []);

  const deleteAccount = async () => {
    firestore()
      .collection("users")
      .doc(userId)
      .delete()
      .catch((error) => console.log(error));
    let user = auth().currentUser;
    user
      .delete()
      .then(() => {
        toggleRunUseEffect();
        Alert.alert("Your account has been deleted.");

        dispatch(setDbUser(null));
        dispatch(setUserEmail(null));
        dispatch(setCurrentGroupName(null));
        dispatch(setCurrentGroupCadre(null));
        dispatch(setEmailVerified(false));
        dispatch(setDbUserFirstName(null));
        dispatch(setDbUserLastName(null));
        dispatch(setDbUserMiddleName(null));
        dispatch(setRunAppUseEffect());
      })
      .catch((error) => {
        if (error.code === "auth/requires-recent-login") {
          Alert.alert(
            "This operation is sensitive and requires recent authentication. Log in again before retrying this request."
          );
        }
      });
  };

  const wantToDelete = () => {
    const validButtons = [
      { text: "Don't Delete", style: "cancel", onPress: () => {} },
      {
        text: "Delete",
        style: "destructive",
        // If the user confirmed, then we dispatch the action we blocked earlier
        // This will continue the action that had triggered the removal of the screen
        onPress: () => deleteAccount(),
      },
    ];

    Alert.alert(
      "You are about to Delete your account",
      "All your data will be lost. Are you sure you want to delete your account?",
      validButtons.map((buttonText) => ({
        text: buttonText.text,
        onPress: buttonText.onPress,
      }))
    );
  };

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
        dispatch(setRunAppUseEffect());

        console.log("signed out");
      })
      .catch((error) => console.log(error.message));
  };

  const JoinGroup = async (passKey) => {
    //let passKey = base64.decode(passKey)
    let key = passKey.substring(passKey.indexOf("~") + 1);
    key = key.trim(); //remove spaces before and after the string

    let groupToJoin = passKey
      .substring(passKey.indexOf("?") + 1, passKey.indexOf("~"))
      .replace(/\+/g, " ");
    let groupToJoinId = groupToJoin.substring(0, groupToJoin.indexOf("-"));
    let invitedCadre = passKey
      .substring(0, passKey.indexOf("?"))
      .replace(/\+/g, " ");

    const docs = firestore().collection("users").doc(groupToJoinId);
    dispatch(setLoading(true));
    //setInitializing(true);

    firestore()
      .collection("users")
      .doc(groupToJoinId)
      .get()

      .then((arg) => {
        // setInitializing(true);
        //  dispatch(setLoading(true));

        let pass = arg?.data()[groupToJoin]?.examinerPass;

        let passFiltered = pass?.filter((item) => item.passKey === key);

        if (
          passFiltered?.length > 0 &&
          passKey // && groupMemberships.length<1
        ) {
          pass.splice(
            pass.findIndex((item) => item.passKey === key),
            1
          );

          firestore()
            .collection("users")
            .doc(groupToJoinId)
            .update({
              [`${groupToJoin}.examinerPass`]: pass, //firestore.FieldValue.arrayRemove(pass[0])
            })
            .then(async () => {
              const docRef = firestore().collection("users").doc(userId);
              let doc = await docRef.get();

              let groupMembership = doc.data().groupMembership;

              // const docRef2 = firestore().collection('users').doc(groupToJoinId);
              if (
                Array.isArray(groupMembership) &&
                groupMembership.length > 0
              ) {
                let updatedGroupMemberships = groupMembership.filter(
                  (ele) => ele.name !== groupToJoin || ele.cadre === "Admin"
                );
                updatedGroupMemberships = [
                  ...updatedGroupMemberships,
                  {
                    cadre: invitedCadre,
                    name: groupToJoin,
                  },
                ];
                //console.log("updatedGroupMemberships", updatedGroupMemberships);

                docRef
                  .update({
                    groupMembership: updatedGroupMemberships,
                  })
                  .catch((err) =>
                    Alert.alert(
                      "groupMembership could not be added",
                      err.message
                    )
                  );
              } else {
                // console.log("updateGroupMembership1", [
                //   {
                //     cadre: invitedCadre,
                //     name: groupToJoin,
                //   },
                // ]);
                docRef.update({
                  groupMembership: [
                    {
                      cadre: invitedCadre,
                      name: groupToJoin,
                    },
                  ],
                });
              }
            })

            .then(async () => {
              const docRef2 = firestore()
                .collection("users")
                .doc(groupToJoinId);

              let members = arg.data()[groupToJoin].members;
              if (Array.isArray(members) && members.length > 0) {
                let updatedMembers = members.filter(
                  (ele) => ele.userId !== userId
                );
                updatedMembers = [
                  ...updatedMembers,
                  {
                    dateJoin: Date.now(),
                    cadre: invitedCadre,
                    userId: userId,
                    firstName: dbUserFirstName,
                    lastName: dbUserLastName,
                    middleName: dbUserMiddleName,
                    email: userEmail,
                  },
                ];
                //  console.log("updatedMembers", updatedMembers);
                docRef2.update({
                  [`${groupToJoin}.members`]: updatedMembers,
                });
              } else {
                docRef2.update({
                  [`${groupToJoin}.members`]: [
                    {
                      dateJoin: Date.now(),
                      cadre: invitedCadre,
                      userId: userId,
                      firstName: dbUserFirstName,
                      lastName: dbUserLastName,
                      middleName: dbUserMiddleName,
                      email: userEmail,
                    },
                  ],
                });
              }
            })
            .then(() => {
              // setCurrentGroup({
              //   name: groupToJoin,
              //   cadre: invitedCadre,
              // });
              dispatch(setOpenGroupList(true));
              Alert.alert(`You successfully joined ${groupName}`);
              dispatch(setLoading(false));
              dispatch(setRunAppUseEffect(!runAppUseEffect));
            })
            .catch((err) => {
              Alert.alert(err.message);
              dispatch(setLoading(false));
            });
        } else {
          // setPassKeyError(true)
          Alert.alert("pass key not authorized");
          //setInitializing(false);
          dispatch(setLoading(false));
        }
      })
      .then(
        dispatch(setLoading(false)) //setInitializing(false)
      )
      .catch((error) => {
        Alert.alert("An error has occurred: " + error.message); //err=>console.log(err) && setPassKeyError(true)
        // setInitializing(false);
        dispatch(setLoading(false));
      });
  };

  // auth().currentUser.signOut();
  useEffect(() => {
    // auth().currentUser.signOut();
    if (isMounted.current === true) {
      dynamicLinks().onLink(
        //handleDynamicLink
        (link) => {
          if (link?.url) {
            if (dbUserFirstName) {
              let passKey = decodeURI(link.url).split("=")[1];
              // if (dbUser?.userId !== "") {
              JoinGroup(passKey);
              // } else {
              //   Alert.alert("Signin and click the link again");
              // }
            } else {
              // Alert.alert("Signin and click the link again");
            }
          }
        }
      );

      dynamicLinks()
        .getInitialLink()
        .then((link) => {
          if (dbUserFirstName) {
            if (
              link?.url //=== 'https://invertase.io/offer'
            ) {
              let passKey = link.url.split("=")[1];
              // if (dbUser?.userId !== "") {
              JoinGroup(passKey);
              // if (Platform.OS === "ios") {
              //   Alert.alert("Click the link again to join group");
              // }
              // } else {
              //   Alert.alert("Signin and click the link again");
              // }
              // ...set initial route as offers screen
              // handleDynamicLink({link, usrId});
            }
          } else {
            // Alert.alert("Signin and click the link again");
          }
        });
    } else {
      isMounted.current = !isMounted.current;
    }
  }, [dbUserFirstName]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((credentials) => {
      if (credentials) {
        dispatch(setEmailVerified(credentials.emailVerified));
        dispatch(setUserEmail(credentials.email));
        dispatch(setUserId(credentials.uid));
        dispatch(setLoading(true));

        if (credentials?.emailVerified === false) {
          Alert.alert("Click on the link sent to your mail and then sign in");
          // LogOut();
          dispatch(setLoading(false));
          // (async ()=>await SplashScreen.hideAsync())();
        }
        if (credentials?.emailVerified) {
          (() => {
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
                    dispatch(setDbUser(JSON.stringify(user)));
                    dispatch(setDbUserFirstName(user.firstName));
                    dispatch(setDbUserLastName(user.lastName));
                    dispatch(setDbUserMiddleName(user.middleNameName));
                    dispatch(setPaymentStatus(paid));
                    dispatch(setDbUserDateJoined(user.dateJoined));
                    dispatch(setDbUserExempted(user.exempted));
                  } else {
                    dispatch(setLoading(false));
                  }
                })
                .catch((err) => {
                  "dbUser could not be found" + err.message;
                  dispatch(setLoading(false));
                });

              // let data = JSON.stringify({ user, paid });

              // return data;
            } catch (error) {
              // Alert.alert("Error fetching user:", error);
              console.log(error.message);
              dispatch(setLoading(false));
            }
          })();
        }
      } else {
        dispatch(setLoading(false));
      }
    });

    return subscriber;
  }, [currentGroupName, runAppUseEffect]);

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        if (
          // (paymentStatus === false &&
          //   Date.now() - dbUser?.dateJoined < 7 * 86400000) ||
          // (paymentStatus === false &&
          //   Date.now() - dbUser?.dateJoined > 7 * 86400000)
          paymentStatus === false ||
          dbUserExempted === true // && dbUser?.payments?.length===0
        ) {
          interstitial.show();
        }
      }
    );

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (userEmail) {
    return (
      <NavigationContainer>
        <SafeAreaView
          Style={{
            marginTop: 10,
            height: 100,
            backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center", //paddingTop:20
          }}
        >
          <View
            style={{
              justifyContent: "center",
              width: "100%", //borderWidth:2,
              marginTop: Platform.OS === "ios" ? 0 : 20,
              alignItems: "center",
              alignSelf: "center",
              borderRadius: 10,
              flexDirection: "row",
            }}
          >
            {dbUserFirstName && (
              <View style={{ width: "100%", textAlign: "center" }}>
                <Button
                  title="Change the Current Quiz Group"
                  onPress={() => {
                    dispatch(setCurrentGroupCadre(null));
                    dispatch(setCurrentGroupName(null));
                    dispatch(setRunAppUseEffect(!runAppUseEffect));
                  }}
                />
                {/* <TouchableOpacity>
                  <Text style={{ fontSize: 20, textAlign: "center" }}>
                    Change the Current Quiz Group
                  </Text>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        </SafeAreaView>

        <Drawer.Navigator
          screenOptions={{
            swipeEdgeWidth: 0,
            swipeEnabled: false,
          }}
          drawerContent={(props) => {
            const filteredProps = {
              ...props,
              state: {
                ...props.state,
                routeNames: props.state.routeNames.filter(
                  // To hide single option
                  // (routeName) => routeName !== 'HiddenPage1',
                  // To hide multiple options you can add & condition
                  (routeName) => {
                    // routeName !== "ProfileStack" &&
                    routeName !== "CreateFlashcards";
                  }
                ),
                routes: props.state.routes.filter(
                  (route) =>
                    //  route.name !== "ProfileStack" &&
                    route.name !== "CreateFlashcards"
                ),
              },
            };

            return (
              <DrawerContentScrollView {...filteredProps}>
                {/* <DrawerItemList
                  {...filteredProps} //state={newState} {...rest}
                /> */}

                {/* <DrawerItem
                  label="Home"
                  onPress={() =>
                    props.navigation.navigate("ProfileStack", {
                      screen: "Profile",
                    })
                  }
                /> */}

                {currentGroupCadre === "Admin" && (
                  <DrawerItem
                    label="View All Group Members"
                    onPress={() => props.navigation.navigate("All Users")}
                  />
                )}

                {(currentGroupCadre === "Admin" ||
                  currentGroupCadre === "Chief Examiner" ||
                  currentGroupCadre === "Examiner") && (
                  <DrawerItem
                    label="Question Bank"
                    onPress={() =>
                      props.navigation.navigate("QuestionStack", {
                        screen: "Question Bank",
                      })
                    }
                  />
                )}

                {(currentGroupCadre === "Admin" ||
                  currentGroupCadre === "Chief Examiner" ||
                  currentGroupCadre === "Examiner") && (
                  <DrawerItem
                    label="Create Question"
                    onPress={() =>
                      props.navigation.navigate("QuestionStack", {
                        screen: "Create Question",
                        params: { item: null },
                      })
                    }
                  />
                )}

                {(currentGroupCadre === "Admin" ||
                  currentGroupCadre === "Chief Examiner") && (
                  <DrawerItem
                    label="Quiz Bank"
                    onPress={() =>
                      props.navigation.navigate("QuizStack", {
                        screen: "Quiz Bank",
                      })
                    }
                  />
                )}
                {(currentGroupCadre === "Admin" ||
                  currentGroupCadre === "Chief Examiner") && (
                  <DrawerItem
                    label="Create Quiz"
                    onPress={() =>
                      props.navigation.navigate("QuizStack", {
                        screen: "Choose Quiz Questions",
                      })
                    }
                  />
                )}

                {currentGroupCadre && (
                  <DrawerItem
                    label="Chat Room"
                    onPress={() =>
                      props.navigation.navigate("ProfileStack", {
                        screen: "Chat",
                      })
                    }
                  />
                )}

                <DrawerItem
                  label="Flashcards"
                  onPress={() =>
                    props.navigation.navigate("FlashCardStack", {
                      screen: "FlashcardGroups",
                    })
                  }
                />

                {paymentStatus || (
                  <DrawerItem
                    label="Subscribe"
                    onPress={() =>
                      props.navigation.navigate("ProfileStack", {
                        screen: "Payment",
                      })
                    }
                  />
                )}

                <DrawerItem
                  label="About the App"
                  onPress={() =>
                    props.navigation.navigate("ProfileStack", {
                      screen: "About",
                    })
                  }
                />

                <DrawerItem
                  label="Contact Us"
                  onPress={() =>
                    props.navigation.navigate("ProfileStack", {
                      screen: "ContactUs",
                    })
                  }
                />

                <DrawerItem label="Sign Out" onPress={LogOut} />

                {
                  //dbUserFirstName &&
                  <DrawerItem label="Delete Account" onPress={wantToDelete} />
                }
              </DrawerContentScrollView>
            );
          }}
        >
          {/* <Drawer.Screen
                          name="StackAttemptQuiz"
                          component={StackAttempQuiz}
                          options={{
                            title: `Group: ${currentGroupName || "None"}`,
                            headerShown: true,
                            drawerLabel: "Attempting Quiz",
                            headerLeft: null,
                          }}
                        /> */}
          <Drawer.Screen
            name="ProfileStack"
            component={StackProfilePage}
            options={{
              title: `Group: ${groupName || "None"}`,
              headerShown: true,
              drawerLabel: "Home",
              headerLeft: null,
            }}
          />

          <Drawer.Screen
            name="FlashCardStack"
            component={FlashCardStack}
            options={{
              title: `Group: ${currentGroupName || "None"}`,
              headerShown: true,
              drawerLabel: "Flashcards",
            }}
          />
          {(currentGroupCadre === "Admin" ||
            currentGroupCadre === "Chief Examiner" ||
            currentGroupCadre === "Examiner") && ( //paymentStatus &&
            <Drawer.Screen
              name="QuestionStack"
              component={StackQuestionPage}
              options={{
                title: `Group: ${currentGroupName || "None"}`,
                headerShown: true,
              }}
            />
          )}
          {(currentGroupCadre === "Admin" ||
            currentGroupCadre === "Chief Examiner" ||
            currentGroupCadre === "Examiner" ||
            currentGroupCadre === "Candidate") && ( //paymentStatus &&
            <Drawer.Screen
              name="QuizStack"
              component={StackQuizPage}
              options={{
                title: `Group: ${currentGroupName || "None"}`,
                headerShown: true,
              }}
            />
          )}
        </Drawer.Navigator>
        {/* {((paymentStatus === false &&
          Date.now() - dbUserDateJoined < 7 * 86400000) ||
          (paymentStatus === false &&
            Date.now() - dbUserDateJoined > 7 * 86400000) ||
          dbUserExempted === true) && ( */}
        <View
          style={{
            justifyContent: "center",
            width: "100%", //borderWidth:2,
            marginTop: Platform.OS === "ios" ? 0 : 20,
            alignItems: "center",
            alignSelf: "center",
            borderRadius: 10,
            flexDirection: "row",
          }}
        >
          <BannerAd
            unitId={adUnitIdBanner}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </View>
        {/* )} */}
      </NavigationContainer>
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
