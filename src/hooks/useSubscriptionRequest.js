import { useState } from "react";
import apiClient from "../api/apiClient";

export const SYRIAN_GOVERNORATES = [
  "دمشق",
  "ريف دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "إدلب",
  "درعا",
  "السويداء",
  "القنيطرة",
  "دير الزور",
  "الحسكة",
  "الرقة",
];

export function useSubscriptionRequest() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [governorate, setGovernorate] = useState("دمشق");
  const [detailedAddress, setDetailedAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (navigation) => {
    setError("");
    if (!fullName.trim() || !phoneNumber.trim() || !detailedAddress.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post(
        "/api/public/subscription_requests/create/",
        {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          governorate: governorate,
          detailedAddress: detailedAddress.trim(),
        }
      );

      if (response.data.status === "success") {
        setSuccessMessage(response.data.message);
        setIsSuccessModalVisible(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "فشلت عملية تقديم طلب الاشتراك.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = (navigation) => {
    setIsSuccessModalVisible(false);
    setFullName("");
    setPhoneNumber("");
    setDetailedAddress("");
    navigation.navigate("Login"); // العودة لصفحة الدخول
  };

  return {
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    governorate,
    setGovernorate,
    detailedAddress,
    setDetailedAddress,
    isLoading,
    error,
    isSuccessModalVisible,
    successMessage,
    handleSubmit,
    handleCloseSuccess,
  };
}
