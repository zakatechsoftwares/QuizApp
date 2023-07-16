import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  AsyncStorage,
  StyleSheet,
  Alert,
} from "react-native";

const CardGroupPage = ({ navigation, route }) => {
  const [groupName, setGroupName] = useState("");
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [cards, setCards] = useState([]);
  const [savedCards, setSavedCards] = useState([]);

  useEffect(() => {
    // Load cards from AsyncStorage
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const savedCard = await AsyncStorage.getItem("cardGroupLists");

      if (savedCard !== null) {
        setSavedCards(JSON.parse(savedCard));
      }
    } catch (error) {
      Alert.alert("Error loading cards:", error);
    }
  };

  // console.log(savedCards)

  const addCard = () => {
    if (frontText && backText) {
      const newCard = {
        front: frontText,
        back: backText,
      };

      setCards([...cards, newCard]);
      setFrontText("");
      setBackText("");
    }
  };

  const removeCard = (index) => {
    const updatedCards = [...cards];
    updatedCards.splice(index, 1);
    setCards(updatedCards);
  };

  const saveGroup = async () => {
    try {
      await AsyncStorage.setItem(
        "cardGroupLists",
        JSON.stringify(savedCards.concat({ [`${groupName}`]: cards }))
      );
      Alert.alert("Group of cards saved successfully!");
      setFrontText("");
      setBackText("");
      setGroupName("");
      setCards([]);
      navigation.navigate("FlashcardGroups");
    } catch (error) {
      Alert.alert("Error saving cards:");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardGroup}>
        <Text style={styles.title}>Create Card Group</Text>
        <TextInput
          style={styles.input}
          placeholder="Flipcard Group Name"
          value={groupName}
          onChangeText={setGroupName}
        />
        <TextInput
          style={styles.input}
          placeholder="Prompt Question"
          multiline
          numberOfLines={4}
          value={frontText}
          onChangeText={setFrontText}
        />
        <TextInput
          style={styles.input}
          placeholder="Answer to recall"
          multiline
          numberOfLines={4}
          value={backText}
          onChangeText={setBackText}
        />
        <TouchableOpacity onPress={addCard} style={styles.addButton}>
          <Text style={styles.buttonText}>Add Card to Group</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveGroup} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save Group</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.savedGroup}>
        <Text style={styles.title}>Cards added to the {groupName} group </Text>
        {cards.length ? (
          cards.map((card, index) => (
            <View style={styles.card} key={index}>
              <Text style={styles.cardText}>{card.front}</Text>
              <Text style={styles.cardText}>{card.back}</Text>
              <TouchableOpacity onPress={() => removeCard(index)}>
                <Text style={styles.removeButton}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.cardText}>No Card in this group</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  cardGroup: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  savedGroup: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  card: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  removeButton: {
    color: "red",
    fontSize: 16,
    alignSelf: "flex-end",
  },
});

export default CardGroupPage;
