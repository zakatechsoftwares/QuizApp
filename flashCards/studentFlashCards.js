import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FlipCard = ({ front, back, isFlipped, flipCard, rotateY }) => {
  return (
    <TouchableOpacity onPress={flipCard}>
      <View style={{ alignItems: "center" }}>
        <Animated.View
          style={[
            {
              transform: [{ rotateY: `${rotateY.value}deg` }],
              backgroundColor: isFlipped ? "green" : "orange",
              width: "100%",
              height: "100%",
            },
          ]}
        >
          <Animated.Text
            style={{
              fontSize: 18,
              transform: [{ rotateY: `${rotateY.value}deg` }],
              textAlign: "center",
              textAlignVertical: "center",
            }}
          >
            {isFlipped ? back : front}
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const CardViewer = ({ navigation, route }) => {
  const { groupName } = route.params;

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Load cards from AsyncStorage
    loadCards();
  }, []);

  const rotateY = useSharedValue(0);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    rotateY.value = withTiming(isFlipped ? 0 : 180, {
      duration: 1,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const loadCards = async () => {
    try {
      let savedCards = await AsyncStorage.getItem("cardGroupLists");
      if (savedCards !== null) {
        savedCards = JSON.parse(savedCards).filter(
          (item) => Object.keys(item)[0] === groupName
        );

        setCards(savedCards[0][groupName]);
      }
    } catch (error) {
      console.log("Error loading cards:", error);
    }
  };

  const removeCard = async () => {
    const updatedCards = [...cards];
    updatedCards.splice(currentIndex, 1);

    try {
      await AsyncStorage.setItem("cards", JSON.stringify(updatedCards));
      setCards(updatedCards);

      // Adjust current index if necessary
      if (currentIndex >= updatedCards.length && updatedCards.length > 0) {
        setCurrentIndex(updatedCards.length - 1);
      }
    } catch (error) {
      console.log("Error removing card:", error);
    }
  };

  const moveToPreviousCard = () => {
    setCurrentIndex(currentIndex - 1);
    setIsFlipped(false);
  };

  const moveToNextCard = () => {
    setCurrentIndex(currentIndex + 1);
    setIsFlipped(false);
  };

  if (cards.length === 0) {
    return <Text>No cards found.</Text>;
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={{ height: "80%", width: "100%" }}>
        <Text>{isFlipped ? "Answer" : "Question"}</Text>

        <FlipCard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
          flipCard={flipCard}
          rotateY={rotateY}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: "10%",
        }}
      >
        <TouchableOpacity
          onPress={moveToPreviousCard}
          disabled={currentIndex === 0}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: isFlipped ? "green" : "orange",
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={{ fontSize: 18, margin: 10 }}>Previous</Text>
        </TouchableOpacity>
        <Text>{currentIndex + 1 + " of " + cards.length + " cards"}</Text>
        <TouchableOpacity
          onPress={moveToNextCard}
          disabled={currentIndex === cards.length - 1}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: isFlipped ? "green" : "orange",
          }}
        >
          <Text style={{ fontSize: 18, margin: 10 }}>Next</Text>
          <Ionicons name="arrow-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: "10%",
        }}
      >
        {/* <TouchableOpacity onPress={removeCard}>
          <Text style={{ fontSize: 18, margin: 10 }}>Remove this card</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default CardViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
});
