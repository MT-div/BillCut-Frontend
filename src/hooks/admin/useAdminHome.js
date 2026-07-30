import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminHome() {
  const [stats, setStats] = useState({ usersCount: 0, metersCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setError("");
    try {
      const response = await apiClient.get("/api/admin/stats/");
      if (response.data.status === "success") {
        const mappedStats = adminMapper.toStatsViewModel(response.data.data);
        setStats(mappedStats);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "تعذر استرجاع الإحصائيات السحابية.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    refetchStats: fetchStats,
  };
}
