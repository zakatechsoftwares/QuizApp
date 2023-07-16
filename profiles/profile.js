import { Button, StyleSheet, Text, View } from "react-native";

import AdminPage from "../userPages/adminPage";
import CandidatePage from "../userPages/candidatePage";
import ExaminerPage from "../userPages/examinerPage";
import ChiefExaminerPage from "../userPages/chiefExaminerPage";
import { useSelector, useDispatch } from "react-redux";

const Profile = ({ navigation }) => {
  const dispatch = useDispatch();

  let currentGroupCadre = useSelector((state) => state.user).currentGroupCadre;

  return (
    <View>
      {/* <Text>Profile{user.email} </Text> */}
      <View>
        {currentGroupCadre === "Admin" && <AdminPage navigation={navigation} />}
        {currentGroupCadre === "Candidate" && (
          <CandidatePage navigation={navigation} />
        )}
        {currentGroupCadre === "Examiner" && (
          <ExaminerPage navigation={navigation} />
        )}
        {currentGroupCadre === "Chief Examiner" && (
          <ChiefExaminerPage navigation={navigation} />
        )}
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  Button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    justifyContent: "center",

    backgroundColor: "#ecf0f1",
    padding: 8,
  },
});
