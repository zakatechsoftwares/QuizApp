import {
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const ChooseQuizQuestion = ({ navigation, route }) => {
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState([]);
  const [runUseEffect, setRunUseEffect] = useState(true);
  const isMounted = useRef(false);
  const [show, setShow] = useState(true);

  const [quizName, setQuizName] = useState("");
  const [releaseResult, setReleaseResult] = useState();
  const [timeAllowedHr, setTimeAllowedHr] = useState();
  const [timeAllowedMin, setTimeAllowedMin] = useState();
  const [negFacMc, setNegFacMc] = useState("");
  const [negFacSba, setNegFacSba] = useState("");
  const [examinerInstructions, setExaminerInstructions] = useState("");

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  useEffect(() => {
    setSelectedQuestionId(selectedQuestionId);
    setQuestions(questions);
    setSelectedQuestions(selectedQuestions);
  }, [runUseEffect]);

  const SelectUnselect = (item) => {
    const questionIndex = questions.findIndex(
      (element) => element.questionId === item.questionId
    );

    let arr = selectedQuestionId;
    let index = arr.indexOf(item.questionId);

    if (arr.includes(item.questionId)) {
      arr.splice(index, 1);
      // console.log('arr'+ arr)
      setSelectedQuestionId(arr);
      selectedQuestions.splice(index, 1);
      //  console.log(selectedQuestions)
      setSelectedQuestions(selectedQuestions);
      // setQuestions([...questions, item])
      setRunUseEffect(!runUseEffect);
    } else {
      let accumulator = [];
      //let arr =  Object.values(selectedQuestionId)
      arr.push(item.questionId);
      setSelectedQuestionId(arr);
      selectedQuestions.push(item);
      setSelectedQuestions(
        selectedQuestions //(selectedQuestions)=>[...selectedQuestions, accumulator]
      );
      // questions.splice(questionIndex, 1)
      // setQuestions(questions)
      setRunUseEffect(!runUseEffect);
    }
  };

  function getDifference(array1, array2) {
    return array1.filter((object1) => {
      return !array2.some((object2) => {
        return object1._id === object2._id;
      });
    });
  }

  const SelectQuestion = () => {
    navigation.navigate("Create Quiz", { selectedQuestion: selectedQuestions });

    const difference = getDifference(selectedQuestions, questions);
    console.log(difference);
  };

  useEffect(() => {
    firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((data) => {
        setQuestions(data.data()[quizGroupNameRaw].questionBank);
      });
  }, []);

  const ReleaseResult = [
    { key: "1", value: "Immediately" },
    { key: "2", value: "Later" },
    { key: "3", value: "Send through email" },
  ];

  const submitQuiz = async () => {
    // console.log(firestore().Timestamp)

    if (
      quizName &&
      selectedQuestions &&
      (timeAllowedHr || timeAllowedMin) &&
      examinerInstructions
    ) {
      const date = Date.now().toString();
      let nanosec = date.nanoseconds + date.seconds * 1000000000;

      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.quizBank`]: firestore.FieldValue.arrayUnion(
            JSON.stringify({
              author: dbUser.email,
              dateCreated: new Date(),
              quizId: Math.random().toString(36).substring(2, 12),
              quizName: quizName,
              timeAllowedHr: timeAllowedHr,
              timeAllowedMin: timeAllowedMin,
              releaseResult: releaseResult,
              negFacMc: negFacMc,
              negFacSba: negFacSba,
              examinerInstructions: examinerInstructions,
              quizQuestions: selectedQuestions,
            })
          ),
        });

      navigation.navigate("Quiz Bank");
    } else {
      Alert.alert(
        "Required fields",
        `The following fields are mandatory:
      1. Quiz Title.
      2.At least one of the times fields.
      3.The instructions to the candidate
      4.At least one question should be selected`
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
          style={styles.container}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <Button
                title="Create the Quiz"
                onPress={() => submitQuiz()}
                // disabled={
                //   quizName &&
                //   selectedQuestions.length > 0 &&
                //   (timeAllowedHr || timeAllowedMin)
                //     ? false
                //     : true //navigation.navigate('Create Quiz', {selectedQuestions : selectedQuestions})
                // }
              />
              <Text style={{ fontSize: 20 }}>
                You selected {selectedQuestionId.length} of total{" "}
                {questions.length} questions
              </Text>
              <FlatList
                data={questions}
                keyExtractor={(item) => item.questionId}
                ListHeaderComponent={
                  <View //style={styles.container}
                  >
                    <TextInput
                      name="quizName"
                      onChangeText={setQuizName}
                      value={quizName}
                      style={styles.input}
                      placeholder="Quiz Title"
                      //  //  validate={prop.validatefield}
                    />
                    <TextInput
                      name="timeAllowedHr"
                      onChangeText={setTimeAllowedHr}
                      value={timeAllowedHr}
                      keyboardType="numeric"
                      style={styles.input}
                      placeholder="Hour(s) allowed"
                    />
                    <TextInput
                      name="timeAllowedMin"
                      onChangeText={setTimeAllowedMin}
                      value={timeAllowedMin}
                      keyboardType="numeric"
                      style={styles.input}
                      placeholder="Minutes Allowed"
                    />

                    <TextInput
                      name="negFacMc"
                      onChangeText={setNegFacMc}
                      value={negFacMc}
                      keyboardType="numeric"
                      style={styles.input}
                      placeholder="MCQ Neg factor for negative marking (if any)"
                      //defaultValue= '0'
                    />
                    <TextInput
                      name="negFacSba"
                      onChangeText={setNegFacSba}
                      value={negFacSba}
                      keyboardType="numeric"
                      style={styles.input}
                      placeholder="SBA Neg factor for negative marking(if any)"
                      // defaultValue='0'
                    />
                    <TextInput
                      name="examinerInstructions"
                      onChangeText={setExaminerInstructions}
                      value={examinerInstructions}
                      style={styles.input}
                      placeholder="Instructions to the candidate"
                      // defaultValue='0'
                    />
                    {/* <SelectList 
         data={ReleaseResult} 
         setSelected={(res)=>setReleaseResult(res)} 
         save='value' 
         placeholder='Release result'
         style={styles.input}
         /> */}

                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        textAlign: "center",
                      }}
                    >
                      Select Questions below
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  return (
                    <View
                      style={{
                        marginH: 2,
                        borderColor: "green",
                        borderWidth: 1,
                        padding: 5,
                        backgroundColor: selectedQuestionId.includes(
                          item.questionId
                        )
                          ? "green"
                          : "white",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          SelectUnselect(item);
                        }}
                      >
                        <Text variant="headlineMedium">{item.subject}</Text>
                        <Text variant="headlineSmall">{item.author}</Text>
                        {/* <Text variant="headlineSmall">{item.questionId}</Text> */}

                        <Text variant="headlineSmall">{item.questionType}</Text>

                        {item.imageDownloadURL && (
                          <Image
                            style={styles.stretch}
                            source={{ uri: item.imageDownloadURL }}
                          />
                        )}

                        <Text variant="titleLarge">{item.question}</Text>
                        {item.answers.map(
                          ({ answer, is_correct, answerId }, index) => {
                            return (
                              <View
                                key={answerId}
                                style={{
                                  flex: 1,
                                  flexDirection: "row",
                                  flexWrap: "nowrap",
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text variant="titleMedium">{answer}</Text>
                                </View>
                                <View>
                                  <Text variant="titleMedium">
                                    {is_correct === "True" ? "True" : "False"}
                                  </Text>
                                </View>
                              </View>
                            );
                          }
                        )}
                        <Text variant="titleSmall">
                          {item.answerExplanation}
                        </Text>
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

export default ChooseQuizQuestion;

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    width: "90%",
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
