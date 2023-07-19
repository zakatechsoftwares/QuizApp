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
    (async () => {
      setTimeout(() => {
        setRunUseEffect(!runUseEffect);
      }, 2000);

      const data = await firestore()
        .collection("users")
        .doc(quizGroupName)
        .get()
        .then(setRefreshing(false));

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
    })();
  }, [runUseEffect]);

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
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setRunUseEffect(!runUseEffect);
        }}
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
              {item.score && (
                <Text variant="titleLarge">
                  Your Score: {parseFloat(item.score).toFixed(2)}%
                </Text>
              )}
              {item.score && (
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
                <View></View>

                {item.score && (
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
                      onPress={() =>
                        navigation.navigate("ProfileStack", {
                          screen: paymentStatus ? "Review Attempts" : "Payment",
                          params: {
                            quizId: item.quizId,
                            attemptedQuizId: item.attemptedQuizId,
                          },
                        })
                      }
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
                      onPress={() =>
                        navigation.navigate("ProfileStack", {
                          screen: paymentStatus ? "Attempt Quiz" : "Payment",
                          params: {
                            quizId: item.quizId,
                            quizName: item.quizName,
                          },
                        })
                      }
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
          item.scheduledQuizId ? item.scheduledQuizId : item.attemptedQuizId
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
