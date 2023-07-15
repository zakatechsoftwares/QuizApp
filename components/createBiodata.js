import {
  StyleSheet,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
//import DatePicker from 'react-native-date-picker'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Text } from "react-native-paper";
import { countryList } from "./countries";
//import RNPickerSelect from 'react-native-picker-select';

const CreateBiodata = (prop) => {
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState({ label: "", value: "" });

  let nations = countryList.map((element) => ({
    label: element,
    value: element,
  }));

  const sex = [
    { key: "1", value: "Female" },
    { key: "2", value: "Male" },
  ];

  // const cadre = [
  //   {key:'1', value:'Student'},
  //     {key:'2', value:'Examiner'},
  //     {key:'3', value:'Chief Examiner'},
  //     {key:'4', value:'Admin'}
  // ]

  return (
    <View>
      <TextInput
        name="firstName"
        onChangeText={prop.handleChange("firstName")}
        onBlur={prop.handleBlur("firstName")}
        value={prop.value.firstName}
        style={prop.style}
        placeholder="First Name"
        //  validate={prop.validatefield}
      />
      <Text style={styles.error}>{prop.firstNameError}</Text>
      {/* {prop.formik.touched.firstName && <Text>{prop.formik.errors.firstName}</Text>} */}
      <TextInput
        name="middleName"
        onChangeText={prop.handleChange("middleName")}
        onBlur={prop.handleBlur("middleName")}
        value={prop.value.middleName}
        style={prop.style}
        placeholder="Middle Name (Optional)"
        //validate={prop.validatefield}
      />
      <Text style={styles.error}>{prop.middleNameError}</Text>
      {/* <Text>{prop.formik.errors.middleName}</Text> */}
      <TextInput
        name="lastName"
        onChangeText={prop.handleChange("lastName")}
        onBlur={prop.handleBlur("lastName")}
        value={prop.value.lastName}
        style={prop.style}
        placeholder="Surname"
        //validate={prop.validatefield}
      />
      <Text style={styles.error}>{prop.lastNameError}</Text>
      {/* <Text>{prop.formik.errors.lastName}</Text> */}
      <TextInput
        name="email"
        onChangeText={prop.handleChange("email")}
        onBlur={prop.handleBlur("email")}
        value={prop.value.email}
        style={prop.style}
        placeholder="Your Email"
        editable={false}
        //  validate={prop.validatefield}
      />
      <Text style={styles.error}>{prop.emailError}</Text>

      <SelectList
        data={sex}
        setSelected={(gend) => prop.setFieldValue("sex", gend)}
        save="value"
        placeholder="Your Sex"
        search={false}
      />
      <Text style={styles.error}>{prop.sexError}</Text>

      {/* <RNPickerSelect 
          placeholder={{label:'Select your Country', value: null}}
         //  value={country}
            onValueChange={(val)=> prop.setFieldValue('country',val)}
            items={nations}
            style={{borderWidth: 2}}
            useNativeAndroidPickerStyle={false}
            /> */}

      {/* <SelectList data={countryList} setSelected={(country)=>prop.setFieldValue('country',country)} save='value' placeholder='Choose Country'
         search={false}/> */}
      <Text style={styles.error}>{prop.countryError}</Text>

      {/* <Text variant='titleLarge'>Birth Date:{prop.value.dateOfBirth} </Text> */}
      <TouchableOpacity onPress={() => setShow(true)}>
        <TextInput
          name="email"
          //  onChangeText={prop.handleChange('email')}
          //  onBlur={prop.handleBlur('email')}
          //  value={prop.value.email}
          style={prop.style}
          placeholder={prop.value.dateOfBirth || "Choose your date of birth"}
          editable={false}
          //  validate={prop.validatefield}
        />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={show}
        mode={"date"}
        onConfirm={(arg) => {
          prop.setFieldValue("dateOfBirth", new Date(arg).toDateString()) &&
            setShow(false);
        }}
        onCancel={() => setShow(false)}
      />
      <Text style={styles.error}>{prop.dateOfBirthError}</Text>
      {/* <View style={{ flexDirection:'row'}}>
              <View style={{width:'100%'}}>
              <Button title='Choose Date of Birth' onPress={()=> setShow(true)} color='#008000'/>
              </View>
             
         </View> */}
    </View>
  );
};

export default CreateBiodata;

const styles = StyleSheet.create({
  imageStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: "stretch",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  error: {
    color: "red",
  },
});
