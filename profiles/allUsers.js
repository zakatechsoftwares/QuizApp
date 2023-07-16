import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import { useCallback, useEffect, useState, useContext } from "react";
//import { useFocusEffect } from "@react-navigation/native";
import { Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const AllUsers = ({ navigation, route }) => {
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  let [users, setUsers] = useState([]);
  let [loading, setLoading] = useState(true);

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const [runAllUseruseEffect, setRunAllUseruseEffect] = useState(false);

  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  useEffect(() => {
    const subscriber = firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((data) => {
        let members = data.data()[quizGroupNameRaw].members;
        setUsers(members);

        // const data = [];

        // querySnapshot
        //   .data()
        //   [quizGroupNameRaw].members.forEach((documentSnapshot) => {
        //     data.push(documentSnapshot);
        //   });

        // setUsers([...users, data[0]]);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     (async () => {
  //       firestore()
  //         .collection("users")
  //         .doc(quizGroupName)
  //         .get()
  //         .then((data) => {
  //           let members = data.data()[quizGroupNameRaw].members;
  //           setUsers(members);
  //         });
  //     })();
  //   }, [runAllUseruseEffect])
  // );

  const deleteUser = async (item) => {
    //  await firestore().collection('users').doc(item.userId).get()

    //        .then(async (arg)=>{
    //         let membership= arg.data().groupMembership
    //         //membership= membership.splice(membership.findIndex(element=>element.name===quizGroupName),1)
    //         const memberships =membership.filter(element=>element.userId != item.userId)
    //         await firestore().collection('users').doc(item.userId).update({
    //           groupMembership :  memberships
    //         })
    await firestore()
      .collection("users")
      .doc(item.userId)
      .update({
        groupMembership: firestore.FieldValue.arrayRemove({
          cadre: item.cadre,
          name: quizGroupNameRaw,
        }),
      })
      .then(
        await firestore()
          .collection("users")
          .doc(quizGroupName)
          .get()
          .then(async (arg) => {
            let members = arg.data()[quizGroupNameRaw].members;
            members.splice(
              members.findIndex((element) => element.userId === item.userId),
              1
            );

            await firestore()
              .collection("users")
              .doc(quizGroupName)
              .update({
                [`${quizGroupNameRaw}.members`]: members,
              });
          })
      )
      .then(
        setRunAllUseruseEffect(!runAllUseruseEffect) &&
          Alert.alert(`${item.firstName} removed from group`)
      )
      .catch((err) => Alert.alert("An error has occured, please try again"));
    //  })

    // .catch(err=>Alert.alert('An error has occured, please try again'))
  };

  const makeAdmin = async (item) => {
    if (item.cadre === "Examiner" || item.cadre === "Chief Examiner") {
      await firestore()
        .collection("users")
        .doc(item.userId)
        .get()

        .then(async (arg) => {
          let membership = arg.data().groupMembership;
          membership.splice(
            membership.findIndex(
              (element) => element.name === quizGroupNameRaw
            ),
            1,
            {
              cadre: "Admin",
              name: quizGroupNameRaw,
            }
          );

          await firestore()
            .collection("users")
            .doc(item.userId)
            .update({
              groupMembership: membership,
            })
            .then(
              await firestore()
                .collection("users")
                .doc(quizGroupName)
                .get()
                .then(async (args) => {
                  let members = args?.data()[quizGroupNameRaw].members;
                  members.splice(
                    members.findIndex(
                      (element) => element.userId === item.userId
                    ),
                    1,
                    {
                      dateJoin: item.dateJoin,
                      dateChangedRole: Date.now(),
                      cadre: "Admin",
                      userId: item.userId,
                      firstName: item.firstName,
                      middleName: item.lastName,
                      middleName: item.middleName,
                    }
                  );

                  await firestore()
                    .collection("users")
                    .doc(quizGroupName)
                    .update({
                      [`${quizGroupNameRaw}.members`]: members,
                    })
                    .then(
                      setRunAllUseruseEffect(!runAllUseruseEffect) &&
                        Alert.alert(`${item.firstName} now Admin of the group`)
                    );
                })
            );
        })
        .then(
          setRunAllUseruseEffect(!runAllUseruseEffect) &&
            Alert.alert(`${item.firstName} now Admin of the group`)
        );
      // .catch(err=>Alert.alert('An error has occured, please try again'))
    }
    if (item.cadre === "Candidate") {
      Alert.alert("Candidate cannot be made Admin");
    }
    if (item.cadre === "Admin") {
      Alert.alert(`${item.firstName} is already an Admin`);
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
            <FlatList
              data={users}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      borderBottomWidth: 2,
                      paddingBottom: 5,
                    }}
                  >
                    <Text variant="titleLarge">
                      Name: {item.firstName} {item.middleName} {item.lastName}{" "}
                      {"\n"}
                      e-mail:{item.email} {"\n"}
                      Role : {item.cadre} {"\n"}
                      Date Joined : {new Date(
                        item.dateJoin
                      ).toDateString()}{" "}
                      {"\n"}
                      {item.dateChangedRole && (
                        <Text variant="titleLarge">
                          Date made Admin :{" "}
                          {new Date(item.dateChangedRole).toDateString()}
                        </Text>
                      )}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      onPress={() => makeAdmin(item)}
                      style={[
                        styles.touchableOpacityStyle,
                        {
                          width: "48%",
                          borderRadius: 10,
                          margin: 1,
                          padding: 2,
                          backgroundColor: "green",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 20,
                          textAlign: "center",
                        }}
                      >
                        Make Admin
                      </Text>
                      {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.2}
                      onPress={() => deleteUser(item)}
                      style={[
                        styles.touchableOpacityStyle,
                        {
                          width: "48%",
                          borderRadius: 10,
                          margin: 1,
                          padding: 2,
                          backgroundColor: "green",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 20,
                          textAlign: "center",
                        }}
                      >
                        Remove{" "}
                        {dbUser.userId === item.userId && (
                          <Text
                            style={{
                              fontWeight: "bold",
                              fontSize: 20,
                              textAlign: "center",
                            }}
                          >
                            yourself
                          </Text>
                        )}{" "}
                        from Group
                      </Text>
                      {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
                    </TouchableOpacity>
                    <View style={{ borderWidth: 0.5 }} />
                  </View>
                );
              }}
              estimatedItemSize={200}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AllUsers;

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    width: 180,
    margin: 4,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inner: {
    width: "100%",
    padding: 2,
    flex: 1,
    justifyContent: "flex-end",
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
    //borderWidth:2,

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
