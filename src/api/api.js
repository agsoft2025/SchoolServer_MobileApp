import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getBaseUrl, loadBaseUrl } from "./apiConfig";

const api = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const request = async (endpoint, method = "GET", data = null, headers = {}) => {
  await loadBaseUrl();
  const baseUrl = getBaseUrl().trim();
  const url = `${baseUrl}/${endpoint}`;
  const authToken = await SecureStore.getItemAsync("authToken");

  try {
    const res = await api({
      url,
      method,
      data,
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    if (err.response) {
      return {
        success: false,
        status: err.response.status,
        message: err.response.data?.message || "Request failed",
      };
    }

    return {
      success: false,
      status: 0,
      message: "Network error or server unreachable",
    };
  }
};
