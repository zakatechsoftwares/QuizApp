import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  Platform,
  Alert,
  TouchableOpacity,
  Share,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import CountDown from "../components/countDown";
import { Text } from "react-native-paper";
import dynamicLinks from "@react-native-firebase/dynamic-links";
//import Share from "react-native-share";
import { SelectList } from "react-native-dropdown-select-list";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import GestureRecognizer from "react-native-swipe-gestures";
import { useSelector } from "react-redux";

//const prefix = Linking.createURL('/');
const AdminPage = ({ navigation }) => {
  const [attemptedQuiz, setAttemptedQuiz] = useState([]);
  const [scheduledQuiz, setScheduledQuiz] = useState([]);
  const [runUseEffect, setRunUseEffect] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testLink, setTestLink] = useState("");
  const [roleError, setRoleError] = useState(false);
  const [invitedCadre, setInvitedCadre] = useState("");
  const [show, setShow] = useState(true);

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const cadre = [
    { key: "1", value: "Candidate" },
    { key: "2", value: "Examiner" },
    { key: "3", value: "Chief Examiner" },
  ];

  const InviteLink = async () => {
    if (invitedCadre) {
      const passKey = Math.random().toString(36).substring(2, 12);
      await dynamicLinks()
        .buildLink({
          link: encodeURI(
            `https://zakatechsoftwarequizap.page.link/QuizAp?=${
              invitedCadre + "?" + quizGroupNameRaw + "~" + passKey
            }`
          ), //`https://myproject-9562e.web.app/?${dbUser.email}`,//`https://quizap.page.link/quizapp/?email=${dbUser.email}`,
          // domainUriPrefix is created in your Firebase console
          domainUriPrefix: "https://zakatechsoftwarequizap.page.link",
          android: {
            packageName: "com.zakatechsoftware.QuizAp",
          },
          ios: {
            appStoreId: "6453023834",
            bundleId: "com.zakatechsoftware.QuizAp",
          },
        })

        .then((arg) => {
          Share.share({
            message: `Click the following link to join ${groupName} as ${invitedCadre} 
Do NOT share the key as it can be used only once:${arg}`,
            // url: `${arg}`,
          })
            .then((result) => {
              if (result.action === Share.sharedAction) {
                // Link shared successfully
                // Run your additional function here
                firestore()
                  .collection("users")
                  .doc(quizGroupName)
                  .update({
                    [`${quizGroupNameRaw}.examinerPass`]:
                      firestore.FieldValue.arrayUnion({
                        cadre: invitedCadre,
                        passKey: passKey,
                      }),
                  })
                  .then(() => {
                    Alert.alert("Invitation link sent");
                  })
                  .catch((e) => Alert.alert("An error has occured"));
              } else if (result.action === Share.dismissedAction) {
                // Sharing dismissed
              }
            })
            .catch((error) => {
              // Handle error
            });
        });
    } else setRoleError(true);
  };

  const FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View
        style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
      />
    );
  };

  const ScheduleSortingOrder = (a, b) => {
    const aSchedule =
      a.schedule?.nanoseconds / 1000 + a.schedule?.seconds * 1000;
    const bSchedule =
      b.schedule?.nanoseconds / 1000 + b.schedule?.seconds * 1000;
    if (bSchedule > aSchedule) {
      return -1;
    }
    if (bSchedule < aSchedule) {
      return 1;
    }
    if (bSchedule === aSchedule) {
      return 0;
    }
  };

  useEffect(() => {
    // (async () => {
    //   //   setTimeout(() => {
    //   //     setRunUseEffect(!runUseEffect);
    //   //   }, 2000);

    //   let data = await
    firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((data) => {
        if (data) {
          setRefreshing(false);
          let quizScheduled = data.data()[quizGroupNameRaw].scheduledQuiz;
          let quizAttempted = data.data()[quizGroupNameRaw].attemptedQuiz;
          setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));

          quizScheduled = quizScheduled.filter(
            (element) => element.schedule.seconds - Date.now() < 86400
          );
          setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));
          setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder));
        }
      });

    //  console.log(quizAttempted)
    //  console.log(quizScheduled)
    // }

    //  )();
  }, []);

  const standardDeviation = (arr, usePopulation = false) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr
        .reduce((acc, val) => acc.concat((val - mean) ** 2), [])
        .reduce((acc, val) => acc + val, 0) /
        (arr.length - (usePopulation ? 0 : 1))
    );
  };

  const meanScore = (arr) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return mean;
  };

  const optionBoxValue = useSharedValue("auto");
  const optionBoxAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: optionBoxValue.value,
    };
  });

  return (
    <View style={{ marginTop: Platform.OS == "ios" ? 20 : 30 }}>
      {show && (
        <View
          style={[
            {
              width: "100%",
              flexDirection: "row",
              height: "auto",
              flexWrap: "wrap",
              justifyContent: "space-around",
            },
          ]}
        >
          <View style={[styles.touchable]}>
            <SelectList
              data={cadre}
              setSelected={(arg) => {
                setInvitedCadre(arg);
                setRoleError(false);
              }}
              save="value"
              placeholder="Choose The Role of the Member to be Invited"
              search={false}
              // boxStyles={{width:'80%', textAlign:'center'}}
            />
            {roleError && (
              <Text style={styles.error}>Choose role of the Member </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.2}
              onPress={
                () => InviteLink() //</View>navigation.navigate('ProfileStack',{screen:'All Users'})
              }
              style={[styles.touchableOpacityStyle, { width: "100%" }]}
            >
              <Text style={styles.touchableText}>Invite Member</Text>
              {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* <GestureHandlerRootView>
      <PanGestureHandler
      onGestureEvent={(e)=>optionBoxValue.value= optionBoxValue.value ? 0 : optionBoxValue.value}
      > */}
      <GestureRecognizer
        onSwipeUp={(state) => setShow(false)}
        onSwipeDown={(state) => setShow(true)}
      >
        <SectionList
          // ref={ref=>(this.scrollRef=ref)}
          ItemSeparatorComponent={FlatListItemSeparator}
          sections={[
            // { title: 'Scheduled Quiz', data: scheduledQuiz },
            // { title: 'Attempted Quiz', data: attemptedQuiz }
            {
              title:
                scheduledQuiz.length === 0
                  ? "No Scheduled Quiz"
                  : "Scheduled Quiz",
              data: scheduledQuiz,
            },
            {
              title:
                attemptedQuiz.length === 0
                  ? "No Attempted Quiz"
                  : "Attempted Quiz",
              data: attemptedQuiz,
            },
          ]}
          // refreshing={refreshing}
          // onRefresh={() => {
          //   // setRefreshing(true);
          //   setRunUseEffect(!runUseEffect);
          //   setShow(true);
          // }}
          renderSectionHeader={({ section }) => (
            <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
          )}
          renderItem={({ item }) => {
            const millisec =
              item.schedule?.nanoseconds / 1000 + item.schedule?.seconds * 1000;
            const date = new Date(millisec);
            let filtered = attemptedQuiz?.filter(
              (element) => element.quizId === item.quizId
            );
            filtered = filtered.map((element, i) => {
              return parseFloat(
                element.score //.substring(0,element.score.indexOf('%'))
              );
            });
            let scoreStandardDeviation = standardDeviation(filtered, true);
            let scoreMean = meanScore(filtered);

            return (
              <View>
                <Text variant="titleLarge">Quiz Title: {item.quizName}</Text>
                {item.score && (
                  <Text variant="titleLarge">
                    Score Standard Deviation:{" "}
                    {scoreStandardDeviation.toFixed(2)}
                  </Text>
                )}
                {item.score && (
                  <Text variant="titleLarge">
                    Score Mean: {scoreMean.toFixed(2)}
                  </Text>
                )}
                {item.score && (
                  <TouchableOpacity
                    activeOpacity={0.2}
                    onPress={() =>
                      navigation.navigate("QuizStack", {
                        screen: "All Attempts",
                        params: {
                          quizId: item.quizId,
                          scoreMean: scoreMean,
                          scoreStandardDeviation: scoreStandardDeviation,
                        },
                      })
                    }
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
                      View Attempts
                    </Text>
                    {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
                  </TouchableOpacity>
                )}

                {item.schedule && (
                  <Text variant="titleLarge">
                    <CountDown timers={millisec} />
                  </Text>
                )}

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View></View>
                </View>
              </View>
            );
          }}
          keyExtractor={(item, index) =>
            item.scheduledQuizId
              ? item.scheduledQuizId
              : item.attemptedQuizId
              ? item.attemptedQuizId
              : item.quizId
          }
        />
      </GestureRecognizer>

      {/* </PanGestureHandler>
        </GestureHandlerRootView>  */}
    </View>
  );
};

export default AdminPage;

const styles = StyleSheet.create({
  error: {
    color: "red",
    textAlign: "center",
  },
  SectionHeaderStyle: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff",
  },
  touchableOpacityStyle: {
    width: "40%",
    borderRadius: 10,
    margin: 1,
    padding: 2,
    backgroundColor: "green",
    margin: 5,
  },
  touchable: {
    width: "80%",
    alignItems: "center",
  },
  SectionListItemStyle: {
    fontSize: 15,
    padding: 15,
    color: "#000",
    backgroundColor: "#F5F5F5",
  },
  touchableText: {
    //fontWeight:'bold',
    // fontSize:20,
    textAlign: "center",
    color: "white",
    //fontWeight:'bold',
    fontSize: 16,
    textAlign: "center",
  },
});

// import { StyleSheet, Text, View, Button } from 'react-native'
// import React, {useState} from 'react'
// import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
// import { db } from '../utils/firebase';

// const AdminPage = () => {

//     let[chiefExaminerPassList, setChiefExaminerPassList]= useState()

//     let [passKey, setPassKey] = useState( {
//   chiefExaminerPass: Array(3).fill(""),
//   examinerPass: Array(3).fill(""),
//   candidatePass: Array(3).fill("")
// }
// );

// const savePassKey = async (chiefExaminerPass) =>{
//     const pass = doc(db, "users", "PassKeys");
//     await passKey.chiefExaminerPass.map(item=>{
//         updateDoc(pass,
//         {chiefExaminerPass: arrayUnion(item)})
//     });
//     await passKey.examinerPass.map(item=>{
//         updateDoc(pass,
//         {examinerPass: arrayUnion(item)})
//     });
//     await passKey.candidatePass.map(item=>{
//         updateDoc(pass,
//         {candidatePass: arrayUnion(item)})
//     });

// //         {
// //     chiefExaminerPass: passKey.chiefExaminerPass.map(i=>{
// //         return arrayUnion(i)
// //     }),
// //      examinerPass: passKey.examinerPass.map(i=>{
// //         return arrayUnion(i)
// //     }),
// //     candidatePass: passKey.candidatePass.map(i=>{
// //         return arrayUnion(i)
// //     })
// // }
// //);

// }

//     const generateKey = async () => {

//   let chiefExaminerPass = passKey.chiefExaminerPass.map((e, index) => {
//     return (passKey.chiefExaminerPass[index] = Math.random()
//       .toString(36)
//       .substring(2, 4));
//   })
//   let examinerPass = passKey.examinerPass.map((e, index) => {
//     return (passKey.examinerPass[index] = Math.random()
//       .toString(36)
//       .substring(2, 4));
//   })
//   let candidatePass = passKey.candidatePass.map((e, index) => {
//     return (passKey.candidatePass[index] = Math.random()
//       .toString(36)
//       .substring(2, 4));
//   })
//   setPassKey({
//       chiefExaminerPass: chiefExaminerPass,
//       examinerPass: examinerPass,
//       candidatePass: candidatePass
//     }
//   );

//   savePassKey(chiefExaminerPass)
// }

//   return (
//     <View>
//       <Text> <Button title='Generate Pass keys' onPress={generateKey} /></Text>
//     </View>
//   )
// }

// export default AdminPage

// const styles = StyleSheet.create({})
