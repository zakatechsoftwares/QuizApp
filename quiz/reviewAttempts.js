import {
  StyleSheet,
  View,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import { Text, RadioButton } from "react-native-paper";
import { Ionicons, Entypo } from "@expo/vector-icons";
import {
  useFocusEffect,
  CommonActions,
  useIsFocused,
} from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";

const ReviewAttempts = ({ navigation, route }) => {
  const { quizId, attemptedQuizId } = route.params;
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [quizIds, setQuizIds] = useState(quizIds);
  const [quiz, setQuiz] = useState([]);
  const [response, setResponse] = useState([]);
  const [hour, setHour] = useState(quiz !== [] ? quiz.timeAllowedHr : 0);
  const [minute, setMinute] = useState(quiz !== [] ? quiz.timeAllowedMin : 0);
  const [second, setSecond] = useState(0);
  const [timer, setTimer] = useState(0);
  const [clock, setClock] = useState("");
  const isMounted = useRef(false);
  const [questionCoordinate, setQuestionCoordinate] = useState([]);
  const [ref, setRef] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [validateResponse, setValidateResponse] = useState(true);
  let focused = useIsFocused();
  const [dispute, setDispute] = useState("");
  const [showDispute, setShowDispute] = useState(false);
  let [questionBank, setQuestionBank] = useState([]);

  //   const alterParams=()=>  {
  //     focused || setQuizIds(quizId)
  //   }
  // alterParams()

  const totalSba = (
    Array.isArray(quiz.quizQuestions) &&
    quiz.quizQuestions.filter((sB) => sB.questionType === "Single Best Answer")
  ).length;
  const allMc =
    Array.isArray(quiz.quizQuestions) &&
    quiz.quizQuestions.filter((mC) => mC.questionType === "Multiple Choice");
  let allMcq =
    Array.isArray(allMc) && allMc.map((element) => element.answers.length);
  let totalMcq =
    Array.isArray(allMcq) &&
    allMcq.reduce((prev, curr) => {
      return prev + curr;
    }, 0);
  let attemptedSba = response.filter(
    (res) => res.questionType === "Single Best Answer"
  );
  let attemptedMcq = response.filter(
    (res) => res.questionType === "Multiple Choice"
  );
  let totalQuestions = totalMcq + totalSba;
  let totalAttempted = attemptedMcq.length + attemptedSba.length;

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

  const submitDispute = async (questionId) => {
    const question = questionBank.filter(
      (element) => element.questionId === questionId
    )[0];
    await firestore()
      .collection("users")
      .doc(quizGroupName)
      .update({
        [`${quizGroupNameRaw}.questionBank`]:
          firestore.FieldValue.arrayRemove(question),
      })
      .then(
        (async () => {
          const newQuestionBank = questionBank.map((element) => {
            if (element.questionId === questionId) {
              element["disputes"] = Array.isArray(element["disputes"])
                ? [
                    ...element["disputes"],
                    {
                      disputeDate: Date.now(),
                      author: dbUser.email,
                      dispute: dispute,
                    },
                  ]
                : [
                    {
                      disputeDate: Date.now(),
                      author: dbUser.email,
                      dispute: dispute,
                    },
                  ];
              return element;
            } else {
              return element;
            }
          });
          // console.log(questionBank.filter(element=>element.questionId===questionId)[0])
          const newQuestion = newQuestionBank.filter(
            (element) => element.questionId === questionId
          )[0];
          await firestore()
            .collection("users")
            .doc(quizGroupName)
            .update({
              [`${quizGroupNameRaw}.questionBank`]:
                firestore.FieldValue.arrayUnion(newQuestion),
            })
            .then(
              setDispute("") &&
                setShowDispute(false) &&
                Alert.alert("Dispute sent")
            );
        })()
      );
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await firestore()
          .collection("users")
          .doc(quizGroupName)
          .get();
        //const quizId = data.data().scheduledQuiz[6].quizId
        const quix = data.data()[quizGroupNameRaw].quizBank;
        const attemptedQuizzes = data.data()[quizGroupNameRaw].attemptedQuiz;
        // const quiz = JSON.parse(quix[0])
        let attemptedQuiz = attemptedQuizzes.filter(
          (element) => element.attemptedQuizId === attemptedQuizId
        );
        setResponse(attemptedQuiz[0].response);
        let quex = quix.filter(
          (element) => JSON.parse(element).quizId === quizId
        );
        quex = JSON.parse(quex);
        setQuiz(quex);

        let quest = data.data()[quizGroupNameRaw].questionBank;
        setQuestionBank(quest);
      })();
    }, [route.params.quizId])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ paddingBottom: 40, marginBottom: 2 }}
        ref={(ref) => setRef(ref)}
        //   scrollEventThrottle={16}
        //   onScroll={Animated.event(
        //     [{ nativeEvent: { contentOffset: { y: scrollOffsetY}}}],
        //     {useNativeDriver: false}
        //   )}
      >
        <View style={styles.inner}>
          {Array.isArray(quiz.quizQuestions) &&
            //  shuffleArray
            quiz.quizQuestions.map(
              (
                {
                  questionId,
                  questionType,
                  question,
                  answers,
                  imageDownloadURL,
                  answerExplanation,
                },
                index
              ) => {
                return (
                  <View
                    key={questionId}
                    style={{
                      borderTopWidth: 1,
                      borderBottomWidth: 0.5,
                      padding: 20,
                    }}
                  >
                    {imageDownloadURL && (
                      <Image
                        style={styles.stretch}
                        source={{ uri: imageDownloadURL }}
                      />
                    )}
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Text variant="headlineSmall" fontSize="bold">
                        {(index += 1)}.
                      </Text>

                      <Text variant="headlineSmall">{question}</Text>
                    </View>

                    <View>
                      {questionType === "Single Best Answer" && //shuffleArray
                        answers.map(({ answer, is_correct, answerId }, i) => {
                          return (
                            <View key={answerId}>
                              <RadioButton.Group
                                onValueChange={(newValue) => {
                                  if (validateResponse === false) {
                                    response.some(
                                      (element) =>
                                        element.answerId === answerId &&
                                        element.questionId === questionId
                                    )
                                      ? setResponse((response) =>
                                          response.filter(
                                            (resp) =>
                                              resp.questionId !== questionId &&
                                              resp.answerId !== answerId
                                          )
                                        )
                                      : setResponse((response) => [
                                          ...response.filter(
                                            (resp) =>
                                              resp.questionId !== questionId
                                          ),
                                          newValue,
                                        ]);
                                  }
                                }}
                                value={response}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: 5,
                                  }}
                                >
                                  {validateResponse &&
                                    response.some(
                                      (element) =>
                                        element.answerId === answerId &&
                                        element.is_correct === "True"
                                    ) && (
                                      <Ionicons
                                        name="checkmark"
                                        size={24}
                                        color="green"
                                      />
                                    )}
                                  {validateResponse &&
                                    is_correct === "True" &&
                                    !response.some(
                                      (element) => element.answerId === answerId
                                    ) && (
                                      <Entypo
                                        name="cross"
                                        size={24}
                                        color="red"
                                      />
                                    )}
                                  <View
                                    style={[
                                      styles.RadioButton,
                                      {
                                        backgroundColor: response.some(
                                          (element) =>
                                            element.answerId === answerId &&
                                            element.is_correct === "True"
                                        )
                                          ? "black"
                                          : "white",
                                        width: 25,
                                        justifyContent: "center",
                                        alignItems: "center",
                                      },
                                    ]}
                                  >
                                    <RadioButton
                                      value={{
                                        questionType: questionType,
                                        questionId: questionId,
                                        question: question,
                                        answerId: answerId,
                                        answer: answer,
                                        is_correct: is_correct,
                                      }}

                                      //    onChange = {()=> setResponse(response=>[...response.filter((resp)=>(resp.questionId !== questionId)),
                                      //     {questionType: questionType, questionId: questionId, index: index, question : question, answer : answer, is_correct : is_correct}])}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      width: "95%",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Text variant="headlineSmall">
                                      {answer}
                                    </Text>
                                  </View>
                                </View>
                              </RadioButton.Group>
                            </View>
                          );
                        })}
                    </View>
                    <View>
                      {questionType === "Multiple Choice" &&
                        //shuffleArray
                        answers.map(
                          ({ answerId, answer, is_correct, choice }, i) => {
                            return (
                              <View key={answerId}>
                                <RadioButton.Group
                                  onValueChange={
                                    (newValue) => {
                                      if (validateResponse === false) {
                                        if (
                                          response.some(
                                            (element) =>
                                              element.answerId ===
                                                newValue.answerId &&
                                              element.questionId ===
                                                newValue.questionId &&
                                              element.choice === newValue.choice
                                          )
                                        ) {
                                          const rem = response.filter(
                                            (item) =>
                                              item.questionId !==
                                                newValue.questionId ||
                                              (item.questionId ===
                                                newValue.questionId &&
                                                item.answerId !==
                                                  newValue.answerId)
                                          );
                                          // const rem = response.splice(response.findIndex(element=>element.answerId===newValue.answerId),1)
                                          //console.log(response)
                                          // console.log('true')
                                          setResponse(rem);
                                        } else if (
                                          response.some(
                                            (element) =>
                                              element.answerId ===
                                                newValue.answerId &&
                                              element.questionId ===
                                                newValue.questionId &&
                                              element.choice !== newValue.choice
                                          )
                                        ) {
                                          response.splice(
                                            response.findIndex(
                                              (element) =>
                                                element.answerId ===
                                                newValue.answerId
                                            ),
                                            1
                                          );
                                          setResponse([...response, newValue]);
                                        } else {
                                          //console.log('false')
                                          // console.log([...response, newValue])
                                          setResponse([...response, newValue]);
                                        }
                                      }
                                    }
                                    //setResponse(response=>[...response.filter((resp)=>(resp.questionId !== questionId || resp.answerId!==answerId)),newValue])
                                  }
                                  value={response}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      margin: 5,
                                    }}
                                  >
                                    <View
                                      style={{
                                        width: "15%",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      {validateResponse &&
                                      response.some(
                                        (element) =>
                                          element.answerId === answerId &&
                                          element.is_correct === "True" &&
                                          element.choice === true
                                      ) ? (
                                        <Ionicons
                                          name="checkmark"
                                          size={24}
                                          color="green"
                                        />
                                      ) : validateResponse &&
                                        response.some(
                                          (element) =>
                                            element.answerId === answerId &&
                                            element.questionId === questionId &&
                                            element.choice === true &&
                                            element.is_correct != "True"
                                        ) ? (
                                        <Entypo
                                          name="cross"
                                          size={24}
                                          color="red"
                                        />
                                      ) : (
                                        validateResponse &&
                                        //(choice===true &&
                                        // response.some(element=>element.answerId!=answerId)

                                        is_correct === "True" &&
                                        response.filter(
                                          (element) =>
                                            element.answerId === answerId
                                        ).length === 0 && ( //choice===true &&
                                          // !response.some(element=>element.answerId===answerId) &&
                                          <Entypo
                                            name="cross"
                                            size={24}
                                            color="red"
                                          />
                                        )
                                      )}

                                      {/* //) 
                  //  && // || is_correct==='False' || '' && choice !==false )
                     (is_correct==='False' || '' && choice ===false) || (is_correct==='True' && choice ===true)                     
                      &&
                <Entypo name="cross" size={24} color="red" /> 
   */}

                                      <View
                                        style={[
                                          styles.RadioButton,
                                          {
                                            backgroundColor: response.some(
                                              (element) =>
                                                element.answerId === answerId &&
                                                element.choice === true
                                            )
                                              ? "black"
                                              : "white",
                                            width: 25,
                                            justifyContent: "center",
                                            alignItems: "center",
                                          },
                                        ]}
                                      >
                                        <RadioButton
                                          value={{
                                            questionType: questionType,
                                            questionId: questionId,
                                            question: question,
                                            answerId: answerId,
                                            answer: answer,
                                            is_correct: is_correct,
                                            choice: true,
                                          }}
                                        />
                                      </View>

                                      <Text variant="headlineSmall">T</Text>
                                    </View>
                                    <View
                                      style={{
                                        width: "15%",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      {validateResponse &&
                                      response.some(
                                        (element) =>
                                          element.answerId === answerId &&
                                          element.choice === false &&
                                          (element.is_correct === "False" ||
                                            element.is_correct === "")
                                      ) ? (
                                        <Ionicons
                                          name="checkmark"
                                          size={24}
                                          color="green"
                                        />
                                      ) : validateResponse &&
                                        response.some(
                                          (element) =>
                                            element.answerId === answerId &&
                                            element.questionId === questionId &&
                                            element.choice === false &&
                                            element.is_correct === "True"
                                        ) ? (
                                        <Entypo
                                          name="cross"
                                          size={24}
                                          color="red"
                                        />
                                      ) : (
                                        validateResponse && //&&
                                        // (choice===false &&
                                        //  response.some(element=>element.answerId!=answerId)

                                        //)

                                        (is_correct === "False" ||
                                          is_correct === "") &&
                                        response.filter(
                                          (element) =>
                                            element.answerId === answerId
                                        ).length === 0 && (
                                          //  !response.some(element=>element.answerId===answerId) &&
                                          <Entypo
                                            name="cross"
                                            size={24}
                                            color="red"
                                          />
                                        )
                                      )}

                                      <View
                                        style={[
                                          styles.RadioButton,
                                          {
                                            backgroundColor: response.some(
                                              (element) =>
                                                element.answerId === answerId &&
                                                element.choice === false
                                            )
                                              ? "black"
                                              : "white",
                                            width: 25,
                                            justifyContent: "center",
                                            alignItems: "center",
                                          },
                                        ]}
                                      >
                                        <RadioButton
                                          value={{
                                            questionType: questionType,
                                            questionId: questionId,
                                            question: question,
                                            answerId: answerId,
                                            answer: answer,
                                            is_correct: is_correct,
                                            choice: false,
                                          }}
                                        />
                                      </View>

                                      <Text variant="headlineSmall">F</Text>
                                    </View>

                                    <View style={{ width: "70%" }}>
                                      <Text variant="headlineSmall">
                                        {answer}
                                      </Text>
                                    </View>
                                  </View>
                                </RadioButton.Group>
                              </View>
                            );
                          }
                        )}
                    </View>

                    {validateResponse && (
                      <View>
                        <Text style={{ color: "green" }}>
                          Answer Explantion: {answerExplanation}
                        </Text>
                      </View>
                    )}

                    {showDispute && (
                      <TextInput
                        name="dispute"
                        value={dispute} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                        onChangeText={(text) => setDispute(text)}
                        //  onBlur={formik.handleBlur('answerExplanation')}
                        style={styles.input}
                        placeholder="Explain why you disagree with the answer"
                        multiline
                        textAlignVertical="top"
                      />
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-around",
                      }}
                    >
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
                            showDispute && dispute
                              ? submitDispute(questionId)
                              : showDispute && !dispute
                              ? Alert.alert("Enter dispute message")
                              : setShowDispute(true)
                          }
                        >
                          <Text
                            style={{ fontWeight: "bold", textAlign: "center" }}
                          >
                            {showDispute ? (
                              <Text>Send Dispute</Text>
                            ) : (
                              <Text>Dispute Answer</Text>
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {showDispute && (
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
                            onPress={() => setShowDispute(false)}
                          >
                            <Text
                              style={{
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              {showDispute && <Text>Cancel Dispute</Text>}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewAttempts;

const styles = StyleSheet.create({
  stretch: {
    width: "100%",
    height: 200,
    resizeMode: "stretch",
  },

  header: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: 20,
  },
  RadioButton: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    fontSize: 50,
    borderWidth: 2,
    maxWidth: "100%",
    margin: 4,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inner: {
    padding: 2,
    flex: 1,

    justifyContent: "flex-end",
    flexDirection: "column",
  },
  container: {
    flex: 1,

    alignItems: "center",
    padding: 1,

    margin: 1,
    //flexDirection: 'row',
    flexWrap: "wrap",
    borderWidth: 2,

    backgroundColor: "#ecf0f1",
  },
  checkbox: {
    margin: 8,
  },

  touchableOpacityStyle: {
    //position: 'absolute',
    width: 50,
    // height: 50,
    alignItems: "center",
    justifyContent: "center",
    //flexDirection:'row',
    backgroundColor: "green",
    padding: 0,
  },
  floatingButtonStyle: {
    resizeMode: "contain",
    width: 50,
    height: 50,
    //backgroundColor:'black'
  },
});
