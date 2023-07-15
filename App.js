import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
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
} from "./redux/userSlice";
import { NavigationContainer } from "@react-navigation/native";
import {
  DrawerItemList,
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import StackProfilePage from "./profiles/stackProfilePage";

const Drawer = createDrawerNavigator();

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
        dispatch(setEmailVerified(credentials.emailVerified));
        dispatch(setUserEmail(credentials.email));
        dispatch(setUserId(credentials.uid));
        if (!credentials?.emailVerified) {
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
                  }
                })
                .catch((err) => {
                  "dbUser could not be found" + err.message;
                });

              // let data = JSON.stringify({ user, paid });

              // return data;
            } catch (error) {
              // Alert.alert("Error fetching user:", error);
              console.log(error.message);
            }
          })();
        }
      }
    });

    return subscriber;
  }, [currentGroupName, runAppUseEffect]);

  if (userEmail) {
    return (
      // <View style={styles.container}>
      //   <Text>Open up App.js to start working on your app!</Text>
      //   <Text>UserId: {userId}</Text>
      //   <Text>UserEmail: {userEmail}</Text>
      //   <Text>emailVerified: {emailVerified}</Text>
      //   <Button title="Sign out" onPress={() => LogOut()} />
      //   <StatusBar style="auto" />
      // </View>

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
                <Button title="Sign out" onPress={() => LogOut()} />
                <TouchableOpacity
                  onPress={() => {
                    dispatch(setCurrentGroupCadre(null));
                    dispatch(setCurrentGroupName(null));
                  }}
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>
                    Change the Current Quiz Group
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>

        <Drawer.Navigator
          screenOptions={{
            swipeEdgeWidth: 0,
            swipeEnabled: false,
            headerRight: () => {
              <Button
                title="Sign Out"
                onPress={
                  () => LogOut() //signOut(auth)
                }
              />;
            },
          }}
          // drawerContent={(props) => {
          //   const filteredProps = {
          //     ...props,
          //     state: {
          //       ...props.state,
          //       routeNames: props.state.routeNames.filter(
          //         // To hide single option
          //         //  (routeName) => routeName !== 'QuestionStack',
          //         // To hide multiple options you can add & condition
          //         (routeName) => {
          //           //   routeName === 'ProfileStack'
          //           // &&
          //           //  routeName === 'QuizStack'
          //           //  && routeName === 'QuestionStack'
          //         }
          //       ),
          //       routes: props.state.routes.filter((route) => {
          //         //  route.name === 'ProfileStack'
          //         //&&
          //         //  route.name === 'QuizStack'
          //         //  && route.name === 'QuestionStack'
          //       }),
          //       // ),
          //     },
          //   };

          //   return (
          //     <DrawerContentScrollView {...filteredProps}>
          //       <DrawerItemList {...filteredProps} />

          //       <DrawerItem
          //         label="Home"
          //         onPress={() =>
          //           props.navigation.navigate("ProfileStack", {
          //             screen: "Profile",
          //           })
          //         }
          //       />

          //       {currentGroupCadre === "Admin" && (
          //         <DrawerItem
          //           label="View All Group Members"
          //           onPress={() => props.navigation.navigate("All Users")}
          //         />
          //       )}

          //       {(currentGroupCadre === "Admin" ||
          //         currentGroupCadre === "Chief Examiner" ||
          //         currentGroupCadre === "Examiner") && (
          //         <DrawerItem
          //           label="Question Bank"
          //           onPress={() =>
          //             props.navigation.navigate("QuestionStack", {
          //               screen: "Question Bank",
          //             })
          //           }
          //         />
          //       )}

          //       {(currentGroupCadre === "Admin" ||
          //         currentGroupCadre === "Chief Examiner" ||
          //         currentGroupCadre === "Examiner") && (
          //         <DrawerItem
          //           label="Create Question"
          //           onPress={() =>
          //             props.navigation.navigate("QuestionStack", {
          //               screen: "Create Question",
          //               params: { item: null },
          //             })
          //           }
          //         />
          //       )}

          //       {(currentGroupCadre === "Admin" ||
          //         currentGroupCadre === "Chief Examiner") && (
          //         <DrawerItem
          //           label="Quiz Bank"
          //           onPress={() =>
          //             props.navigation.navigate("QuizStack", {
          //               screen: "Quiz Bank",
          //             })
          //           }
          //         />
          //       )}
          //       {(currentGroupCadre === "Admin" ||
          //         currentGroupCadre === "Chief Examiner") && (
          //         <DrawerItem
          //           label="Create Quiz"
          //           onPress={() =>
          //             props.navigation.navigate("QuizStack", {
          //               screen: "Choose Quiz Questions",
          //             })
          //           }
          //         />
          //       )}

          //       {currentGroupCadre && (
          //         <DrawerItem
          //           label="Chat Room"
          //           onPress={() =>
          //             props.navigation.navigate("ProfileStack", {
          //               screen: "Chat",
          //             })
          //           }
          //         />
          //       )}

          //       <DrawerItem
          //         label="Flashcards"
          //         onPress={() =>
          //           props.navigation.navigate("FlashCardStack", {
          //             screen: "FlashcardGroups",
          //           })
          //         }
          //       />

          //       {paymentStatus || (
          //         <DrawerItem
          //           label="Subscribe"
          //           onPress={() =>
          //             props.navigation.navigate("ProfileStack", {
          //               screen: "Payment",
          //             })
          //           }
          //         />
          //       )}

          //       <DrawerItem
          //         label="About the App"
          //         onPress={() =>
          //           props.navigation.navigate("ProfileStack", {
          //             screen: "About",
          //           })
          //         }
          //       />

          //       <DrawerItem
          //         label="Contact Us"
          //         onPress={() =>
          //           props.navigation.navigate("ProfileStack", {
          //             screen: "ContactUs",
          //           })
          //         }
          //       />

          //       <DrawerItem label="Sign Out" onPress={LogOut} />

          //       {dbUserFirstName && (
          //         <DrawerItem label="Delete Account" onPress={wantToDelete} />
          //       )}
          //     </DrawerContentScrollView>
          //   );
          // }
          // }
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
              title: `Group: ${currentGroupName || "None"}`,
              headerShown: true,
              drawerLabel: "Profile",
              headerLeft: null,
            }}
          />

          {/* <Drawer.Screen
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
          )} */}
        </Drawer.Navigator>

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
