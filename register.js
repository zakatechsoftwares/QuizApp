import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";

const Register = (prop) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const RegisterUser = async () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (
      email &&
      reg.test(email) === true &&
      password &&
      password === confirmPassword
    ) {
      await auth()
        .createUserWithEmailAndPassword(email, password)
        .then((credentials) => {
          credentials.user.sendEmailVerification();
          console.log("cureent user", auth().currentUser);
          console.log("credentials", credentials.user);
        })

        .then(() =>
          Alert.alert(
            `To sign in, Verify by clicking the link sent to ${email}`
          )
        )
        .catch((error) => {
          console.log("error sending messge", error.message);
          if (error.code === "auth/email-already-in-use") {
            Alert.alert("That email address is already in use!");
          }

          if (error.code === "auth/invalid-email") {
            Alert.alert("That email address is invalid!");
          }

          if (error.code === "auth/weak-password") {
            Alert.alert(
              "The password is too short!; use at least 6 characters"
            );
          }
        });
    } else {
      if (
        reg.test(email) === false ||
        !email ||
        !password ||
        password !== confirmPassword
      ) {
        Alert.alert("Entered a valid email and ensure the two passwords match");
      }
    }
  };

  return (
    <View>
      <Text style={{ textAlign: "center" }}> FILL THE FORM TO REGISTER </Text>
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
      <TextInput
        name="confirmPassword"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
        }}
        placeholder="Re-Enter Password"
        style={styles.input}
        secureTextEntry
      />
      <View>
        <Pressable style={styles.button} onPress={RegisterUser}>
          <Text style={styles.text}>SignUp</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    width: 200,
    margin: 4,
    paddingHorizontal: 16,
    fontSize: 16,
    height: 48,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
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
