import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const canUseLocalStorage = () => {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
};

const canUseSecureStore = async () => {
  if (Platform.OS === "web") {
    return false;
  }

  if (typeof SecureStore.isAvailableAsync !== "function") {
    return false;
  }

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(key);
  }

  if (canUseLocalStorage()) {
    return window.localStorage.getItem(key);
  }

  return null;
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, value);
  }
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  if (canUseLocalStorage()) {
    window.localStorage.removeItem(key);
  }
};
