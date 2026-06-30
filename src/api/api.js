import axios from "axios";
import { getBaseUrl, loadBaseUrl, normalizeBaseUrl } from "./apiConfig";
import * as storage from "../utils/secureStorage";

const api = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const request = async (endpoint, method = "GET", data = null, headers = {}) => {
  await loadBaseUrl();
  const baseUrl = normalizeBaseUrl(getBaseUrl());
  const url = `${baseUrl}/${endpoint}`;
  const authToken = await storage.getItemAsync("authToken");

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
