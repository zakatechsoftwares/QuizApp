import { StyleSheet } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QuizBank from "./quizBank";
import ChooseQuizQuestions from "./chooseQuizQuestions";
import AllAttempts from "./allAttempts";
import { useSelector } from "react-redux";

const Stack = createNativeStackNavigator();

const StackQuizPage = ({ navigation }) => {
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;

  return (
    <Stack.Navigator initialRouteName="Quiz Bank">
      {currentGroupCadre === "Candidate" ||
        currentGroupCadre === "Examiner" || (
          <Stack.Screen name="Quiz Bank" component={QuizBank} />
        )}
      {/* <Stack.Screen name='Create Quiz' component={CreateQuiz} /> */}
      {/* {currentGroupCadre==='Admin' || currentGroupCadre==='Chief Examiner' || currentGroupCadre==='Examiner'
        && */}
      {currentGroupCadre === "Candidate" ||
        currentGroupCadre === "Examiner" || (
          <Stack.Screen
            name="Choose Quiz Questions"
            component={ChooseQuizQuestions}
          />
        )}
      {/* } */}

      {/* { currentGroupCadre==='Admin' || currentGroupCadre==='Chief Examiner' &&
          <Stack.Screen name='Quiz Bank' component={QuizBank} />} */}
      <Stack.Screen name="All Attempts" component={AllAttempts} />
    </Stack.Navigator>
  );
};

export default StackQuizPage;

const styles = StyleSheet.create({});
