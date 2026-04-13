import axios from "axios";
import Toast from "react-native-toast-message";
import { getBaseUrl } from "../api/apiConfig";
import * as storage from "../utils/secureStorage";

const API = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

export const updateAxiosBaseURL = () => {
  API.defaults.baseURL = getBaseUrl();
};

export const createOrder = async (studentId: string, amount: number, subscription: boolean = false) => {
  if (!getBaseUrl().includes("localhost")) {
    updateAxiosBaseURL();
  }

  try {
    const endpoint = subscription ? "/payment/create" : "/payment/parent/create";
    const authToken = await storage.getItemAsync("authToken");
    const { data } = await API.post(endpoint, {
      studentId,
      amount,
    }, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    return data;
  } catch (e: any) {
    const errorMessage = e.response?.data?.message || "Failed to create order";
    Toast.show({
      type: "error",
      text1: "Error",
      text2: errorMessage,
    });
    throw e;
  }
};

export const verifyPayment = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  subscription: boolean;
}) => {
  try {
    const url = payload.subscription ? "/payment/verify" : "/payment/parent/verify";
    const authToken = await storage.getItemAsync("authToken");
    const { data } = await API.post(url, {
      ...payload,
      studentId: await storage.getItemAsync("studentId"),
    }, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
    return data;
  } catch (e: any) {
    Toast.show({ type: "error", text1: "Error", text2: "Payment verification failed" });
    throw e;
  }
};
