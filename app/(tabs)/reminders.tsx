import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditModal from "../../components/EditModal";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { Reminder } from "../../types";
import {
  deleteReminder,
  getNextReminderDate,
  loadReminders,
  updateReminder,
} from "../../utils/storage";

export default function RemindMeScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadRemindersData = async () => {
    const data = await loadReminders();
    // Filter out completed and discarded reminders, and check for due reminders
    const activeReminders = data.filter(
      (reminder) =>
        reminder.status === "active" || reminder.status === "snoozed"
    );
    setReminders(activeReminders);
  };

  useFocusEffect(
    useCallback(() => {
      loadRemindersData();
    }, [])
  );

  const handleReminderAction = async (
    reminder: Reminder,
    action: "tomorrow" | "discard" | "done"
  ) => {
    const updatedReminder = { ...reminder };

    switch (action) {
      case "tomorrow":
        updatedReminder.status = "snoozed";
        updatedReminder.nextReminder = getNextReminderDate(
          "daily",
          updatedReminder.reminderHour
        );
        updatedReminder.snoozeCount += 1;
        updatedReminder.lastReminded = new Date().toISOString();
        break;
      case "discard":
        updatedReminder.status = "discarded";
        updatedReminder.discardedCount += 1;
        break;
      case "done":
        updatedReminder.status = "completed";
        updatedReminder.completedCount += 1;
        updatedReminder.lastReminded = new Date().toISOString();
        // Reset for next occurrence based on frequency
        updatedReminder.nextReminder = getNextReminderDate(
          reminder.frequency,
          reminder.reminderHour,
          reminder.customDays
        );
        updatedReminder.status = "active"; // Set back to active for next occurrence
        break;
    }

    await updateReminder(updatedReminder);
    loadRemindersData();
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteReminder(reminderId);
            loadRemindersData();
          },
        },
      ]
    );
  };

  const isDue = (reminder: Reminder): boolean => {
    const now = new Date();
    const reminderDate = new Date(reminder.nextReminder);
    return now >= reminderDate;
  };

  const getFrequencyText = (reminder: Reminder): string => {
    switch (reminder.frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "custom":
        return `Every ${reminder.customDays} days`;
      default:
        return "";
    }
  };

  const formatNextReminder = (dateString: string, reminderHour: number): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const timeDisplay = ` at ${reminderHour.toString().padStart(2, '0')}:00`;

    if (diffDays < 0) {
      return `Overdue${timeDisplay}`;
    } else if (diffDays === 0) {
      return `Today${timeDisplay}`;
    } else if (diffDays === 1) {
      return `Tomorrow${timeDisplay}`;
    } else {
      return `In ${diffDays} days${timeDisplay}`;
    }
  };

  const renderReminder = (reminder: Reminder) => {
    const due = isDue(reminder);

    return (
      <ThemedView
        key={reminder.id}
        style={[styles.reminderCard, due && styles.dueCard]}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            {reminder.displayType === "icon" && reminder.icon ? (
              <View style={styles.iconContainer}>
                <Ionicons
                  name={reminder.icon as any}
                  size={24}
                  color="#007AFF"
                />
                {reminder.title && (
                  <ThemedText style={styles.reminderTitle}>
                    {reminder.title}
                  </ThemedText>
                )}
              </View>
            ) : (
              reminder.title && (
                <ThemedText style={styles.reminderTitle}>
                  {reminder.title}
                </ThemedText>
              )
            )}
            <View style={styles.reminderMeta}>
              <ThemedText style={styles.frequency}>
                {getFrequencyText(reminder)}
              </ThemedText>
              <ThemedText style={[styles.nextReminder, due && styles.dueText]}>
                {formatNextReminder(reminder.nextReminder, reminder.reminderHour)}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteReminder(reminder.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {due && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.tomorrowButton]}
              onPress={() => handleReminderAction(reminder, "tomorrow")}
            >
              <Ionicons name="time-outline" size={16} color="#FF9500" />
              <Text style={styles.actionButtonText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.discardButton]}
              onPress={() => handleReminderAction(reminder, "discard")}
            >
              <Ionicons name="close-outline" size={16} color="#FF3B30" />
              <Text style={styles.actionButtonText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={() => handleReminderAction(reminder, "done")}
            >
              <Ionicons name="checkmark-outline" size={16} color="#34C759" />
              <Text style={styles.actionButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={80} color="#ccc" />
            <ThemedText style={styles.emptyText}>No reminders yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Create reminders with text, icons, or both!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.remindersList}>
            {reminders.map(renderReminder)}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New</Text>
      </TouchableOpacity>

      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={() => {
          loadRemindersData();
          setModalVisible(false);
        }}
        type="reminder"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  scrollView: {
    flex: 1,
    padding: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  remindersList: {
    paddingBottom: 100,
  },
  reminderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reminderInfo: {
    flex: 1,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    minHeight: 32,
    justifyContent: "flex-start",
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#22223b",
    marginLeft: 8,
  },
  reminderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  frequency: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextReminder: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  dueText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  deleteButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: "center",
  },
  tomorrowButton: {
    backgroundColor: "#FFF3E0",
  },
  discardButton: {
    backgroundColor: "#FFEBEE",
  },
  doneButton: {
    backgroundColor: "#E8F5E8",
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
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
});
