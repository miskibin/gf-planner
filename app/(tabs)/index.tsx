import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ListView from "../../components/ListView";

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ListView
        storageKey="events"
        type="events"
        emptyMessage="No events yet. Add your first event!"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
