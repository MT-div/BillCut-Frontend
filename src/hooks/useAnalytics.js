// core/hooks/useAnalytics.js - قبول معرف العداد كمعامل ديناميكي خارجي لمنع جمود الكود

import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";

export function useAnalytics(meterId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // دالة جلب البيانات وتكامل الـ API بالتوقيت الفعلي المباشر
  const fetchAnalyticsData = useCallback(async () => {
    if (!meterId) return;
    setError("");
    try {
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
