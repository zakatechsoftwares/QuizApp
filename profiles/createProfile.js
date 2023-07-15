import * as React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
  Button,
} from "react-native";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import CreateBiodata from "../components/createBiodata";
import firestore from "@react-native-firebase/firestore";
import { useDispatch } from "react-redux";
import { setRunAppUseEffect } from "../redux/userSlice";

export default function CreateProfile({ navigation }) {
  let userEmail = useSelector((state) => state.user).userEmail;
  let userId = useSelector((state) => state.user).userId;
  let dispatch = useDispatch();

  const [data, setData] = useState({
    userId: userId,
    firstName: "",
    middleName: "",
    lastName: "",
    email: userEmail,
    dateOfBirth: "",
    sex: "",
    country: "",
    exempted: false,
    dateJoined: Date.now(),
  });

  const validationSchema = yup.object().shape({
    firstName: yup.string().required("This field is required"),
    lastName: yup.string().required("This field is required"),
    // country: yup.string().required("This field is required"),
    sex: yup.string().required("This field is required"),
  });

  const onSubmit = async (values) => {
    try {
      firestore()
        .collection("users")
        .doc(userId)
        .set({
          ...values,
          dateJoined: Date.now(),
          groupMembership: [],
          payments: [],
        })
        .then(dispatch(setRunAppUseEffect()));
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Formik
              initialValues={data}
              validationSchema={validationSchema}
              onSubmit={(values) => onSubmit(values)}
              // validateOnBlur={false}
              //  validateOnChange={false}
              validateOnMount={true}
            >
              {(formik) => (
                <View>
                  <CreateBiodata
                    handleChange={formik.handleChange}
                    handleBlur={formik.handleBlur}
                    value={formik.values}
                    style={styles.input}
                    setFieldValue={formik.setFieldValue}
                    formik={formik}
                    firstNameError={<ErrorMessage name="firstName" />}
                    lastNameError={<ErrorMessage name="lastName" />}
                    middleNameError={<ErrorMessage name="middleName" />}
                    dateOfBirthError={<ErrorMessage name="dateOfBirth" />}
                    emailError={<ErrorMessage name="email" />}
                    countryError={<ErrorMessage name="country" />}
                    sexError={<ErrorMessage name="sex" />}
                  />

                  <View style={{ width: "100%", alignItems: "center" }}>
                    <View
                      style={{ width: "50%", marginTop: 5, borderRadius: 15 }}
                    >
                      <Button
                        title="Create Profile"
                        onPress={() => formik.handleSubmit()}
                        color="#008000"
                        borderRadius={8}
                      />
                    </View>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.8,
    width: "99%",
    marginHorizontal: 2,
    // marginVertical:2,
    paddingHorizontal: 2,
    fontSize: 16,
    height: 45,
    borderRadius: 8,
    //marginRight:20
  },
  inner: {
    width: "100%",
    padding: 2,
    flex: 1,

    flexDirection: "column",
  },
  container: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 1,
    height: 100,

    margin: 1,
    //flexDirection: 'row',
    flexWrap: "wrap",

    backgroundColor: "#ecf0f1",
  },
  checkbox: {
    margin: 8,
  },

  stretch: {
    width: "100%",
    height: 200,
    resizeMode: "stretch",
  },
});
