import Toast from "react-native-toast-message";
import * as storage from "../utils/secureStorage";

let BASE_URL = "https://localhost:5000"; // default fallback

export const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, "");

export const getBaseUrl = () => BASE_URL;

export const loadBaseUrl = async () => {
  try {
    const saved = await storage.getItemAsync("baseUrl");
    if (saved) {
      BASE_URL = normalizeBaseUrl(saved);
    } else {
      // Toast.show({
      //   type: "info",
      //   text1: "Info",
      //   text2: "No base URL saved, using default: " + BASE_URL,
      //   position: "bottom",
      // });
    }
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to load base URL. Please try again.",
      position: "bottom",
    });
  }
  return BASE_URL;
};

export const setBaseUrl = async (url: string) => {
  try {
    const normalizedUrl = normalizeBaseUrl(url);
    BASE_URL = normalizedUrl;
    await storage.setItemAsync("baseUrl", normalizedUrl);
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to save base URL. Please try again.",
      position: "bottom",
    });
  }
};
