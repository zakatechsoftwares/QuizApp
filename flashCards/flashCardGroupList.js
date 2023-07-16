import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const GroupListPage = ({ navigation }) => {
  const [groups, setGroups] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
      // Do something when the screen is focused
      // return () => {
      //   alert('Screen was unfocused');
      //   // Do something when the screen is unfocused
      //   // Useful for cleanup functions
      // };
    }, [])
  );

  // useEffect(() => {
  //   // Load groups from AsyncStorage

  // }, []);

  const loadGroups = async () => {
    try {
      const savedGroups = await AsyncStorage.getItem("cardGroupLists");
      // console.log(savedGroups)
      if (savedGroups !== null) {
        setGroups(JSON.parse(savedGroups));
      }
    } catch (error) {
      console.log("Error loading groups:", error);
    }
  };

  const removeGroup = async (groupName) => {
    const updatedGroups = groups.filter(
      (group) => Object.keys(group)[0] !== groupName
    );
    try {
      await AsyncStorage.setItem(
        "cardGroupLists",
        JSON.stringify(updatedGroups)
      );
      setGroups(updatedGroups);
      console.log("Group removed successfully!");
    } catch (error) {
      console.log("Error removing group:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateFlashcards")}
        style={styles.addButton}
      >
        <Text style={styles.buttonText}>Create Group</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Group List</Text>

      {groups !== null ? (
        groups.map((group, index) => (
          <View style={styles.groupItem} key={index}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Flashcards", {
                  groupName: Object.keys(group)[0],
                })
              }
            >
              <Text style={[styles.groupName, { flexShrink: 1 }]}>
                {Object.keys(group)[0]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditFlashcards", {
                  groupNameEdit: Object.keys(group)[0],
                })
              }
            >
              <Text style={styles.removeButton}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => removeGroup(Object.keys(group)[0])}
            >
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.removeButton}>No Flip Cards</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    alignSelf: "flex-end",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  groupItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    flex: 1,
  },
  removeButton: {
    color: "red",
    fontSize: 16,
  },
});

export default GroupListPage;
