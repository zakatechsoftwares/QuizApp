// import { Button, FlatList, StyleSheet, TouchableOpacity, View, SafeAreaView,
//   KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, ScrollView, Platform, Image,
// TextInput,
// Pressable} from 'react-native'
// import { DbUserContext } from '../App'
// import { db, storage, auth } from '../utils/firebase'
// import { useContext, useState, useEffect, useRef } from 'react'
// import { doc, getDoc, getDocs, collection  } from 'firebase/firestore'
// import { Text } from 'react-native-paper';
// import {FlashList} from '@shopify/flash-list'
// import { Formik } from 'formik'
// import { UserContext } from '../App'
// import * as yup from 'yup'
// import { SelectList } from 'react-native-dropdown-select-list'

// import { FontAwesome } from '@expo/vector-icons';

// const CreateQuiz = ({selectedQuestionId, selectedQuestions, SelectUnselect, setShow}) => {

//    const user = useContext(DbUserContext)
//  const [quizName, setQuizName]=useState('')
//  const [releaseResult, setReleaseResult]=useState()
//  const [timeAllowedHr, setTimeAllowedHr]=useState()
//  const [timeAllowedMin, setTimeAllowedMin]=useState()
//  const [negFacMc, setNegFacMc]=useState()

// const ReleaseResult= [
//     {key:'1', value:'Immediately'},
//       {key:'2', value:'Later'},
//       {key:'3', value:'Send through email'}
//       ]

//   return (
//     <SafeAreaView style={styles.container}>
//         <KeyboardAvoidingView
//                 behavior={Platform.OS === "ios" ? "padding" : null}
//                 style={styles.container}
//             >

//                     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

//                         <View style={styles.inner}>

//       <Button title='Add more questions' onPress={()=> {setShow(true)} //navigation.navigate('Create Quiz', {selectedQuestions : selectedQuestions})
//     } />
//     <Text style={{fontSize: 20}}>You have {selectedQuestions.length} questions left</Text>

//       <TouchableOpacity style={styles.floatAction} onPress={()=>console.log('Button clicke')}>
//       <Text>Submit</Text>
//         {/* <FontAwesome name="send" size={50} color="black" /> */}
//        </TouchableOpacity>

//       <FlatList
//         estimatedItemSize={100}
//         data={selectedQuestions}
//         keyExtractor={item => item.questionId}
//         ListHeaderComponent={
//           <View //style={styles.container}
//     >
//       <TextInput
//           name='quizName'
//            onChangeText={setQuizName}
//            value={quizName}
//            style={styles.input}
//            placeholder='Quiz Title'
//         //  //  validate={prop.validatefield}
//          />
//          <TextInput
//           name='timeAllowedHr'
//            onChangeText={setTimeAllowedHr}
//            value= {timeAllowedHr}
//            keyboardType='numeric'
//         style={styles.input}
//          placeholder='Hour(s) allowed'

//          />
//          <TextInput
//           name='timeAllowedMin'
//            onChangeText={setTimeAllowedMin}
//            value={timeAllowedMin}
//            keyboardType='numeric'
//         style={styles.input}
//            placeholder='Minutes Allowed'

//          />

//          <TextInput
//           name='negFacMc'
//            onChangeText={setNegFacMc}
//            value={negFacMc}
//            keyboardType='numeric'
//         style={styles.input}
//         placeholder='MCQ Negative factor'

//          />
//          {/* <SelectList
//          data={ReleaseResult}
//          setSelected={(res)=>setReleaseResult(res)}
//          save='value'
//          placeholder='Release result'
//          style={styles.input}
//          /> */}

//   <Button title='Submitform' onPress={()=> console.log(quizName, timeAllowedHr, timeAllowedMin, negFacMc, releaseResult
//     )} />

//          </View>
//         }
//         renderItem={({item})=>{

//           return(
//             <View style={{marginH: 2, borderColor:'red', borderWidth: 1, padding: 5,
//             //backgroundColor:Object.values(selectedQuestionId).includes(item.questionId) ? 'red' : 'white'
//             }}            >

//     <Text variant="headlineMedium">{item.subject}</Text>
//     <Text variant="headlineSmall">{item.author}</Text>
//     <Text variant="headlineSmall">{item.questionId}</Text>

//     <Text variant="headlineSmall">{item.questionType}</Text>

//      {item.imageDownloadURL && <Image
//         style={styles.stretch}
//         source={{uri: item.imageDownloadURL}}
//       />}

//     <Text variant="titleLarge">{item.question}</Text>
//     {
//       item.answers.map(({answer, is_correct, answerId}, index)=>{
//        return (
//         <View key={answerId} style={{flex:1, flexDirection: 'row', flexWrap: 'nowrap'}}>
//           <View style={{flex: 1}}><Text variant="titleMedium">{answer}</Text></View><View><Text variant="titleMedium">{is_correct==='True' ? 'True' : 'False'}</Text></View>
//         </View>
//        )
//       })
//     }
//     <Text variant="titleSmall">{item.answerExplanation}</Text>
//     <Button title='Remove Question' onPress={()=> {SelectUnselect(item)}}/>

//             </View>
//           )
//         }}
//       />

//     </View>

//     </TouchableWithoutFeedback>

//     </KeyboardAvoidingView>
//      </SafeAreaView>
//   )
// }

// export default CreateQuiz

// const styles = StyleSheet.create({
//    input:{
//         height: 50,
//         borderWidth:2,
//         width:'100%',
//         margin: 4,
//         paddingHorizontal: 16,
//         fontSize: 30,
//         marginLeft: 10
//         },
//         floatAction:{
//             position:'absolute',
//             height: 100,
//             width: 100,
//             right: 5,
//             bottom: 5,
//             justifyContent: 'center',
//             alignItems: 'center',
//             borderWidth: 2
//         },
//          inner: {
//           width: '100%',
//         padding: 2,
//         flex: 1,
//         justifyContent: "flex-end",
//         flexDirection: 'column'
//     },
//   container: {
//     width: '100%',
//    flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//      padding: 1,

//     margin: 1,
//     //flexDirection: 'row',
//     flexWrap:'wrap',
//     borderWidth:2,

//     backgroundColor: '#ecf0f1',

//   },
//    checkbox: {
//     margin: 8,
//   },

//   stretch: {
//     width: '100%',
//     height: 200,
//     resizeMode: 'stretch',
//   }

// });
