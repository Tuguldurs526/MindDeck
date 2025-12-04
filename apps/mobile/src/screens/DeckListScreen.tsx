import React, { useState } from "react";
import {
    Button,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Card = {
  id: string;
  front: string;
  back: string;
};

type Deck = {
  id: string;
  title: string;
  cards: Card[];
};

const initialDecks: Deck[] = [
  {
    id: "1",
    title: "Operating Systems",
    cards: [
      { id: "1", front: "What is a process?", back: "A running program instance." },
      { id: "2", front: "What is a thread?", back: "A lightweight unit of execution." },
    ],
  },
  {
    id: "2",
    title: "Algorithms",
    cards: [
      { id: "3", front: "What is Big-O?", back: "Asymptotic upper bound." },
      { id: "4", front: "What is DFS?", back: "Depth-first search graph traversal." },
    ],
  },
];

const DeckListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [decks, setDecks] = useState<Deck[]>(initialDecks);

  function handleCreateDeck() {
    const newId = String(Date.now());
    const newDeck: Deck = {
      id: newId,
      title: `New deck ${decks.length + 1}`,
      cards: [],
    };
    setDecks((prev) => [newDeck, ...prev]);
  }

  function handleDeleteDeck(id: string) {
    setDecks((prev) => prev.filter((d) => d.id !== id));
  }

  function openDeck(deck: Deck) {
    navigation.navigate("DeckDetail", {
      deckId: deck.id,
      title: deck.title,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your decks</Text>
      <Text style={styles.subtitle}>
        Tap a deck to view cards. Create and delete to test your UI.
      </Text>

      <View style={{ marginVertical: 12 }}>
        <Button title="Create deck" onPress={handleCreateDeck} />
      </View>

      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openDeck(item)}
            style={styles.deckItem}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.deckTitle}>{item.title}</Text>
              <Text style={styles.deckMeta}>
                {item.cards.length} card(s)
              </Text>
            </View>
            <Button
              title="Delete"
              onPress={() => handleDeleteDeck(item.id)}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default DeckListScreen;

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
  deckItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  deckMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
});
