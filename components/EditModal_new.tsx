import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Item, Reminder } from "../types";
import {
  addItem,
  addReminder,
  getNextReminderDate,
  updateItem,
  updateReminder,
} from "../utils/storage";

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: Item;
  reminder?: Reminder;
  type: "events" | "wishlist" | "likes" | "reminder";
}

export default function EditModal({
  visible,
  onClose,
  onSave,
  item,
  reminder,
  type,
}: EditModalProps) {
  const [title, setTitle] = useState(item?.title || reminder?.title || "");
  const [date, setDate] = useState(item?.date || "");
  const [priority, setPriority] = useState<"high" | "medium" | "low">(
    item?.priority || "medium"
  );
  const [description, setDescription] = useState(
    item?.description || reminder?.description || ""
  );
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Reminder-specific state
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    reminder?.frequency || "daily"
  );
  const [customDays, setCustomDays] = useState(
    reminder?.customDays?.toString() || "1"
  );
  const [displayType, setDisplayType] = useState<"icon" | "text">(
    reminder?.displayType || "text"
  );
  const [selectedIcon, setSelectedIcon] = useState(
    reminder?.icon || "heart-outline"
  );

  const iconOptions = [
    "heart-outline",
    "flower-outline",
    "gift-outline",
    "restaurant-outline",
    "call-outline",
    "car-outline",
    "home-outline",
    "fitness-outline",
    "book-outline",
    "musical-notes-outline",
    "calendar-outline",
    "time-outline",
  ];

  const handleClose = useCallback(() => {
    setTitle(item?.title || reminder?.title || "");
    setDate(item?.date || "");
    setPriority(item?.priority || "medium");
    setDescription(item?.description || reminder?.description || "");
    setFrequency(reminder?.frequency || "daily");
    setCustomDays(reminder?.customDays?.toString() || "1");
    setDisplayType(reminder?.displayType || "text");
    setSelectedIcon(reminder?.icon || "heart-outline");
    onClose();
  }, [item, reminder, onClose]);

  // Handle Android back button
  useEffect(() => {
    if (visible) {
      const backAction = () => {
        handleClose();
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }
  }, [visible, handleClose]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    try {
      if (type === "reminder") {
        const reminderData: Omit<
          Reminder,
          | "id"
          | "createdAt"
          | "completedCount"
          | "snoozeCount"
          | "discardedCount"
        > = {
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          customDays:
            frequency === "custom" ? parseInt(customDays) || 1 : undefined,
          displayType,
          icon: displayType === "icon" ? selectedIcon : undefined,
          nextReminder: getNextReminderDate(
            frequency,
            8, // Default hour
            frequency === "custom" ? parseInt(customDays) || 1 : undefined
          ),
          status: "active",
        };

        if (reminder) {
          await updateReminder({ ...reminder, ...reminderData });
        } else {
          await addReminder(reminderData);
        }
      } else {
        const itemData: Omit<Item, "id" | "createdAt"> = {
          title: title.trim(),
          description: description.trim() || undefined,
        };

        if (type === "events") {
          itemData.date = date.trim() || undefined;
        }

        if (type === "wishlist") {
          itemData.priority = priority;
        }

        if (item) {
          await updateItem(getStorageKey(), { ...item, ...itemData });
        } else {
          await addItem(getStorageKey(), itemData);
        }
      }

      onSave();
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save. Please try again.");
    }
  };

  const getStorageKey = () => {
    switch (type) {
      case "events":
        return "events";
      case "wishlist":
        return "wishlist";
      case "likes":
        return "likes";
      default:
        return "events";
    }
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate.toISOString().split("T")[0]);
    setDatePickerVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.modal}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            {type === "events" && (
              <>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <Text style={{ color: date ? "#222" : "#666", fontSize: 16 }}>
                    {date ? date : "Pick a date"}
                  </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={datePickerVisible}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={() => setDatePickerVisible(false)}
                />
              </>
            )}

            {type === "wishlist" && (
              <>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityContainer}>
                  {(["high", "medium", "low"] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonActive,
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          priority === p && styles.priorityTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {type === "reminder" && (
              <>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                  {(["daily", "weekly", "custom"] as const).map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.frequencyButton,
                        frequency === f && styles.frequencyButtonActive,
                      ]}
                      onPress={() => setFrequency(f)}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          frequency === f && styles.frequencyTextActive,
                        ]}
                      >
                        {f === "custom"
                          ? "Custom"
                          : f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {frequency === "custom" && (
                  <>
                    <Text style={styles.label}>Every N days</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Number of days"
                      value={customDays}
                      onChangeText={setCustomDays}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <Text style={styles.label}>Display Type</Text>
                <View style={styles.displayTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.displayTypeButton,
                      displayType === "text" && styles.displayTypeButtonActive,
                    ]}
                    onPress={() => setDisplayType("text")}
                  >
                    <Text
                      style={[
                        styles.displayTypeText,
                        displayType === "text" && styles.displayTypeTextActive,
                      ]}
                    >
                      Text Only
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.displayTypeButton,
                      displayType === "icon" && styles.displayTypeButtonActive,
                    ]}
                    onPress={() => setDisplayType("icon")}
                  >
                    <Text
                      style={[
                        styles.displayTypeText,
                        displayType === "icon" && styles.displayTypeTextActive,
                      ]}
                    >
                      With Icon
                    </Text>
                  </TouchableOpacity>
                </View>

                {displayType === "icon" && (
                  <>
                    <Text style={styles.label}>Choose Icon</Text>
                    <View style={styles.iconContainer}>
                      {iconOptions.map((iconName) => (
                        <TouchableOpacity
                          key={iconName}
                          style={[
                            styles.iconButton,
                            selectedIcon === iconName &&
                              styles.iconButtonActive,
                          ]}
                          onPress={() => setSelectedIcon(iconName)}
                        >
                          <Ionicons
                            name={iconName as any}
                            size={24}
                            color={
                              selectedIcon === iconName ? "#007AFF" : "#666"
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: "100%",
  },
  modal: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#222",
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#222",
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
  },
  priorityContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  priorityButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  priorityText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  priorityTextActive: {
    color: "white",
    fontWeight: "600",
  },
  frequencyContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  frequencyButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  frequencyText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  frequencyTextActive: {
    color: "white",
    fontWeight: "600",
  },
  displayTypeContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  displayTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  displayTypeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  displayTypeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  displayTypeTextActive: {
    color: "white",
    fontWeight: "600",
  },
  iconContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  iconButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#22223b",
    alignItems: "center",
    shadowColor: "#22223b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
