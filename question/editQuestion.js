import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { FieldArray, Formik, ErrorMessage } from "formik";
import * as yup from "yup";
import { SelectList } from "react-native-dropdown-select-list";
import UploadFiles from "../components/uploadFiles";
import firestore from "@react-native-firebase/firestore";
import ModalSelector from "react-native-modal-selector";
import storage from "@react-native-firebase/storage";
import { useSelector } from "react-redux";

const CreateQuestion = ({ navigation, route }) => {
  const { item, questions } = route.params;
  const isMounted = useRef(false);
  const [sbaError, setSbaError] = useState(false);
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

  const deleteQuestion = async () => {
    const imageName = item.image.substring(item.image.lastIndexOf("/") + 1);
    const reference = storage().ref(`QuizImages/${imageName}`);

    try {
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.questionBank`]:
            firestore.FieldValue.arrayRemove(item),
        })
        .then(
          (() => {
            if (item.imageDownloadURL) {
              reference.delete();
            }
          })()
        )
        .then(navigation.navigate("Question Bank"));
    } catch (e) {
      Alert.alert(e.message);
    }
  };

  let userEmail = useSelector((state) => state.user).userEmail;
  const trueOrFalse = ["True", "False"];

  const reinitialValue = item
    ? item
    : {
        questionId: Math.random().toString(36).substring(2, 12),
        author: userEmail,
        image: null,
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

  const initialValue = {
    questionId: item.questionId,
    author: item.author,
    image: item.image,
    subject: item.subject,
    questionType: item.questionType,
    question: item.question,
    answers: item.answers.map(({ answerId, answer, is_correct }, index) => {
      return (
        //This was raising warning of unique key but i ignore because ?how to fix it and hopefully won't break the code
        {
          answerId: answerId,
          answer: answer,
          is_correct: is_correct,
        }
      );
    }),

    imageCaption: item.imageCaption,
    imageDownloadURL: item.imageDownloadURL,
    image: item.image,
    answerExplanation: item.answerExplanation,
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
    // .when('questionType',{
    //   is : 'Single Best Answer',
    //   then : yup.array().test(
    // 'answers',
    // 'Only one answer can be correct',
    // (answers)=>{
    //   const count = answers.filter((answer)=>{ return answer.is_correct === true }).length
    //   if (count === 1){ return true}
    //  // else return new ValidationError('Only one answer can be correct', undefined, answers)
    // }
    // ),
    //  // otherwise : pass
    // })
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
      deleteQuestion();
      const imageName = values.image.substring(
        values.image.lastIndexOf("/") + 1
      );
      const reference = storage().ref(`QuizImages/${imageName}`);

      const result = await reference.putFile(values.image);
      const url = await storage()
        .ref(`QuizImages/${imageName}`)
        .getDownloadURL();
      console.log(result);
      values.imageDownloadURL = url;
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.questionBank`]:
            firestore.FieldValue.arrayUnion(values),
        })
        .catch((err) => Alert.alert("An error has occured"));
    } else {
      await firestore()
        .collection("users")
        .doc(quizGroupName)
        .update({
          [`${quizGroupNameRaw}.questionBank`]:
            firestore.FieldValue.arrayUnion(values),
        })
        .catch((err) => Alert.alert("An error has occured"));
    }
  };

  return (
    //  <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : null}
    //   style={styles.container}
    // >
    //   {/* <SafeAreaView style={{flex: 1}}> */}
    //      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    //   <ScrollView>
    // <View style={styles.container}>
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={{ paddingBottom: 40, marginBottom: 2 }}>
            <View style={styles.inner}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validate={(values) => validate(values)}
                enableReinitialize
                onSubmit={(values, actions) => {
                  deleteQuestion();
                  onSubmit(values).then(() => {
                    actions.setSubmitting(false);
                  });
                  actions.resetForm(initialValue);
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
                      {/* <Text><ErrorMessage name='author' /></Text> */}

                      <SelectList
                        data={subject}
                        setSelected={(option) =>
                          formik.setFieldValue(
                            "subject",
                            option || formik.values.subject
                          )
                        }
                        save="value"
                        placeholder={formik.values.subject}
                        search={false}
                      />
                      {/* <ModalSelector
                        data={subject}
                        initValue={
                          
                            : "Select the Course"
                        }
                        onChange={(option) =>
                          formik.setFieldValue("subject", option.label)
                        }
                      /> */}

                      <SelectList
                        data={questionTypes}
                        setSelected={(option) =>
                          formik.setFieldValue(
                            "questionType",
                            option || formik.values.questionType
                          )
                        }
                        save="value"
                        placeholder={formik.values.questionType}
                        search={false}
                      />

                      {/* <ModalSelector
                        data={questionTypes}
                        initValue={
                          formik.values.questionType
                            ? formik.values.questionType
                            : "Select Question Type"
                        }
                        onChange={(option) =>
                          formik.setFieldValue("questionType", option.label)
                        }
                      /> */}
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
                      <Text>
                        <ErrorMessage name="question" />
                      </Text>
                      {
                        <FieldArray name="answers">
                          {(fieldArrayProp) => {
                            const { form, push, remove, insert } =
                              fieldArrayProp;
                            const { values } = form;
                            // const {answers} = item.answers// ? item.answers : values
                            const { answers } = values;
                            //  const arrayValue = answers //item==={} ? answers : item.answers
                            const removeAnswer = (answerId) => {
                              answers.splice(
                                answers.findIndex(
                                  (a) => a.answerId === answerId
                                ),
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
                                    (
                                      { answerId, answer, is_correct },
                                      index
                                    ) => {
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

                            return (
                              <View>
                                {answers.map(({ answerId }, index) => {
                                  return (
                                    <View
                                      key={answers[index].answerId}
                                      style={{
                                        flexDirection: "row",
                                        flexWrap: "wrap",
                                        maxWidth: "100%",
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
                                        style={[styles.input]}
                                        placeholder={`Enter Option ${
                                          index + 1
                                        }`}
                                        multiline
                                        defaultValue={answers[index].answer}
                                      />
                                      <Text>
                                        <ErrorMessage
                                          name={`answers[${index}].answer`}
                                        />
                                      </Text>

                                      {/* <Checkbox 
                                        name={`answers[${index}].is_correct`}
                                        style={styles.checkbox} 
                                       value={answers[0].is_correct} 
                                       onChange =   {formik.handleChange(`answers[${index}].is_correct`)}           //{formik.setFieldValue(`answers[${index}].is_correct`, !ans.is_correct)} 
                                        /> */}
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
                                        defaultOption={
                                          answers[index].is_correct || "False"
                                        }
                                        placeholder={
                                          answers[index].is_correct || "False"
                                        }
                                      />
                                      {/*                                      
                                    {index===0 ?  (answers.length<5 && <Button title='+' onPress={()=>{addAnswer(push)}}/>) : null}
                                    {index>0 && <Button title='-' onPress={()=> {removeAnswer(answerId); setAnswersLength(answers.length);}}  />} */}
                                    </View>
                                  );
                                })}
                              </View>
                            );
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
                      {/* onSubmit was not reponding to call when 'handleSubmit' was used, i therefore resorted to using the onSubmit call directly */}
                      <Button
                        color="green"
                        onPress={() => {
                          if (sbaError) {
                            Alert.alert(
                              "Attention",
                              "The question cannot be saved because, One option should be True in Single Best Answer"
                            );
                          } else if (
                            typeof formik?.errors?.answers === "string"
                          ) {
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
                      <Button
                        color="green"
                        onPress={() => deleteQuestion()}
                        title="Delete Question"
                      />
                    </View>
                  );
                }}
              </Formik>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateQuestion;

const styles = StyleSheet.create({
  input: {
    borderWidth: 0.5,
    width: "95%",
    marginHorizontal: 2,
    marginVertical: 6,
    paddingHorizontal: 2,
    fontSize: 16,
  },
  inner: {
    padding: 2,
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column",
    width: "100%",
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

    backgroundColor: "#ecf0f1",
  },
  checkbox: {
    margin: 8,
  },
});
