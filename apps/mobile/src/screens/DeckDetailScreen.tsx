import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type Card = {
  id: string;
  front: string;
  back: string;
};

const dummyCards: Card[] = [
  { id: "1", front: "What is a stack?", back: "LIFO data structure." },
  { id: "2", front: "What is a queue?", back: "FIFO data structure." },
  { id: "3", front: "What is a graph?", back: "A set of nodes and edges." },
];

const DeckDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { title } = route.params;

  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const cards = dummyCards;
  const hasCards = cards.length > 0;
  const card = hasCards ? cards[index] : null;

  function handleNextCard() {
    if (!hasCards) return;
    if (index < cards.length - 1) {
      setIndex((prev) => prev + 1);
      setShowBack(false);
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {hasCards
          ? `Card ${index + 1} of ${cards.length}`
          : "This deck has no cards yet."}
      </Text>

      <View style={styles.card}>
        {hasCards ? (
          <>
            <Text style={styles.cardLabel}>
              {showBack ? "Answer" : "Question"}
            </Text>
            <Text style={styles.cardText}>
              {showBack ? card?.back : card?.front}
            </Text>
          </>
        ) : (
          <Text style={styles.cardText}>
            No cards yet – later you will load them from the API.
          </Text>
        )}
      </View>

      {hasCards && (
        <View style={{ gap: 8 }}>
          <Button
            title={showBack ? "Hide answer" : "Show answer"}
            onPress={() => setShowBack((prev) => !prev)}
          />
          <Button title="Next card" onPress={handleNextCard} />
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="Back to decks" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

export default DeckDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: "#f4f4f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
