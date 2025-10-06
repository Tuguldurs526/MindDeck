import React from "react";
import { SafeAreaView, Text, View, Button } from "react-native";

export default function App() {
  const [health, setHealth] = React.useState<string>("(tap to check API)");

  async function checkApi() {
    try {
      const res = await fetch("http://localhost:5000/api/health");
      const json = await res.json();
      setHealth(JSON.stringify(json));
    } catch (e: any) {
      setHealth(String(e.message ?? e));
    }
  }

  return (
    <SafeAreaView>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>Minddeck Mobile</Text>
        <Button title="Check API" onPress={checkApi} />
        <Text style={{ marginTop: 12 }}>{health}</Text>
      </View>
    </SafeAreaView>
  );
}