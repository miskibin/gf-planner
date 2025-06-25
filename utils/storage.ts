import AsyncStorage from "@react-native-async-storage/async-storage";
import { Item } from "../types";

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
