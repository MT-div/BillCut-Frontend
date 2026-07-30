import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
import { analyticsMapper } from "../api/mappers/analyticsMapper";

export function useAnalytics(meterId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalyticsData = useCallback(async () => {
    if (!meterId) return;
    setError("");
    setIsLoading(true);
    setData(null);
    try {
      const response = await apiClient.get(`/api/meter/${meterId}/analytics/`);
      if (response.data.status === "success") {
        // تحويل وتنسيق بيانات الرسوم البيانية عبر الـ Mapper
        const mappedData = analyticsMapper.toViewModel(response.data.data);
        setData(mappedData);
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
