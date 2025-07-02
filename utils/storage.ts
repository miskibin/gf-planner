import AsyncStorage from "@react-native-async-storage/async-storage";
import { Item, Reminder } from "../types";

export const loadItems = async (key: string): Promise<Item[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading items:", error);
    return [];
  }
};

export const saveItems = async (key: string, items: Item[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving items:", error);
  }
};

export const addItem = async (
  key: string,
  item: Omit<Item, "id" | "createdAt">
): Promise<void> => {
  const items = await loadItems(key);
  const newItem: Item = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  await saveItems(key, items);
};

export const updateItem = async (
  key: string,
  updatedItem: Item
): Promise<void> => {
  const items = await loadItems(key);
  const index = items.findIndex((item) => item.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    await saveItems(key, items);
  }
};

export const deleteItem = async (
  key: string,
  itemId: string
): Promise<void> => {
  const items = await loadItems(key);
  const filteredItems = items.filter((item) => item.id !== itemId);
  await saveItems(key, filteredItems);
};

// Reminder-specific functions
export const loadReminders = async (): Promise<Reminder[]> => {
  try {
    const data = await AsyncStorage.getItem("reminders");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading reminders:", error);
    return [];
  }
};

export const saveReminders = async (reminders: Reminder[]): Promise<void> => {
  try {
    await AsyncStorage.setItem("reminders", JSON.stringify(reminders));
  } catch (error) {
    console.error("Error saving reminders:", error);
  }
};

export const addReminder = async (
  reminder: Omit<
    Reminder,
    "id" | "createdAt" | "completedCount" | "snoozeCount" | "discardedCount"
  >
): Promise<void> => {
  const reminders = await loadReminders();
  const newReminder: Reminder = {
    ...reminder,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    completedCount: 0,
    snoozeCount: 0,
    discardedCount: 0,
  };
  reminders.unshift(newReminder);
  await saveReminders(reminders);
};

export const updateReminder = async (
  updatedReminder: Reminder
): Promise<void> => {
  const reminders = await loadReminders();
  const index = reminders.findIndex(
    (reminder) => reminder.id === updatedReminder.id
  );
  if (index !== -1) {
    reminders[index] = updatedReminder;
    await saveReminders(reminders);
  }
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
  const reminders = await loadReminders();
  const filteredReminders = reminders.filter(
    (reminder) => reminder.id !== reminderId
  );
  await saveReminders(filteredReminders);
};

export const getNextReminderDate = (
  frequency: "daily" | "weekly" | "custom",
  reminderHour: number,
  customDays?: number
): string => {
  const now = new Date();
  const nextDate = new Date(now);

  switch (frequency) {
    case "daily":
      nextDate.setDate(now.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(now.getDate() + 7);
      break;
    case "custom":
      if (customDays && customDays > 0) {
        nextDate.setDate(now.getDate() + customDays);
      } else {
        nextDate.setDate(now.getDate() + 1);
      }
      break;
  }

  nextDate.setHours(reminderHour, 0, 0, 0);
  return nextDate.toISOString();
};
