import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
} from "react-native";
import React from "react";
import * as ImagePicker from "expo-image-picker";

const UploadFiles = (prop) => {
  // const[image, setImage] = useState('')
  // const [permission, setPermission] = useState()
  // useEffect((async()=>{
  //   let permissionStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
  //   setPermission(permissionStatus.status === 'granted')
  // })(),[])

  // useEffect( ()=>{
  //   if(Platform.OS !== 'web'){
  //     let {status} = ImagePicker.getMediaLibraryPermissionsAsync()
  //     if(status !== 'granted'){
  //       alert('permission denied')
  //     }
  //   }
  // },[])
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        activeOpacity={0.5}
        // style={styles.TouchableOpacity}
        onPress={async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [10, 10],
            quality: 1,
          });
          // setImage(result.assets[0].uri)
          if (!result.canceled) {
            prop.setFieldValue("image", result.assets[0].uri);
            console.log(result);
          }
        }}
      >
        <Text>{prop.imageTitle}</Text>
      </TouchableOpacity>
      {prop.value.image && (
        <View style={styles.container}>
          <Image source={{ uri: prop.value.image }} style={styles.container} />
        </View>
      )}
      <Text>{prop.imageFieldError}</Text>
    </View>
  );
};

export default UploadFiles;

const styles = StyleSheet.create({
  TouchableOpacity: {
    //  backgroundColor: '#04b040',
    // borderRadius: 15,
    // paddingHorizontal: 15,
    // paddingVertical: 5,
    alignItems: "center",
    // shadowColor: '#E67E22',
    // shadowOpacity: 0.8,
    elevation: 8,
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingTop: 57,
  },
});
