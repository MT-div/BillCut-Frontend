import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useContext(AuthContext);
  const meterId = user?.defaultMeterId; // قراءة معرف العداد المربوط بالحساب ديناميكياً

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // دالة جلب وقراءة سجل الإشعارات التراكمي
  const fetchNotifications = useCallback(async () => {
    if (!meterId) return;
    setError("");
    try {
      const response = await apiClient.get(
        `/api/meter/${meterId}/notifications/`
      );
      if (response.data.status === "success") {
        setNotifications(response.data.data);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "تعذر استرداد سجل الإشعارات.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [meterId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    meterId,
  };
}
