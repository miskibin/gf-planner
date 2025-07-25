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
  const [description, setDescription] = useState(item?.description || "");
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
  const [reminderHour, setReminderHour] = useState(
    reminder?.reminderHour || 8
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
    setDescription(item?.description || "");
    setFrequency(reminder?.frequency || "daily");
    setCustomDays(reminder?.customDays?.toString() || "1");
    setDisplayType(reminder?.displayType || "text");
    setSelectedIcon(reminder?.icon || "heart-outline");
    setReminderHour(reminder?.reminderHour || 8);
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
    // For reminders, allow either title OR icon (or both)
    if (type === "reminder") {
      if (!title.trim() && displayType !== "icon") {
        Alert.alert("Error", "Title is required when not using icon display");
        return;
      }
      if (displayType === "icon" && !selectedIcon) {
        Alert.alert("Error", "Please select an icon");
        return;
      }
    } else {
      // For other types, title is still required
      if (!title.trim()) {
        Alert.alert("Error", "Title is required");
        return;
      }
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
          title: title.trim() || undefined,
          frequency,
          customDays:
            frequency === "custom" ? parseInt(customDays) || 1 : undefined,
          displayType,
          icon: displayType === "icon" ? selectedIcon : undefined,
          reminderHour,
          nextReminder: getNextReminderDate(
            frequency,
            reminderHour,
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
    } catch {
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.dragIndicator} />

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>
              {type === "reminder" ? "Title (optional if using icon)" : "Title"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={type === "reminder" ? "Title (optional)" : "Title"}
              value={title}
              onChangeText={setTitle}
              autoFocus={type !== "reminder"}
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

                <Text style={styles.label}>Reminder Time</Text>
                <View style={styles.timeContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeScrollView}
                  >
                    {Array.from({ length: 12 }, (_, i) => i * 2).map((hour) => {
                      const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                      
                      return (
                        <TouchableOpacity
                          key={hour}
                          style={[
                            styles.timeButton,
                            reminderHour === hour && styles.timeButtonActive,
                          ]}
                          onPress={() => setReminderHour(hour)}
                        >
                          <Text
                            style={[
                              styles.timeText,
                              reminderHour === hour && styles.timeTextActive,
                            ]}
                          >
                            {timeLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

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

            {type !== "reminder" && (
              <>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Description (optional)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}

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
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalContent: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  label: {
    fontSize: 15,
    color: "#222",
    marginBottom: 6,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#222",
  },
  descriptionInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
  },
  priorityContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
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
    marginBottom: 20,
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
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
    marginBottom: 20,
    gap: 12,
  },
  displayTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
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
    gap: 12,
    marginBottom: 20,
    justifyContent: "center",
  },
  iconButton: {
    width: 55,
    height: 55,
    borderRadius: 12,
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
  timeContainer: {
    marginBottom: 20,
  },
  timeScrollView: {
    maxHeight: 60,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  timeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  timeTextActive: {
    color: "white",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#22223b",
    alignItems: "center",
    shadowColor: "#22223b",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
