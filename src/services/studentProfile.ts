import axios from "axios";
import Toast from "react-native-toast-message";
import { getBaseUrl, loadBaseUrl } from "../api/apiConfig";

const handleApiError = (error: any, context: string) => {
  let message = "Something went wrong";

  if (axios.isAxiosError(error)) {
    if (error.response) {
      message = error.response.data?.message || `Server error while fetching ${context}`;
    } else if (error.request) {
      message = `No response from server while fetching ${context}`;
    } else {
      message = `Request setup failed for ${context}`;
    }
  } else {
    message = `Unexpected error while fetching ${context}`;
  }

  Toast.show({
    type: "error",
    text1: "Error",
    text2: message,
    position: "bottom",
  });

  throw new Error(message);
};

export const getStudentProfile = async (regNo: string) => {
  if (!regNo) {
    return;
  }

  try {
    await loadBaseUrl();
    const baseUrl = getBaseUrl().trim();
    const url = `${baseUrl}/student/profile/${regNo}`;
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Student Profile");
    throw error;
  }
};

export const getStudentTransactions = async (
  regNo: string,
  page = 1,
  pageSize = 10
) => {
  if (!regNo) {
    return;
  }

  try {
    await loadBaseUrl();
    const baseUrl = getBaseUrl().trim();
    const url = `${baseUrl}/student/student-transaction/${regNo}`;
    const response = await axios.get(url, {
      withCredentials: true,
      params: { page, pageSize },
    });

    return response.data;
  } catch (error: any) {
    handleApiError(error, "Student Transactions");
  }
};
