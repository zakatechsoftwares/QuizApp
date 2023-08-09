import {
  Button,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { Text } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { FlashList } from "@shopify/flash-list";

const QuestionBank = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [questionDeleted, setQuestionDeleted] = useState(false);
  const [runQuestionBankUseEffect, setRunQuestionBankUseEffect] =
    useState(false);

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
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
      .onSnapshot((datas) => {
        if (dbUser.groupMembership[0].cadre === "Examiner") {
          let data = datas
            ?.data()
            [quizGroupNameRaw].questionBank.filter(
              (element) => element.author === dbUser.email
            );

          setQuestions(data);
          setLoading(false);
        } else {
          let data = datas?.data()[quizGroupNameRaw].questionBank;
          setQuestions(data);
          setLoading(false);
        }
        // const users = [];

        // querySnapshot.forEach((documentSnapshot) => {
        //   users.push({
        //     ...documentSnapshot.data(),
        //     key: documentSnapshot.id,
        //   });
        // });
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     (async () => {
  //       // const docRef = doc(db, 'users', 'Questions')
  //       let datas = await firestore()
  //         .collection("users")
  //         .doc(quizGroupName)
  //         .get();

  //       //setQuestions(datas?.data()[quizGroupNameRaw].questionBank)
  //       if (dbUser.groupMembership[0].cadre === "Examiner") {
  //         let data = datas
  //           ?.data()
  //           [quizGroupNameRaw].questionBank.filter(
  //             (element) => element.author === dbUser.email
  //           );

  //         setQuestions(data);
  //       } else {
  //         let data = datas?.data()[quizGroupNameRaw].questionBank;
  //         setQuestions(data);
  //       }
  //     })();

  //     // do something
  //   });

  //   return unsubscribe;
  // }, [navigation]);

  const resolveDispute = async (questionId) => {
    const question = questions.filter(
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
          const newQuestionBank = questions.map((element) => {
            if (element.questionId === questionId) {
              element["disputes"] = [];
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
            .then(setRunQuestionBankUseEffect(!runQuestionBankUseEffect));
        })()
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Button
              color="green"
              title="Create New Question"
              onPress={() =>
                navigation.navigate("Create Question", { item: null })
              }
            />
            <FlashList
              estimatedItemSize={200}
              data={questions}
              keyExtractor={(item) => item.questionId}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      marginH: 2,
                      borderColor: "green",
                      borderWidth: 1,
                      padding: 5,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        item.author === dbUser.email &&
                        navigation.navigate("Edit Question", {
                          item: item,
                          questions: questions,
                        })
                      }
                    >
                      <Text variant="headlineMedium">
                        Title: {item.subject}
                      </Text>
                      <Text variant="headlineSmall">
                        Author email: {item.author}
                      </Text>
                      {/* <Text variant="headlineSmall">{item.questionId}</Text> */}

                      <Text variant="headlineSmall">
                        Question Type: {item.questionType}
                      </Text>

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
                        Answer Explained: {item.answerExplanation}
                      </Text>
                      {item.disputes?.map((element, i) => {
                        return (
                          <View key={element.disputeDate}>
                            <Text variant="titleSmall" style={{ color: "red" }}>
                              Dispute {i + 1} created by {element.author} :{" "}
                              {element.dispute}
                            </Text>
                          </View>
                        );
                      })}
                      {item.disputes?.length > 0 && (
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
                            onPress={() => resolveDispute(item.questionId)}
                          >
                            <Text
                              style={{
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              <Text>Resolve Dispute</Text>
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QuestionBank;

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
