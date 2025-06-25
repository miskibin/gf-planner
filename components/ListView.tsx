import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Item } from "../types";
import { formatDateForDisplay, getDateBadge } from "../utils/dateUtils";
import {
  registerForPushNotificationsAsync,
  scheduleEventReminders,
} from "../utils/notifications";
import { addItem, deleteItem, loadItems, updateItem } from "../utils/storage";
import EditModal from "./EditModal";

interface ListViewProps {
  storageKey: string;
  type: "events" | "wishlist" | "likes";
  emptyMessage: string;
}

export default function ListView({
  storageKey,
  type,
  emptyMessage,
}: ListViewProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  const refreshItems = useCallback(async () => {
    const loadedItems = await loadItems(storageKey);
    setItems(loadedItems);

    // Schedule notifications for events (limited functionality in Expo Go)
    if (type === "events") {
      try {
        await scheduleEventReminders(loadedItems);
      } catch {
        console.log(
          "Notifications not available in Expo Go - use development build for full functionality"
        );
      }
    }
  }, [storageKey, type]);

  useEffect(() => {
    refreshItems();

    // Register for notifications on first load
    if (type === "events") {
      registerForPushNotificationsAsync();
    }
  }, [refreshItems, type]);

  const handleAddItem = async (itemData: Omit<Item, "id" | "createdAt">) => {
    await addItem(storageKey, itemData);
    refreshItems();
  };

  const handleUpdateItem = async (itemData: Omit<Item, "id" | "createdAt">) => {
    if (editingItem) {
      await updateItem(storageKey, { ...editingItem, ...itemData });
      refreshItems();
    }
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(storageKey, item.id);
          refreshItems();
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingItem(undefined);
    setModalVisible(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(undefined);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#34C759";
      default:
        return "#666";
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => openEditModal(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>

        {item.date && (
          <View style={styles.dateRow}>
            <Text style={styles.itemDate}>
              {formatDateForDisplay(item.date)}
            </Text>
            {(() => {
              const badge = getDateBadge(item.date);
              return badge ? (
                <View
                  style={[styles.dateBadge, { backgroundColor: badge.color }]}
                >
                  <Text style={styles.dateBadgeText}>{badge.text}</Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {item.priority && (
          <View style={styles.priorityContainer}>
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item.priority) },
              ]}
            >
              {item.priority}
            </Text>
          </View>
        )}

        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          items.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>

      <EditModal
        visible={modalVisible}
        onClose={closeModal}
        onSave={editingItem ? handleUpdateItem : handleAddItem}
        item={editingItem}
        type={type}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  addButton: {
    backgroundColor: "#22223b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 20,
    marginTop: 10,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#22223b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 18,
    paddingBottom: 100, // Space for bottom add button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Space for bottom add button
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 8,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  dateBadgeText: {
    fontSize: 11,
    color: "white",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#22223b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    position: "relative",
  },
  itemContent: {
    padding: 18,
    paddingRight: 50, // Make space for delete button
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#22223b",
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 18,
    right: 18,
    padding: 8,
    zIndex: 10,
  },
  itemDate: {
    fontSize: 14,
    color: "#4a4e69",
    marginBottom: 5,
    fontWeight: "500",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemDescription: {
    fontSize: 14,
    color: "#4a4e69",
    lineHeight: 20,
    marginTop: 2,
  },
});
