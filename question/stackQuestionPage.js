import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import CreateQuestion from './createQuestion'
import EditQuestion from './editQuestion'
import QuestionBank from './questionBank'




const Stack = createNativeStackNavigator()

const StackQuestionPage = () => {
  return (
   <Stack.Navigator initialRouteName='Question Bank'
   >
        {/* <Stack.Screen name='Profile' component={Profile} /> */}
        <Stack.Screen name='Create Question' component={CreateQuestion} />
        <Stack.Screen name='Edit Question' component={EditQuestion} />
        <Stack.Screen name='Question Bank' component={QuestionBank} />
    </Stack.Navigator>
   
  )
}

export default StackQuestionPage

const styles = StyleSheet.create({})