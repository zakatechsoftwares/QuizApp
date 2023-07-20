import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, SectionList, Platform } from "react-native";
import firestore from "@react-native-firebase/firestore";
import CountDown from "../components/countDown";
import { Text } from "react-native-paper";
import { useSelector } from "react-redux";

const ExaminerPage = ({ navigation }) => {
  let dbUser = JSON.parse(useSelector((state) => state.user).DbUser);
  const [attemptedQuiz, setAttemptedQuiz] = useState([]);
  const [scheduledQuiz, setScheduledQuiz] = useState([]);
  const [runUseEffect, setRunUseEffect] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  let currentGroupName = useSelector((state) => state.user).currentGroupName;
  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;
  const quizGroupNameRaw = currentGroupName;
  const quizGroupName = quizGroupNameRaw.substring(
    0,
    quizGroupNameRaw.indexOf("-")
  );
  const groupName = quizGroupNameRaw.substring(
    quizGroupNameRaw.indexOf("-") + 1
  );

  const FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View
        style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
      />
    );
  };

  const ScheduleSortingOrder = (a, b) => {
    const aSchedule =
      a.schedule?.nanoseconds / 1000 + a.schedule?.seconds * 1000;
    const bSchedule =
      b.schedule?.nanoseconds / 1000 + b.schedule?.seconds * 1000;
    if (bSchedule > aSchedule) {
      return -1;
    }
    if (bSchedule < aSchedule) {
      return 1;
    }
    if (bSchedule === aSchedule) {
      return 0;
    }
  };

  useEffect(() => {
    // (async () => {
    //   //   setTimeout(() => {
    //   //     setRunUseEffect(!runUseEffect);
    //   //   }, 2000);

    //   let data = await
    firestore()
      .collection("users")
      .doc(quizGroupName)
      .onSnapshot((data) => {
        if (data) {
          setRefreshing(false);
          let quizScheduled = data.data()[quizGroupNameRaw].scheduledQuiz;
          let quizAttempted = data.data()[quizGroupNameRaw].attemptedQuiz;
          setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));

          quizScheduled = quizScheduled.filter(
            (element) => element.schedule.seconds - Date.now() < 86400
          );
          setAttemptedQuiz(quizAttempted.sort(ScheduleSortingOrder));
          setScheduledQuiz(quizScheduled.sort(ScheduleSortingOrder));
        }
      });

    //  console.log(quizAttempted)
    //  console.log(quizScheduled)
    // }

    //  )();
  }, []);

  const standardDeviation = (arr, usePopulation = false) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr
        .reduce((acc, val) => acc.concat((val - mean) ** 2), [])
        .reduce((acc, val) => acc + val, 0) /
        (arr.length - (usePopulation ? 0 : 1))
    );
  };

  const meanScore = (arr) => {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return mean;
  };

  return (
    <View style={{ marginTop: Platform.OS == "ios" ? 20 : 30 }}>
      <SectionList
        // ref={ref=>(this.scrollRef=ref)}
        ItemSeparatorComponent={FlatListItemSeparator}
        sections={[
          // { title: 'Scheduled Quiz', data: scheduledQuiz },
          // { title: 'Attempted Quiz', data: attemptedQuiz }
          {
            title:
              scheduledQuiz.length === 0
                ? "No Scheduled Quiz"
                : "Scheduled Quiz",
            data: scheduledQuiz,
          },
          {
            title:
              attemptedQuiz.length === 0
                ? "No Attempted Quiz"
                : "Attempted Quiz",
            data: attemptedQuiz,
          },
        ]}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setRunUseEffect(!runUseEffect);
        }}
        renderSectionHeader={({ section }) => (
          <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
        )}
        renderItem={({ item }) => {
          const millisec =
            item.schedule?.nanoseconds / 1000 + item.schedule?.seconds * 1000;
          const date = new Date(millisec);
          let filtered = attemptedQuiz?.filter(
            (element) => element.quizId === item.quizId
          );
          filtered = filtered.map((element, i) => {
            return parseFloat(
              element.score //.substring(0,element.score.indexOf('%'))
            );
          });
          let scoreStandardDeviation = standardDeviation(filtered, true);
          let scoreMean = meanScore(filtered);

          return (
            <View>
              <Text variant="titleLarge">Quiz Title: {item.quizName}</Text>
              {item.score && (
                <Text variant="titleLarge">
                  Score Standard Deviation: {scoreStandardDeviation}
                </Text>
              )}
              {item.score && (
                <Text variant="titleLarge">
                  Score Mean: {scoreMean.toFixed(2)}
                </Text>
              )}

              {item.schedule && (
                <Text variant="titleLarge">
                  <CountDown timers={millisec} />
                </Text>
              )}

              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View></View>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) =>
          item.scheduledQuizId ? item.scheduledQuizId : item.attemptedQuizId
        }
      />
    </View>
  );
};

export default ExaminerPage;

const styles = StyleSheet.create({
  SectionHeaderStyle: {
    backgroundColor: "#CDDC89",
    fontSize: 20,
    padding: 5,
    color: "#fff",
  },

  SectionListItemStyle: {
    fontSize: 15,
    padding: 15,
    color: "#000",
    backgroundColor: "#F5F5F5",
  },
  touchableText: {
    //fontWeight:'bold',
    // fontSize:20,
    textAlign: "center",
    color: "white",
    //fontWeight:'bold',
    fontSize: 16,
    textAlign: "center",
  },
});
