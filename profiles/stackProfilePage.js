import { StyleSheet } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "./profile";
import CreateProfile from "./createProfile";
import AllUsers from "./allUsers";
import UserMode from "./userMode";
import Chat from "./chat";
import ReviewAttempts from "../quiz/reviewAttempts";
import AttemptQuiz from "../quiz/attemptQuiz";
import PaymentPage from "../paymentPage";
import About from "../About";
import ContactUsPage from "./contactUs";
import { useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

const StackProfilePage = () => {
  let dbUserFirstName = useSelector((state) => state.user).dbUserFirstName;
  let userCurrentGroupCadre = useSelector(
    (state) => state.user
  ).currentGroupCadre;
  let paymentStatus = useSelector((state) => state.user).paymentStatus;

  dbUserFirstName = dbUserFirstName ? true : false;
  return (
    <Stack.Navigator //initialRouteName='Profile'
    >
      {paymentStatus === false && dbUserFirstName ? ( //paymentStatus &&
        <Stack.Screen name="Payment" component={PaymentPage} />
      ) : null}

      {dbUserFirstName &&
        userCurrentGroupCadre && ( //paymentStatus &&
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ title: "Home", headerShown: true }}
          />
        )}

      {dbUserFirstName &&
        userCurrentGroupCadre && ( //paymentStatus &&
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={{ title: "Chat Room", headerShown: true }}
          />
        )}
      {dbUserFirstName &&
        userCurrentGroupCadre === "Candidate" &&
        paymentStatus && (
          <Stack.Screen name="Review Attempts" component={ReviewAttempts} />
        )}

      {dbUserFirstName || (
        <Stack.Screen name="Create Profile" component={CreateProfile} />
      )}
      {dbUserFirstName && userCurrentGroupCadre === null && (
        //userCurrentGroupCadre===null &&
        //paymentStatus &&
        <Stack.Screen name="User Mode" component={UserMode} />
      )}
      {/* 
      {dbUserFirstName && ( //paymentStatus &&
        <Stack.Screen name="Edit Profile" component={EditProfile} />
      )} */}

      {dbUserFirstName &&
        userCurrentGroupCadre === "Admin" && ( //paymentStatus &&
          <Stack.Screen name="All Users" component={AllUsers} />
        )}
      {dbUserFirstName &&
        userCurrentGroupCadre === "Candidate" &&
        paymentStatus && (
          <Stack.Screen
            name="Attempt Quiz"
            component={AttemptQuiz}
            options={{
              //   title: 'Exam Started',
              headerLeft: null,
              // drawerIcon:  ({ focused, color, size }) => {
              //   return null
              // }
            }}
          />
        )}

      <Stack.Screen
        name="About"
        component={About}
        options={{ title: "About the App", headerShown: true }}
      />

      <Stack.Screen
        name="ContactUs"
        component={ContactUsPage}
        options={{ title: "Contact Us", headerShown: true }}
      />
    </Stack.Navigator>
  );
};

export default StackProfilePage;

const styles = StyleSheet.create({});
