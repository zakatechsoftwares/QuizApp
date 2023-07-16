import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";

import { Text } from "react-native-paper";
import { useContext, useState, useEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import firestore from "@react-native-firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentGroupCadre,
  setCurrentGroupName,
  setRunAppUseEffect,
} from "../redux/userSlice";

const UserMode = () => {
  const dispatch = useDispatch();
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  let userId = useSelector((state) => state.user).userId;

  const [groupName, setGroupName] = useState("");
  const [openGroupList, setOpenGroupList] = useState(false);

  const [groupNameError, setGroupNameError] = useState(false);
  let [groupMembership, setGroupMembership] = useState([]);

  useEffect(() => {
    setGroupMembership(dbUser?.groupMembership);
  }, []);

  const exitGroup = async (groupToExit) => {
    let groupToExitId = groupToExit.substring(0, groupToExit.indexOf("-"));
    const docRef = firestore().collection("users").doc(userId);
    docRef
      .get()
      .then((doc) => {
        let data = doc.data();

        // Find the index of the object that contains the attribute value to remove
        const indexToRemove = data.groupMembership.findIndex(
          (element) => element.name === groupToExit
        );

        // Remove the object from the array using the splice method
        data.groupMembership.splice(indexToRemove, 1);

        // Update the document with the modified array
        docRef
          .update({
            groupMembership: data.groupMembership,
          })
          .then(setGroupMembership(data.groupMembership))

          .catch((error) => {
            console.error("Error updating document: ", error);
          });
      })
      .then(async () => {
        const docRef2 = firestore().collection("users").doc(groupToExitId);

        docRef2.get().then((doc) => {
          let data = doc.data()[groupToExit];

          // Find the index of the object that contains the attribute value to remove
          const indexToRemove = data.members.findIndex(
            (element) => element.userId === userId
          );

          // Remove the object from the array using the splice method
          data.members.splice(indexToRemove, 1);

          // Update the document with the modified array
          docRef2
            .update({
              [`${groupToExit}.members`]: data.members,
            })

            .catch((error) => {
              console.error("Error updating document: ", error);
            });
        });
      });
  };

  const promtExit = (groupToExit) => {
    Alert.alert(
      "Exit Group",

      `You will no more be part of this group. 
    Are you sure you want to leave this group?`,
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            exitGroup(groupToExit);
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const field = {
    quizBank: [],
    questionBank: [],
    attemptedQuiz: [],
    scheduledQuiz: [],
    members: [],
    examinerPass: [],
    // chiefExaminerPass:[],
    // candidatePass:[]
  };

  const CreateQuizGroup = async () => {
    const checkForDot = groupName.includes(".");
    const checkForStar = groupName.includes("*");
    const checkForClosingBraket = groupName.includes("]");
    const checkForOpenBraket = groupName.includes("[");
    const checkForCurl = groupName.includes("~");
    const checkForForwardSlash = groupName.includes("/");

    if (groupName) {
      if (
        !checkForDot &&
        !checkForClosingBraket &&
        !checkForCurl &&
        !checkForOpenBraket &&
        !checkForStar &&
        !checkForForwardSlash
      ) {
        // console.log(groupName)
        //   AssignCurrentGroup({
        // name: userId+'-'+ groupName,
        // cadre: 'Admin'
        // })
        //let email = (dbUser.email).substring(0, (dbUser.email).indexOf('.'))

        firestore()
          .collection("users")
          .doc(userId)
          .update({
            [userId + "-" + groupName]: field,
            groupMembership: firestore.FieldValue.arrayUnion({
              name: userId + "-" + groupName,
              cadre: "Admin",
            }),
          })
          .then(() => {
            dispatch(setCurrentGroupName(userId + "-" + groupName));
            dispatch(setCurrentGroupCadre("Admin"));
            dispatch(setRunAppUseEffect());
          })
          .catch((err) => {
            Alert.alert("An error occured, Try again");
          });
      } else {
        Alert.alert(
          `Group name must not contain '${
            (checkForClosingBraket && "]") ||
            (checkForCurl && "~") ||
            (checkForDot && ".") ||
            (checkForForwardSlash && "/") ||
            (checkForOpenBraket && "[") ||
            (checkForStar && "*")
          }' character; Modify name to avoid it`
        );
      }
    } else {
      setGroupNameError(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            style={{ paddingBottom: 40, marginBottom: 2, width: "100%" }}
          >
            <View style={styles.inner}>
              <View style={styles.touchable}>
                <TouchableOpacity
                  activeOpacity={0.2}
                  onPress={() => setOpenGroupList(!openGroupList)}
                  style={[styles.touchableOpacityStyle]}
                >
                  <Text style={styles.touchableText}>
                    {openGroupList ? "CLOSE GROUP LIST" : "ENTER A QUIZ GROUP"}
                  </Text>
                </TouchableOpacity>

                {openGroupList && groupMembership?.length > 0 ? (
                  <ScrollView>
                    <Text style={{ textAlign: "center" }}>
                      Choose Group to Enter from{" "}
                    </Text>
                    {groupMembership.map((element) => {
                      return (
                        <View
                          key={element.name}
                          style={{ width: "100%", flexDirection: "row" }}
                        >
                          <TouchableOpacity
                            activeOpacity={0.2}
                            onPress={() => {
                              dispatch(setCurrentGroupCadre(element.cadre));
                              dispatch(setCurrentGroupName(element.name));
                              dispatch(setRunAppUseEffect());
                            }}
                            style={{
                              height: 40,
                              width: element.cadre === "Admin" ? "100%" : "85%",
                            }}
                          >
                            <Text
                              style={{
                                color: "black",
                                fontSize: 20,
                                textAlign: "left",
                              }}
                            >
                              {element.name.substring(
                                element.name.indexOf("-") + 1
                              )}
                            </Text>
                          </TouchableOpacity>
                          {element.cadre === "Admin" || (
                            <TouchableOpacity
                              activeOpacity={0.2}
                              onPress={() => {
                                promtExit(element.name);
                              }}
                              style={{}}
                            >
                              <Text
                                style={{
                                  color: "red",
                                  flexWrap: "wrap",
                                  fontSize: 20,
                                  textAlignVertical: "center",
                                }}
                              >
                                leave{" "}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  openGroupList && (
                    <Text style={{ color: "red", textAlign: "center" }}>
                      You do not belong to any group yet; {"\n"} Create a group
                      or Join a group{" "}
                    </Text>
                  )
                )}
              </View>

              <View style={styles.touchable}>
                <TextInput
                  name="answerExplanation"
                  value={groupName} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                  onChangeText={(e) => setGroupName(e)}
                  placeholder="Enter Group Name"
                  textAlignVertical="top"
                  style={styles.input}
                />
                {groupNameError && (
                  <Text style={{ color: "red", textAlign: "center" }}>
                    Please enter name of the group
                  </Text>
                )}
                <TouchableOpacity
                  activeOpacity={0.2}
                  onPress={() => CreateQuizGroup()}
                  style={[styles.touchableOpacityStyle]}
                >
                  <Text style={styles.touchableText}>CREATE A QUIZ GROUP</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 100 }} />
            </View>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserMode;

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.5,
    width: "90%",
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: 2,
    fontSize: 16,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
  },
  touchableOpacityStyle: {
    width: "100%",
    borderRadius: 10,
    margin: 1,
    padding: 2,
    backgroundColor: "green",
    alignItems: "center",
    height: 40,
    justifyContent: "center",
  },

  touchable: {
    width: "100%",
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  touchableText: {
    fontWeight: "bold",
    // fontSize:20,
    textAlign: "center",
    color: "white",
  },
  inner: {
    width: "100%",
    padding: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
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
    // borderWidth:2,

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
