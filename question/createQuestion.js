import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  SafeAreaView,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { FieldArray, Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import { SelectList } from "react-native-dropdown-select-list";
import UploadFiles from "../components/uploadFiles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import storage from "@react-native-firebase/storage";
import ModalSelector from "react-native-modal-selector";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";

const CreateQuestion = ({ navigation, route }) => {
  const { item } = route.params;
  const [newCategory, setNewCategory] = useState("");
  const [itemAnswers, setItemAnswers] = useState(item ? item.answers : []);
  const [itemAnswersLength, setItemAnswersLength] = useState();
  const [answersLength, setAnswersLength] = useState();
  const isMounted = useRef(false);
  const [sbaError, setSbaError] = useState(false);
  const [questionType, setQuestionType] = useState("");
  let questionCategory = useSelector((state) => state.user).questionCategory;
  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const addAnswer = (push) => {
    const answerIds = Math.random().toString(36).substring(2, 7);
    push({ answerId: answerIds, answer: "", is_correct: "" });
  };

  const addItemAnswer = (itemAnswers) => {
    const answerIds = Math.random().toString(36).substring(2, 7);
    itemAnswers.push({ answerId: answerIds, answer: "", is_correct: "" });
  };

  useEffect(() => {
    if (isMounted.current === true) {
      setItemAnswers(itemAnswers);
    } else {
      isMounted.current = !isMounted.current;
    }
  }, [itemAnswersLength]);

  let userEmail = useSelector((state) => state.user).userEmail;
  const trueOrFalse = ["True", "False"];

  const initialValue = {
    questionId: Math.random().toString(36).substring(2, 12),
    author: userEmail,

    subject: "",
    questionType: "",
    question: "",
    answers: [
      {
        answerId: Math.random().toString(36).substring(2, 7),
        answer: "",
        is_correct: "False",
        choice: "", //Add 'choice' to ease Marking Multiple Choice questions in attempte
      },
    ],
    imageCaption: "",
    imageDownloadURL: "",
    image: "",
    answerExplanation: "",
  };

  const [initialValues, setInitialValues] = useState(initialValue);

  const validationSchema = yup.object().shape({
    subject: yup.string().required("This field is required"),
    questionType: yup.string().required("This field is required"),
    question: yup.string().required("This field is required"),
    answerExplanation: yup.string().required("This field is required"),
    answers: yup
      .array()
      .of(
        yup.object().shape({
          answer: yup.string().required("This field is required"),
          is_correct: yup.boolean(),
        })
      )
      .min(3, "The number of options should be 3 to 5")
      .max(5, "The number of options should be 3 to 5"),
    // .test({
    //   name: "is_correct",
    //   //  exclusive: true,
    //   message: "Only one item must be marked as correct",
    //   test: function (value) {
    //     if (questionType === "Single Best Answer") {
    //       const correctCount = value?.answers?.filter(
    //         (item) => item.is_correct === "True"
    //       ).length;
    //       return false; //correctCount === 1;
    //     }
    //     return false; //true; // For other question types, this validation rule does not apply
    //   },
    // }),
  });

  const validate = (values) => {
    const count = values.answers.filter((answer) => {
      return answer.is_correct === "True";
    }).length;

    if (values.questionType === "Single Best Answer" && count != 1) {
      setSbaError(true);
    } else {
      setSbaError(false);
    }
  };

  // let subject = Array.from(Array(100).keys());
  // subject.shift();
  subject = Array.isArray(questionCategory)
    ? questionCategory.map((element) => ({
        key: element,
        value: element,
      }))
    : [{ key: "Not specified", value: "Not specified" }];

  const questionTypes = [
    { key: "Single Best Answer", value: "Single Best Answer" },
    { key: "Multiple Choice", value: "Multiple Choice" },
  ];

  const onSubmit = async (values) => {
    if (values.image) {
      const imageName = values.image.substring(
        values.image.lastIndexOf("/") + 1
      );
      const reference = storage().ref(`QuizImages/${imageName}`);

      const result = await reference.putFile(values.image);
      const url = await storage()
        .ref(`QuizImages/${imageName}`)
        .getDownloadURL();

      values.imageDownloadURL = url;
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.questionBank`]:
            firestore.FieldValue.arrayUnion(values),
        })
        .then((values = initialValues));
    } else {
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.questionBank`]:
            firestore.FieldValue.arrayUnion(values),
        })
        .then((values = initialValues));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        style={{ paddingBottom: 40, marginBottom: 2, width: "100%" }}
      >
        <View style={styles.inner}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            validate={(values) => validate(values)}
            onSubmit={(values, actions) => {
              onSubmit(values).then(() => {
                navigation.goBack();
                actions.setSubmitting(false);
              });
              actions.resetForm({
                values: initialValue,
              });
            }}
          >
            {(formik) => {
              return (
                <View>
                  <TextInput
                    name="author"
                    value={userEmail} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                    onChangeText={formik.handleChange("author")}
                    style={styles.input}
                    editable={false}
                  />
                  <View style={{ flexDirection: "row", paddingEnd: 10 }}>
                    <View>
                      <SelectList
                        data={subject}
                        setSelected={(option) =>
                          formik.setFieldValue("subject", option)
                        }
                        save="value"
                        placeholder="Question category"
                        search={false}
                        style={[styles.input, { width: "68%" }]}
                      />
                      <Text style={{ color: "red" }}>
                        <ErrorMessage name="subject" />
                      </Text>
                    </View>
                    <TextInput
                      onChangeText={setNewCategory}
                      value={newCategory}
                      style={[
                        {
                          width: "68%",
                          borderWidth: 0.5,
                          // width: "100%",
                          marginHorizontal: 2,
                          marginVertical: 6,
                          paddingHorizontal: 2,
                          fontSize: 16,
                        },
                      ]}
                      placeholder="Add Category"
                      //  //  validate={prop.validatefield}
                    />
                    <Button
                      color="green"
                      height={10}
                      width={10}
                      title="Add"
                      onPress={() => {}}
                    />
                  </View>

                  <SelectList
                    data={questionTypes}
                    setSelected={(option) => {
                      formik.setFieldValue("questionType", option);
                      setQuestionType(option);
                    }}
                    save="value"
                    placeholder="SBA or MCQ"
                    search={false}
                  />
                  <Text style={{ color: "red" }}>
                    <ErrorMessage name="questionType" />
                  </Text>

                  <UploadFiles
                    setFieldValue={formik.setFieldValue}
                    //imageFieldError={<ErrorMessage name='image' />}
                    value={formik.values}
                    imageFieldName={"image"}
                    imageFieldValue={formik.values.image}
                    imageTitle="Upload Image"
                  />

                  <TextInput
                    name="imageCaption"
                    value={formik.values.imageCaption} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                    onChangeText={formik.handleChange("imageCaption")}
                    onBlur={formik.handleBlur("imageCaption")}
                    style={styles.input}
                    placeholder="Image Caption"
                    multiline
                  />

                  <TextInput
                    name="question"
                    value={formik.values.question} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                    onChangeText={formik.handleChange("question")}
                    onBlur={formik.handleBlur("question")}
                    style={styles.input}
                    placeholder="Enter the Question"
                    multiline
                  />
                  <Text style={{ color: "red" }}>
                    <ErrorMessage name="question" />
                  </Text>
                  {
                    <FieldArray name="answers">
                      {(fieldArrayProp) => {
                        const { form, push, remove, insert } = fieldArrayProp;
                        const { values } = form;
                        // const {answers} = item.answers// ? item.answers : values
                        const { answers } = values;
                        //  const arrayValue = answers //item==={} ? answers : item.answers
                        const removeAnswer = (answerId) => {
                          answers.splice(
                            answers.findIndex((a) => a.answerId === answerId),
                            1
                          );
                          formik.resetForm({
                            values: {
                              questionId: Math.random()
                                .toString(36)
                                .substring(2, 12),
                              author: values.author,
                              image: values.image,
                              subject: values.subject,
                              questionType: values.questionType,
                              question: values.question,
                              answers: values.answers.map(
                                ({ answerId, answer, is_correct }, index) => {
                                  return {
                                    answerId: answerId,
                                    answer: answer,
                                    is_correct: is_correct,
                                  };
                                }
                              ),

                              imageCaption: values.imageCaption,
                              imageDownloadURL: values.imageDownloadURL,
                              image: values.image,
                              answerExplanation: values.answerExplanation,
                            },
                          });
                        };
                        if (item === null) {
                          return (
                            <View>
                              {answers.map(({ answerId }, index) => {
                                return (
                                  <View
                                    key={answerId}
                                    style={{
                                      flexDirection: "row",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {/* <RemoveAnswer setInitialValues={setInitialValues} length={answersLength} /> */}

                                    <TextInput
                                      name={`answers[${index}].answer`}
                                      // value= {ans.answer}//{quest.questions[index].subject} //{formik.values.questions[index].subject}
                                      onChangeText={formik.handleChange(
                                        `answers[${index}].answer`
                                      )}
                                      onBlur={formik.handleBlur(
                                        `answers[${index}].answer`
                                      )}
                                      style={[styles.input, { width: "68%" }]}
                                      placeholder={`Enter Option ${index + 1}`}
                                      multiline
                                    />

                                    <SelectList
                                      data={trueOrFalse}
                                      setSelected={(sub) =>
                                        formik.setFieldValue(
                                          `answers[${index}].is_correct`,
                                          sub
                                        )
                                      }
                                      save="value"
                                      multiline={false}
                                      defaultOption="False"
                                      placeholder="False"
                                      style
                                    />

                                    {index === 0
                                      ? answers.length < 5 && (
                                          <Button
                                            color="green"
                                            height={10}
                                            width={100}
                                            title="+"
                                            onPress={() => addAnswer(push)}
                                          />
                                        )
                                      : null}
                                    {index > 0 && (
                                      <Button
                                        color="green"
                                        title="-"
                                        onPress={() => {
                                          removeAnswer(answerId);
                                          setAnswersLength(answers.length);
                                        }}
                                      />
                                    )}
                                    <Text style={{ color: "red" }}>
                                      <ErrorMessage
                                        name={`answers[${index}].answer`}
                                      />
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          );
                        }
                      }}
                    </FieldArray>
                  }
                  <TextInput
                    name="answerExplanation"
                    value={formik.values.answerExplanation} //{quest.questions[index].subject} //{formik.values.questions[index].subject}
                    onChangeText={formik.handleChange("answerExplanation")}
                    onBlur={formik.handleBlur("answerExplanation")}
                    style={styles.input}
                    placeholder="Give the explanation to your answer"
                    multiline
                    textAlignVertical="top"
                  />
                  <Text style={{ color: "red" }}>
                    <ErrorMessage name="answerExplanation" />
                  </Text>

                  {/* onSubmit was not reponding to call when 'handleSubmit' was used, i therefore resorted to using the onSubmit call directly */}
                  <Button
                    color="green"
                    onPress={() => {
                      if (sbaError) {
                        Alert.alert(
                          "Attention",
                          "The question cannot be saved because, One option should be True in Single Best Answer"
                        );
                      } else if (typeof formik?.errors?.answers === "string") {
                        Alert.alert(
                          "Attention",
                          "The question cannot be saved because, the number of options should be at least 3 but not more than 5"
                        );
                      } else {
                        formik.handleSubmit();
                      }

                      // console.log(formik.errors);
                      // console.log(sbaError);
                    }}
                    title="Save Question"
                    disabled={
                      formik.isSubmitting ||
                      //  !formik.isValid ||
                      !formik.dirty
                      // ||
                      // sbaError
                      //   ? true
                      //   : false
                    }
                  />
                </View>
              );
            }}
          </Formik>
        </View>
        {/* </ScrollView> */}
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

export default CreateQuestion;

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.5,
    width: "100%",
    marginHorizontal: 2,
    marginVertical: 6,
    paddingHorizontal: 2,
    fontSize: 16,
  },
  inner: {
    padding: 2,
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    flexDirection: "column",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 1,
    width: "100%",
    margin: 1,
    //flexDirection: 'row',
    flexWrap: "wrap",
    //  borderWidth:2,

    backgroundColor: "#ecf0f1",
  },
  checkbox: {
    margin: 8,
  },
});
