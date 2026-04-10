import { BASE_URL } from "@/utils/config";
import axios from "axios";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
