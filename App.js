// File: App.js
import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import store from "./redux/store";
import AuthProvider from "./providers/AuthProvider";

// screens
import SignInPage from "./signinPage";
import RegisterPage from "./register";
import PaymentPage from "./paymentPage";
import AboutPage from "./About";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SignIn">
            <Stack.Screen name="SignIn" component={SignInPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
            <Stack.Screen name="Payment" component={PaymentPage} />
            <Stack.Screen name="About" component={AboutPage} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}





export const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    width: "90%",
    margin: 4,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    margin: 10,
  },
});

