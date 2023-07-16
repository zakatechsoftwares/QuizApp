import {
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import React from "react";
import { Text } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const QuizBank = ({ navigation }) => {
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [quiz, setQuiz] = useState([]);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");
  const [schedule, setSchedule] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selected, setSelected] = useState("");
  const [scheduledQuizzes, setScheduledQuizzes] = useState([]);
  const [runUseEffect, setRunUseEffect] = useState(true);
  const [quizdName, setQuizdName] = useState("");

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const CancelSchedule = async (element) => {
    await firestore()
      .collection("users")
      .doc(quizGroupName)
      .update({
        [`${quizGroupNameRaw}.scheduledQuiz`]:
          firestore.FieldValue.arrayRemove(element),
      })
      .then(setRunUseEffect(!runUseEffect));
  };

  const SubmitSchedule = async () => {
    if (selected && schedule) {
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.scheduledQuiz`]:
            firestore.FieldValue.arrayUnion({
              author: dbUser.email,
              scheduledQuizId: Math.random().toString(36).substring(2, 12),
              quizId: selected,
              schedule: schedule,
              quizName: quizdName,
            }),
        })
        .then(() => {
          setSchedule("");
          setScheduleDate("");
          setScheduleTime("");
          setSelected("");
          setRunUseEffect(!runUseEffect);
        })
        .catch((e) => Alert.alert(e.message));
    }
  };

  const ScheduleTime = (arg) => {
    const dateTime = new Date(arg);
    // console.log(arg)
    setSchedule(dateTime);
    setShow(false);
    const fDate = dateTime.toDateString(); //dateTime.getDate() + '-' + dateTime.getMonth() + '-' + dateTime.getFullYear()
    const fTime = dateTime.toLocaleTimeString(); //dateTime.getHours() + ':' + dateTime.getMinutes() + ':' + dateTime.getSeconds()
    setScheduleDate(fDate);
    setScheduleTime(fTime);
  };

  const showMode = (arg) => {
    setShow(true);
    setMode(arg);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      (async () => {
        const data = await firestore()
          .collection("users")
          .doc(quizGroupName)
          .get(); //await getDoc(docRef)//.data()//.questionBank
        setQuiz(data.data()[quizGroupNameRaw].quizBank);
      })();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const data = await firestore()
        .collection("users")
        .doc(quizGroupName)
        .get();
      setScheduledQuizzes(data.data()[quizGroupNameRaw].scheduledQuiz);
    })();
  }, [runUseEffect]);

  //  console.log(JSON.parse(quiz[0]).dateCreated  )

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <View style={{ borderWidth: 1, flexDirection: "row" }}>
                <View style={{ width: "50%" }}>
                  <Button
                    title="Create Quiz"
                    onPress={() => navigation.navigate("Choose Quiz Questions")}
                  />
                </View>
                <View style={{ width: "50%" }}>
                  <Button
                    title="Schedule Quiz"
                    onPress={() => {
                      SubmitSchedule();
                      setRunUseEffect(!runUseEffect);
                    }}
                    disabled={selected && schedule ? false : true}
                  />
                </View>
              </View>

              <View>
                <Text>Scheduled Date:{scheduleDate} </Text>
                <Text>Scheduled Time: {scheduleTime} </Text>
                <DateTimePickerModal
                  isVisible={show}
                  mode={mode}
                  onConfirm={ScheduleTime}
                  onCancel={() => setShow(false)}
                />
                <View style={{ borderWidth: 1, flexDirection: "row" }}>
                  <View style={{ width: "50%" }}>
                    <Button title="Set Date" onPress={() => showMode("date")} />
                  </View>
                  <View style={{ width: "50%" }}>
                    <Button title="Set Time" onPress={() => showMode("time")} />
                  </View>
                </View>
              </View>

              {/* <Text style={{fontSize: 20}}>You selected {selectedQuestionId.length} remaining {questions.length} questions</Text> */}
              <FlatList
                data={quiz}
                keyExtractor={(item) => JSON.parse(item)?.quizId}
                //  ListHeaderComponent={
                //   <View>
                //     <Text>Scheduled Date:{scheduleDate} </Text><Text>Scheduled Time: {scheduleTime} </Text>
                //       <DateTimePickerModal
                //   isVisible={show}
                //   mode={mode}
                //   onConfirm={ScheduleTime}
                //   onCancel={()=>setShow(false)}
                // />
                //     <View style={{borderWidth: 1, flexDirection:'row'}}>
                //         <View style={{width:'50%'}}>
                //         <Button title='Set Date' onPress={()=> showMode('date')}/>
                //         </View>
                //         <View style={{width:'50%'}}>
                //         <Button title='Set Time' onPress={()=> showMode('time')}/>
                //         </View>
                //    </View>
                //   </View>
                //    }

                renderItem={({ item }) => {
                  return (
                    <View
                      style={{
                        marginH: 2,
                        borderColor: "green",
                        borderWidth: 1,
                        padding: 5,
                        backgroundColor:
                          selected === JSON.parse(item)?.quizId
                            ? "green"
                            : "white",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setSelected(
                            selected === JSON.parse(item)?.quizId
                              ? ""
                              : JSON.parse(item)?.quizId
                          );
                          setQuizdName(JSON.parse(item).quizName);
                        }}
                      >
                        <Text variant="headlineMedium">
                          Quiz Tittle : {JSON.parse(item).quizName}
                        </Text>
                        <Text variant="headlineSmall">
                          Author: {JSON.parse(item).author}
                        </Text>
                        <Text variant="headlineSmall">
                          Number of Questions:{" "}
                          {JSON.parse(item).quizQuestions.length}
                        </Text>
                        <Text variant="headlineSmall">
                          NegFacMc: {JSON.parse(item).negFacMc}
                        </Text>
                        <Text variant="headlineSmall">
                          negFacSba: {JSON.parse(item).negFacSba}
                        </Text>
                        <Text variant="headlineSmall">
                          Time Allowed:{" "}
                          {JSON.parse(item).timeAllowedHr
                            ? JSON.parse(item).timeAllowedHr
                            : 0}
                          hour(s){}
                          {JSON.parse(item).timeAllowedMin}Minutes
                        </Text>

                        {scheduledQuizzes.map((element) => {
                          if (element?.quizId === JSON.parse(item)?.quizId) {
                            const quizSchedulet = new Date(
                              element.schedule.nanoseconds / 1000 +
                                element.schedule.seconds * 1000
                            );
                            const quizSchedule = quizSchedulet.toLocaleString();
                            return (
                              <View
                                style={{ borderWidth: 1, flexDirection: "row" }}
                                key={element.scheduledQuizId}
                              >
                                <View style={{ width: "70%" }}>
                                  <Text variant="headlineSmall">
                                    Schedule:{quizSchedule}{" "}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: "30%",
                                    backgroundColor: "red",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <Button
                                    title="Cancel Schedule"
                                    onPress={() => {
                                      CancelSchedule(element);
                                    }}
                                  />
                                </View>
                              </View>
                            );
                          }
                        })}
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default QuizBank;

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
