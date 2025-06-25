import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ListView from "../../components/ListView";

export default function LikesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ListView
        storageKey="likes"
        type="likes"
        emptyMessage="No likes recorded yet. Add things she enjoys!"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
