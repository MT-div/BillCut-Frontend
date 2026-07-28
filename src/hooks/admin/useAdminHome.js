// core/hooks/admin/useAdminHome.js - إدارة إحصائيات الإدارة المباشرة (خالٍ تماماً من المحاكاة)

import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

export function useAdminHome() {
  const [stats, setStats] = useState({ usersCount: 0, metersCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // جلب الإحصائيات الحية للوحة التحكم
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get("/api/admin/stats/");
      if (response.data.status === "success") {
        setStats(response.data.data);
      }
    } catch (err) {
      setError("تعذر استرجاع الإحصائيات السحابية.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetchStats: fetchStats,
  };
}
