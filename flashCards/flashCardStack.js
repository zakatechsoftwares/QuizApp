import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import AddCardPage from '../flashCards/createFlashCard'
import FlipCard from '../flashCards/studentFlashCards'
import CardGroupsPage from './flashCardGroupList'
import EditFlashcards from './editFlashCards'



const Stack = createNativeStackNavigator()

const FlashCardStack = () => {
  return (
   <Stack.Navigator initialRouteName='Question Bank'
   >
        {/* <Stack.Screen name='Profile' component={Profile} /> */}
        <Stack.Screen name='CreateFlashcards' component={AddCardPage} />
        <Stack.Screen name='FlashcardGroups' component={CardGroupsPage} />
        <Stack.Screen name='Flashcards' component={FlipCard} />
        <Stack.Screen name='EditFlashcards' component={EditFlashcards} />
        </Stack.Navigator>
   
  )
}

export default FlashCardStack

const styles = StyleSheet.create({})