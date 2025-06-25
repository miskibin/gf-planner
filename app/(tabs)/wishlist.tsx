import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ListView from "../../components/ListView";

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ListView
        storageKey="wishlist"
        type="wishlist"
        emptyMessage="No wishlist items yet. Add something she wants!"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
