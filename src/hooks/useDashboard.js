import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";
import { dashboardMapper } from "../api/mappers/dashboardMapper";

export function useDashboard(meterId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    if (!meterId) return;
    setError("");
    try {
      const response = await apiClient.get(`/api/meter/${meterId}/dashboard/`);
      if (response.data.status === "success") {
        // تحويل وتنسيق البيانات الخام عبر الـ Mapper
        const mappedData = dashboardMapper.toViewModel(response.data.data);
        setData(mappedData);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "تعذر جلب بيانات لوحة المراقبة حياً.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [meterId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
  };
}
