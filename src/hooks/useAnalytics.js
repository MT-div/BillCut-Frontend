import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useAnalytics() {
  const { user } = useContext(AuthContext);
  const meterId = user?.defaultMeterId; // قراءة معرف العداد المربوط بالحساب ديناميكياً

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // دالة جلب بيانات التحليلات والرسوم البيانية
  const fetchAnalyticsData = useCallback(async () => {
    if (!meterId) return;
    setError("");
    try {
      // التخاطب السحابي بالتوقيت الفعلي المباشر (خالٍ تماماً من المحاكاة)
      const response = await apiClient.get(`/api/meter/${meterId}/analytics/`);
      if (response.data.status === "success") {
        setData(response.data.data);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "تعذر استرداد التحليلات والرسوم البيانية.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [meterId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    meterId,
  };
}
