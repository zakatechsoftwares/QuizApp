import {
  StyleSheet,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useCallback, useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";
import firestore from "@react-native-firebase/firestore";
import { FlashList } from "@shopify/flash-list";

const AllAttempts = ({ navigation, route }) => {
  const [allAttempts, setAllAttempts] = useState([]);
  const { quizId, scoreMean, scoreStandardDeviation } = route.params;
  const [loading, setLoading] = useState(true);

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
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
      .onSnapshot((querySnapshot) => {
        data = querySnapshot.data()[quizGroupNameRaw].attemptedQuiz;
        const attempts = data.filter((element) => element.quizId === quizId);
        setAllAttempts(attempts);
        // const users = [];

        // querySnapshot.forEach((documentSnapshot) => {
        //   users.push({
        //     ...documentSnapshot.data(),
        //     key: documentSnapshot.id,
        //   });
        // });

        // setUsers(users);
        setLoading(false);
      });

    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     (async () => {
  //       let data = await firestore()
  //         .collection("users")
  //         .doc(quizGroupName)
  //         .get();
  //       data = data.data()[quizGroupNameRaw].attemptedQuiz;
  //       const attempts = data.filter((element) => element.quizId === quizId);
  //       setAllAttempts(attempts);
  //     })();
  //   }, [])
  // );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text variant="titleLarge">
              Mean score: {parseFloat(scoreMean).toFixed(2)}{" "}
            </Text>
            <Text variant="titleLarge">
              {" "}
              SD of the Scores : {parseFloat(scoreStandardDeviation).toFixed(2)}
              %{" "}
            </Text>

            <View style={{ borderWidth: 2 }} />

            <FlashList
              estimatedItemSize={200}
              data={allAttempts}
              renderItem={({ item }) => {
                return (
                  <View>
                    <Text variant="titleLarge">
                      Candidate: {item.candidate} {"\n"}
                      Score : {parseFloat(item.score).toFixed(2)}%
                    </Text>
                    <View style={{ borderWidth: 0.5 }} />
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

export default AllAttempts;

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
    height: 100,

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
