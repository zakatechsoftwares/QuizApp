import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  SectionList,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import CountDown from "../components/countDown";
import { Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const CandidatePage = ({ navigation }) => {
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [attemptedQuiz, setAttemptedQuiz] = useState([]);
  const [scheduledQuiz, setScheduledQuiz] = useState([]);
  const [runUseEffect, setRunUseEffect] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  let paymentStatus = useSelector((state) => state.user).paymentStatus;

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const submit = async (item) => {
    await firestore()
      .collection("users")
      .doc(quizGroupName)
      .update({
        [`${quizGroupNameRaw}.attemptedQuiz`]: firestore.FieldValue.arrayUnion({
          // dateCreated: new Date(),
          //quizId: Math.random().toString(36).substring(2, 12),
          //attemptedQuizId: Math.random().toString(36).substring(2, 12),
          quizName: item.quizName,
          quizId: item.quizId,
          candidate: dbUser.email,
          candidateId: dbUser.userId,
          // response: response,
          attemptedSBA: 0,
          correctSBA: 0,
          totalSBA: 0,
          negFacSBA: 0,
          attemptedMCQ: 0,
          correctMCQ: 0,
          totalMCQ: 0,
          negFacMCQ: 0,
          score: 0 + "%",
        }),
      })
      .then(
        navigation.navigate("ProfileStack", {
          screen: paymentStatus ? "Attempt Quiz" : "Payment",
          params: {
            quizId: item.quizId,
            quizName: item.quizName,
          },
        })
      );
  };

  const onSubmit = (item) => {
    const validButtons = [
      { text: "Don't Start", style: "cancel", onPress: () => {} },
      {
        text: "Start",
        style: "destructive",
        // If the user confirmed, then we dispatch the action we blocked earlier
        // This will continue the action that had triggered the removal of the screen
        onPress: () => {
          submit(item);
        },
      },
    ];

    Alert.alert(
      "You are about to start a quiz",
      "Please do not exit quiz without submitting to avoid been scored zero!",
      validButtons.map((buttonText) => ({
        text: buttonText.text,
        onPress: buttonText.onPress,
      }))
    );
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
    firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((data) => {
        if (data) {
          setRefreshing(false);

          let quizScheduled = data.data()[quizGroupNameRaw].scheduledQuiz;
          let quizAttempteds = data.data()[quizGroupNameRaw].attemptedQuiz;

          let quizAttempted = quizAttempteds.filter(
            (item) => item.candidateId === dbUser.userId
          );

          // console.log(data.data()[quizGroupNameRaw].scheduledQuiz)
          for (element of quizAttempted) {
            quizScheduled.map((item, i) => {
              if (element.quizId === item.quizId) {
                quizScheduled.splice(i, 1);
                //setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder))
              }
            });
          }
          setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));
          setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder));
        }
      });
  }, []);

  return (
    <View style={{ marginTop: Platform.OS == "ios" ? 20 : 30 }}>
      <SectionList
        // ref={ref=>(this.scrollRef=ref)}
        ItemSeparatorComponent={FlatListItemSeparator}
        sections={[
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
        //refreshing={refreshing}
        // onRefresh={() => {
        //   //  setRefreshing(true);
        //   setRunUseEffect(!runUseEffect);
        // }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
        )}
        renderItem={({ item }) => {
          const millisec =
            item.schedule?.nanoseconds / 1000 + item.schedule?.seconds * 1000;
          const date = new Date(millisec);
          let percentile = attemptedQuiz?.filter(
            (element) =>
              element.author === item.author &&
              element.quizId === item.quizId &&
              parseFloat(
                element.score //.substring(0,element?.score.indexOf('%'))
              ) <= parseFloat(item.score)
          ).length;
          percentile = (percentile / attemptedQuiz?.length) * 100;

          return (
            <View>
              <Text variant="titleLarge">Quiz Title: {item.quizName}</Text>
              {item.score !== undefined && (
                <Text variant="titleLarge">
                  Your Score: {parseFloat(item.score).toFixed(2)}%
                </Text>
              )}
              {item.score !== undefined && (
                <Text variant="titleLarge">
                  Your Score is in : {percentile.toFixed(2)} percentile
                </Text>
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
                {item.score !== undefined && (
                  <View
                    style={{
                      backgroundColor: "green",
                      width: "30%",
                      height: 40,
                      marginLeft: 0,
                      borderWidth: 1,
                      borderRadius: 10,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (item.attemptedQuizId) {
                          navigation.navigate("ProfileStack", {
                            screen: paymentStatus
                              ? "Review Attempts"
                              : "Payment",
                            params: {
                              quizId: item.quizId,
                              attemptedQuizId: item.attemptedQuizId,
                            },
                          });
                        } else {
                          Alert.alert(
                            "You scored zero because you exited the quiz "
                          );
                        }
                      }}
                    >
                      <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                        Review Answers
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.scheduledQuizId && (
                  <View
                    style={{
                      backgroundColor:
                        new Date() >= millisec ? "green" : "orange",
                      width: "30%",
                      height: 40,
                      marginLeft: 0,
                      borderWidth: 1,
                      borderRadius: 10,
                      justifyContent: "space-evenly",
                    }}
                  >
                    <TouchableOpacity
                      disabled={new Date() >= millisec ? false : true}
                      onPress={() => onSubmit(item)}
                    >
                      <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                        {new Date() >= millisec
                          ? "Take the Quiz"
                          : "Waiting..."}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    </View>
  );
};

export default CandidatePage;

const styles = StyleSheet.create({
  SectionHeaderStyle: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff",
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

// import { useState, useEffect, useContext } from "react";
// import {
//   StyleSheet,
//   View,
//   SectionList,
//   Platform,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import CountDown from "../components/countDown";
// import { Text } from "react-native-paper";
// import firestore from "@react-native-firebase/firestore";
// import { useSelector } from "react-redux";

// const CandidatePage = ({ navigation }) => {
//   let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
//   const [attemptedQuiz, setAttemptedQuiz] = useState([]);
//   const [scheduledQuiz, setScheduledQuiz] = useState([]);
//   const [runUseEffect, setRunUseEffect] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   let paymentStatus = useSelector((state) => state.user).paymentStatus;

//   let currentGroupName = useSelector((state) => state.user).currentGroupName;
//   const quizGroupNameRaw = currentGroupName;
//   const quizGroupName = quizGroupNameRaw.substring(
//     0,
//     quizGroupNameRaw.indexOf("-")
//   );
//   const groupName = quizGroupNameRaw.substring(
//     quizGroupNameRaw.indexOf("-") + 1
//   );

//   const FlatListItemSeparator = () => {
//     return (
//       //Item? Separator
//       <View
//         style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
//       />
//     );
//   };

//   const ScheduleSortingOrder = (a, b) => {
//     const aSchedule =
//       a.schedule?.nanoseconds / 1000 + a.schedule?.seconds * 1000;
//     const bSchedule =
//       b.schedule?.nanoseconds / 1000 + b.schedule?.seconds * 1000;
//     if (bSchedule > aSchedule) {
//       return -1;
//     }
//     if (bSchedule < aSchedule) {
//       return 1;
//     }
//     if (bSchedule === aSchedule) {
//       return 0;
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       await firestore()
//         .collection("users")
//         .doc(quizGroupName)
//         .onSnapshot((data) => {
//           if (data) {
//             let quizScheduled = data.data()[quizGroupNameRaw].scheduledQuiz;
//             let quizAttempteds = data.data()[quizGroupNameRaw].attemptedQuiz;

//             let quizAttempted = quizAttempteds.filter(
//               (item) => item?.candidateId === dbUser.userId
//             );

//             // console.log(data.data()[quizGroupNameRaw].scheduledQuiz)
//             for (element of quizAttempted) {
//               quizScheduled.map((item, i) => {
//                 if (element.quizId === item?.quizId) {
//                   quizScheduled.splice(i, 1);
//                   //setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder))
//                 }
//               });
//             }
//             setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));
//             setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder));
//             setRefreshing(false);
//           }
//         })
//         .catch((e) => Alert.alert(e.message));
//     })();
//   }, [runUseEffect]);

//   return (
//     <View style={{ marginTop: Platform.OS == "ios" ? 20 : 30 }}>
//       <SectionList
//         // ref={ref=>(this.scrollRef=ref)}
//         ItemSeparatorComponent={FlatListItemSeparator}
//         sections={[
//           {
//             title:
//               scheduledQuiz.length === 0
//                 ? "No Scheduled Quiz"
//                 : "Scheduled Quiz",
//             data: scheduledQuiz,
//           },
//           {
//             title:
//               attemptedQuiz.length === 0
//                 ? "No Attempted Quiz"
//                 : "Attempted Quiz",
//             data: attemptedQuiz,
//           },
//         ]}
//         refreshing={refreshing}
//         onRefresh={() => {
//           setRefreshing(true);
//           setRunUseEffect(!runUseEffect);
//         }}
//         renderSectionHeader={({ section }) => (
//           <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
//         )}
//         renderItem={({ item }) => {
//           const millisec =
//             item?.schedule?.nanoseconds / 1000 + item?.schedule?.seconds * 1000;
//           const date = new Date(millisec);
//           let percentile = attemptedQuiz?.filter(
//             (element) =>
//               element.author === item?.author &&
//               element.quizId === item?.quizId &&
//               parseFloat(
//                 element.score //.substring(0,element?.score.indexOf('%'))
//               ) <= parseFloat(item?.score)
//           ).length;
//           percentile = (percentile / attemptedQuiz?.length) * 100;
//           if ((attemptedQuiz.length = 0)) {
//             return <Text>no attempted quiz</Text>;
//           }
//           return (
//             <View>
//               <Text variant="titleLarge">Quiz Title: {item?.quizName}</Text>
//               {item?.score && (
//                 <Text variant="titleLarge">
//                   Your Score: {parseFloat(item?.score).toFixed(2)}%
//                 </Text>
//               )}
//               {item?.score && (
//                 <Text variant="titleLarge">
//                   Your Score is in : {percentile.toFixed(2)} percentile
//                 </Text>
//               )}
//               {item?.schedule && (
//                 <Text variant="titleLarge">
//                   <CountDown timers={millisec} />
//                 </Text>
//               )}

//               <View
//                 style={{
//                   flex: 1,
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <View></View>

//                 {item?.score && (
//                   <View
//                     style={{
//                       backgroundColor: "green",
//                       width: "30%",
//                       height: 40,
//                       marginLeft: 0,
//                       borderWidth: 1,
//                       borderRadius: 10,
//                       justifyContent: "space-evenly",
//                     }}
//                   >
//                     <TouchableOpacity
//                       onPress={() =>
//                         navigation.navigate("ProfileStack", {
//                           screen: paymentStatus ? "Review Attempts" : "Payment",
//                           params: {
//                             quizId: item?.quizId,
//                             attemptedQuizId: item?.attemptedQuizId,
//                           },
//                         })
//                       }
//                     >
//                       <Text style={{ fontWeight: "bold", textAlign: "center" }}>
//                         Review Answers
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}

//                 {item?.scheduledQuizId && (
//                   <View
//                     style={{
//                       backgroundColor:
//                         new Date() >= millisec ? "green" : "orange",
//                       width: "30%",
//                       height: 40,
//                       marginLeft: 0,
//                       borderWidth: 1,
//                       borderRadius: 10,
//                       justifyContent: "space-evenly",
//                     }}
//                   >
//                     <TouchableOpacity
//                       disabled={new Date() >= millisec ? false : true}
//                       onPress={() => {
//                         navigation.navigate("ProfileStack", {
//                           screen: paymentStatus ? "Attempt Quiz" : "Payment",
//                           params: {
//                             quizId: item?.quizId,
//                             quizName: item?.quizName,
//                           },
//                         });
//                       }}
//                     >
//                       <Text style={{ fontWeight: "bold", textAlign: "center" }}>
//                         {new Date() >= millisec
//                           ? "Take the Quiz"
//                           : "Waiting..."}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>
//             </View>
//           );
//         }}
//         keyExtractor={(item, index) =>
//           item?.scheduledQuizId ? item?.scheduledQuizId : item?.attemptedQuizId
//         }
//       />
//     </View>
//   );
// };

// export default CandidatePage;

// const styles = StyleSheet.create({
//   SectionHeaderStyle: {
//     backgroundColor: "#CDDC89",
//     fontSize: 20,
//     padding: 5,
//     color: "#fff",
//   },

//   SectionListItemStyle: {
//     fontSize: 15,
//     padding: 15,
//     color: "#000",
//     backgroundColor: "#F5F5F5",
//   },
//   touchableText: {
//     //fontWeight:'bold',
//     // fontSize:20,
//     textAlign: "center",
//     color: "white",
//     //fontWeight:'bold',
//     fontSize: 16,
//     textAlign: "center",
//   },
// });
