import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { request } from "../api/api";

export const loginUser = async (register_no) => {
  return await request("user/login", "POST", {
    username: register_no,
    password: register_no,
  });
};

export const loginWithOtp = async (register_no, otp) => {
  try {
    const response = await request("user/verify", "POST", {
      username: register_no,
      otp,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getSession = async () => {
  return await request("user/session", "GET");
};

export const clearStoredSession = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("authToken"),
    SecureStore.deleteItemAsync("register_no"),
    SecureStore.deleteItemAsync("studentId"),
    SecureStore.deleteItemAsync("subscription"),
  ]);
};

export const logoutUser = async () => {
  const response = await request("user/logout", "POST");
  await clearStoredSession();
  return response;
};

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || "https://schoolglobalserver-agsoft.onrender.com";
const LOCATION_API = `${API_BASE_URL}/api/location`;

export const searchLocation = async (query) => {
  try {
    const res = await fetch(`${LOCATION_API}?search=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to search locations");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
