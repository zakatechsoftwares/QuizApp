import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>About the App</Text>
      <Text style={styles.description}>
     This app is an easy-to-use app that give you full control.{ '\n'}{ '\n'}
      You can create a quiz group, as many as you want, to which you can add or remove members. { '\n'}{ '\n'}
       You can add a member via an invite link which can only be used once. { '\n'}{ '\n'}
        The invite link is specific to the intended cadre of the invited member. { '\n'}{ '\n'}
        The invited member can be Chief Examiner, Examiner, or Candidate. { '\n'}{ '\n'}
        The Chief Examiner and the Examiner can be made an Admin by the Admin after joining the Quiz group. { '\n'}{ '\n'}
        The role of the different cadre in the group is unique. { '\n'}{ '\n'}

        The examiner can create Question and add it to the question bank. { '\n'}{ '\n'}

        In addition to the priviledge of the examiner, the Chief Examiner can create quiz and schedule quiz. { '\n'}{ '\n'}

        In addition to the priviledge of the Chief Examiner, the Admin can add a member via an invite link, remove any member
        and change an examiner or Chief examiner to an Admin. { '\n'}{ '\n'}

        The Candidate can only attempt a scheduled quiz when the time is due { '\n'}{ '\n'}
        There is Chat room where all the members of a group can interact and discuss { '\n'}{ '\n'}

        Kindly note that the chat is not real-time and message can be slightly delayed { '\n'}{ '\n'}
      </Text>
      {/* <Text style={styles.instructions}>
        Instructions:
      </Text>
      <Text style={styles.instructions}>
        1. First, make sure you have installed the app on your device.
      </Text>
      <Text style={styles.instructions}>
        2. Launch the app and follow the on-screen prompts to set up your preferences.
      </Text>
      <Text style={styles.instructions}>
        3. Once the setup is complete, you can start using the app to perform various tasks.{ '\n'}{ '\n'}
      </Text> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    margin: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default AboutScreen;







// import { View, Text } from 'react-native'
// import React from 'react'

// const About = () => {
//   return (
//     <View>
//       <Text>
      

//       </Text>
//     </View>
//   )
// }

// export default About