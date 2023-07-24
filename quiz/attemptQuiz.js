import {
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
  BackHandler,
  ScrollView,
} from "react-native";
import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Text, RadioButton } from "react-native-paper";
import { Ionicons, Entypo } from "@expo/vector-icons";
import {
  useFocusEffect,
  CommonActions,
  useIsFocused,
  useNavigationState,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import firestore from "@react-native-firebase/firestore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useScrollToTop } from "@react-navigation/native";

import { useSelector } from "react-redux";
import { Button } from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";

const AttemptQuiz = ({ navigation, route }) => {
  const { quizId, quizName } = route?.params;

  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [quizIds, setQuizIds] = useState(quizIds);
  const [quixId, setQuixId] = useState("");
  const [quixName, setQuixName] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [response, setResponse] = useState([]);
  const [hour, setHour] = useState(quiz !== [] ? quiz.timeAllowedHr : 0);
  const [minute, setMinute] = useState(quiz !== [] ? quiz.timeAllowedMin : 0);
  const [second, setSecond] = useState(0);
  const [timer, setTimer] = useState(1);
  const [clock, setClock] = useState("");
  const isMounted = useRef(false);
  const [questionCoordinate, setQuestionCoordinate] = useState([]);
  const [ref, setRef] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [validateResponse, setValidateResponse] = useState(false);
  const [dataSourceCords, setDataSourceCords] = useState([]);
  let focused = useIsFocused();
  const yPosition = scrollIndex * 50;
  const scrollYRef = useRef(0);

  const navigationHideDrawer = useNavigation();

  // const focusedRoute= useRoute()
  // console.log(focusedRoute.name)
  useFocusEffect(
    useCallback(() => {
      // Hide the drawer icon when the screen gains focus

      navigationHideDrawer.setOptions({
        headerLeft: () => null, // Remove the default drawer icon
        headerRight: () => null,
      });
    }, [])
  );

  const navigationState = useNavigationState((state) => state);
  const currentScreen = navigationState?.routes[navigationState?.index]?.name;

  // setCurrentScreen(currentScreen)

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

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const assess = async () => {
    let correctSba = attemptedSba.filter((res) => res.is_correct === "True");
    correctSba = correctSba.length;
    let negSba = attemptedSba.length - correctSba;
    let negFacSba = isNaN(parseFloat(quiz.negFacSba))
      ? 0
      : parseFloat(quiz.negFacSba);
    negSba = negSba * negFacSba;
    let sbaScore = correctSba - negSba;
    // setRightSba(correctSba)
    //let attemptedMcqOptions = attemptedMcqQuestions.map((element)=>(element.answers))
    // let attemptedMcq =  attemptedMcqOptions.reduce((prev, curr)=> {return prev + curr}, 0)
    let correctMcq = attemptedMcq.filter(
      (res) =>
        (res.is_correct === "False" && res.choice === false) ||
        //(res.is_correct ===undefined && res.choice===false) ||
        (res.is_correct === "" && res.choice === false) ||
        (res.is_correct === "True" && res.choice === true)
    );
    correctMcq = correctMcq.length;
    let negFacMc = isNaN(parseFloat(quiz.negFacMc))
      ? 0
      : parseFloat(quiz.negFacMc);
    let negMcq = attemptedMcq.length - correctMcq;
    negMcq = negMcq * negFacMc;
    let mcqScore = correctMcq - negMcq;
    let totalScore = mcqScore + sbaScore;
    let scoreTotal = totalScore / totalQuestions;
    scoreTotal = scoreTotal * 100;

    const attemptedQuiz = {
      dateCreated: new Date(),
      quizId: Math.random().toString(36).substring(2, 12),
      attemptedQuizId: Math.random().toString(36).substring(2, 12),
      quizName: quizName,
      quizId: quizId,
      candidate: dbUser.email,
      candidateId: dbUser.userId,
      response: response,
      attemptedSBA: attemptedSba.length,
      correctSBA: correctSba,
      totalSBA: totalSba || 0,
      negFacSBA: quiz.negFacSba || 0,
      attemptedMCQ: attemptedMcq.length,
      correctMCQ: correctMcq,
      totalMCQ: totalMcq,
      negFacMCQ: quiz.negFacMc || 0,
      score: scoreTotal || 0 + "%",
      remainingTime: timer,
    };

    setValidateResponse(true);

    await firestore()
      .collection("users")
      .doc(quizGroupName)
      .update({
        [`${quizGroupNameRaw}.attemptedQuiz`]:
          firestore.FieldValue.arrayUnion(attemptedQuiz),
      });

    // Updates.reloadAsync()

    navigation.navigate("ProfileStack", { screen: "Profile" });
  };

  const onSubmit = () => {
    const validButtons = [
      { text: "Don't Submit", style: "cancel", onPress: () => {} },
      {
        text: "Submit",
        style: "destructive",
        // If the user confirmed, then we dispatch the action we blocked earlier
        // This will continue the action that had triggered the removal of the screen
        onPress: () => assess(),
      },
    ];

    Alert.alert(
      "You are about to submit",
      "Are you sure you want to submit?",
      validButtons.map((buttonText) => ({
        text: buttonText.text,
        onPress: buttonText.onPress,
      }))
    );
  };

  const timeUp = () => {
    alert("Time up");
    assess();
    navigation.navigate("ProfileStack", { screen: "Profile" });
  };

  // setTimeout(() => {
  //    alert('Time up');
  //   assess() ;
  //   navigation.navigate('ProfileStack', {screen: 'Profile'})
  // }, timer);

  useEffect(() => {
    let timeout = setTimeout(() => {
      timer > 0 && setTimer(timer - 1);
      let hr = Math.floor(timer / 3600);
      let min = Math.floor((timer % 3600) / 60);
      let sec = Math.floor((timer % 3600) % 60);
      setClock(
        `${hr < 0 ? 0 : hr}hr : ${min > 0 ? min : 0}min : ${sec > 0 ? sec : 0}s`
      );
      if (timer === 0) {
        timeUp();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [timer]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
      break;
    }
    return array;
  };

  useEffect(() => {
    const CallBackAndroid = (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      // assess();
      onSubmit();
      //    setQuixId()
      //  setQuixName(AsyncStorage.getItem('quixName'))

      // Prompt the user before leaving the screen
      // Alert.alert(
      //   "You are about to Submit Quiz",
      //   "Are you sure you want to submit?",
      //   [
      //     {
      //       text: "Don't submit",
      //       style: "cancel",
      //       onPress: () => {
      //         navigation.navigate("StackAttemptQuiz", {
      //           screen: "Attempt Quiz",
      //           params: { quizId: quizId, quizName: quizName },
      //         });
      //       },
      //     },
      //     {
      //       text: "Submit",
      //       style: "destructive",
      //       // If the user confirmed, then we dispatch the action we blocked earlier
      //       // This will continue the action that had triggered the removal of the screen
      //       onPress: () => {
      //         (async () => {
      //           const quixIds = await AsyncStorage.getItem("quixId");
      //           // console.log(quixIds)
      //           assess();
      //           navigation.dispatch(e.data.action);
      //         })();
      //       },
      //     },
      //   ]
      // );
    };

    // if(Platform.OS === 'android'){
    navigation.addListener("beforeRemove", CallBackAndroid);
    //}

    //  if(Platform.OS === 'ios'){BackHandler.addEventListener('hardwareBackPress', CallBack )}
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const data = await firestore()
          .collection("users")
          .doc(quizGroupName)
          .get();
        //const quizId = data.data().scheduledQuiz[6].quizId
        const quix = data.data()[quizGroupNameRaw].quizBank;

        // const quiz = JSON.parse(quix[0])
        let quex = quix.filter(
          (element) => JSON.parse(element).quizId === quizId
        );
        quex = JSON.parse(quex);
        //   randomize(quex)

        let hr = isNaN(quex.timeAllowedHr) ? 0 : Number(quex.timeAllowedHr);
        let min = isNaN(quex.timeAllowedMin) ? 0 : Number(quex.timeAllowedMin);
        let timers = hr * 60 * 60 + min * 60;

        setTimer(timers);
        setResponse([]);
        setQuiz(shuffleArray(quex));
        setMinute(quex.timeAllowedMin);
        setHour(quex.timeAllowedHr);
        setValidateResponse(false);

        await AsyncStorage.setItem("quixId", shuffleArray(quex).quizId);
        await AsyncStorage.setItem("quixName", shuffleArray(quex).quizName);
      })();
    }, [route.params.quizId])
  );

  const handleScroll = () => {
    for (let i = scrollIndex; i < quiz.quizQuestions.length; i++) {
      let element = quiz.quizQuestions[i];

      if (
        response.some(
          (items) =>
            (element.questionType === "Single Best Answer" &&
              items.questionId === element.questionId) ||
            (element.questionType === "Multiple Choice" &&
              element.answers.length ===
                response.filter((ele) => element.questionId === ele.questionId)
                  .length)
        )
      ) {
        let index = quiz.quizQuestions.findIndex(
          (item) => item.questionId === element.questionId
        );
        if (scrollIndex < quiz.quizQuestions.length - 1) {
          setScrollIndex(index + 1);
          ref.scrollTo({
            x: 0,
            y: dataSourceCords[index + 1],
            animated: true,
          });
        } else {
          setScrollIndex(0);
        }
      } else {
        let index = quiz.quizQuestions.findIndex(
          (item) => item.questionId === element.questionId
        );
        if (element.questionType === "Single Best Answer") {
          ref.scrollTo({
            x: 0,
            y: questionCoordinate[index + 1],
            animated: true,
          });
          if (index < quiz.quizQuestions.length - 1) {
            setScrollIndex(index + 1);
          } else {
            setScrollIndex(0);
          }

          break;
        } else {
          ref.scrollTo({
            x: 0,
            y: questionCoordinate[index + 1],
            animated: true,
          });
          if (index < quiz.quizQuestions.length - 1 && scrollIndex === index) {
            setScrollIndex(index + 1);
          } else if (
            index === quiz.quizQuestions.length - 1 ||
            index > quiz.quizQuestions.length - 1
          ) {
            setScrollIndex(0);
          } else {
            setScrollIndex(index);
          }
          break;
        }
      }
    }
  };

  // useScrollToTop(
  //   useRef({
  //     scrollToTop: () => {
  //       if (ref.current) {
  //         ref.current.scrollTo({ y: yPosition });
  //       }
  //     },
  //   })
  // );

  // useEffect(() => {
  //   ref.scrollTo({ y: yPosition, animated: true });
  // }, [yPosition]);

  const topOptionBoxValue = useSharedValue(130);
  const topOptionBox = useAnimatedStyle(() => {
    return { height: topOptionBoxValue.value };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* <DynamicHeader animHeaderValue={scrollOffsetY} onSubmit={onSubmit} 
                    handleScroll={handleScroll}
                    attemptedQuestions={totalAttempted} 
                    totalQuestions={totalQuestions}
                    clock={clock}
                    negFacMc={quiz.negFacMc}
                    quizName={quiz.quizName}
                    
                    /> */}

      <View style={{ paddingBottom: 40, marginBottom: 2 }}>
        <Animated.View
          style={[
            {
              borderWidth: 1,
              width: "100%",
              flexDirection: "row",
              flexWrap: "wrap",
            },
            topOptionBox,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.2}
            onPress={handleScroll}
            style={[
              styles.touchableOpacityStyle,
              { width: "68%", borderRadius: 10, margin: 1 },
            ]}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 20, textAlign: "center" }}
            >
              Scroll to unanswered Question
            </Text>
            {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.2}
            onPress={onSubmit}
            style={[
              styles.touchableOpacityStyle,
              { width: "30%", borderRadius: 10, margin: 1, padding: 2 },
            ]}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>Submit</Text>
            {/* <FontAwesome name="send" size={24} color="black"  style={styles.floatingButtonStyle} /> */}
          </TouchableOpacity>

          <View style={{ width: "100%" }}>
            <Text variant="headlineMedium">
              Attempted {totalAttempted ? totalAttempted : 0} of{" "}
              {totalQuestions ? totalQuestions : 0} questions
            </Text>
          </View>
        </Animated.View>
        <View style={{ width: "100%" }}>
          <Text variant="headlineMedium">Time left: {clock} </Text>
        </View>
        {/* <ScrollView
          ref={(ref) => {
            setRef(ref);
          }}
          onScroll={(event) => {
            // 0 means the top of the screen, 100 would be scrolled 100px down
            const currentYPosition = event.nativeEvent.contentOffset.y;
            const oldPosition = scrollYRef.current;

            if (oldPosition < currentYPosition) {
              // we scrolled down
              topOptionBoxValue.value = 0;
            } else {
              // we scrolled up
              topOptionBoxValue.value = 130;
            }
            // save the current position for the next onScroll event
            scrollYRef.current = currentYPosition;
          }} 
        > */}
        <Animated.ScrollView
          style={{ paddingBottom: 40, marginBottom: 2 }}
          ref={(ref) => setRef(ref)}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
            { useNativeDriver: false }
          )}
        >
          <GestureRecognizer
            onSwipeDown={(state) => {
              topOptionBoxValue.value = "auto";
            }}
            onSwipeUp={(state) => {
              topOptionBoxValue.value = 0;
            }}
          >
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
                      onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        questionCoordinate[index] = layout.y;
                        setQuestionCoordinate(questionCoordinate);
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
                                                resp.questionId !==
                                                  questionId &&
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
                                        (element) =>
                                          element.answerId === answerId
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
                                          backgroundColor: validateResponse
                                            ? response.some(
                                                (element) =>
                                                  element.answerId ===
                                                    answerId &&
                                                  element.is_correct !== "True"
                                              ) && "green"
                                            : response.some(
                                                (element) =>
                                                  element.answerId === answerId
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
                                                element.choice ===
                                                  newValue.choice
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
                                                element.choice !==
                                                  newValue.choice
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
                                            setResponse([
                                              ...response,
                                              newValue,
                                            ]);
                                          } else {
                                            //console.log('false')
                                            // console.log([...response, newValue])
                                            setResponse([
                                              ...response,
                                              newValue,
                                            ]);
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
                                              element.questionId ===
                                                questionId &&
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

                                          is_correct === "True" && ( //choice===true &&
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
                                              backgroundColor: validateResponse
                                                ? is_correct === "True" &&
                                                  choice === true
                                                  ? "red"
                                                  : "white"
                                                : response.some(
                                                    (element) =>
                                                      element.answerId ===
                                                        answerId &&
                                                      element.choice
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
                                              element.questionId ===
                                                questionId &&
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

                                          is_correct === "True" && ( //choice===false &&
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
                                              backgroundColor: validateResponse
                                                ? is_correct != "True" &&
                                                  choice === false
                                                  ? "red"
                                                  : "white"
                                                : response.some(
                                                    (element) =>
                                                      element.answerId ===
                                                        answerId &&
                                                      !element.choice
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
                    </View>
                  );
                }
              )}
          </GestureRecognizer>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AttemptQuiz;

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
    borderWidth: 2,
    width: 180,
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
