import { useState, useEffect, useCallback } from "react";
import apiClient from "../api/apiClient";

export function useDashboard(meterId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // الاحتفاظ بتاريخ محاكاة افتراضي لغايات الفحص والتجريب العملي (يمكن تغييره لرؤية دورات مختلفة!)
  const [simulatedDate, setSimulatedDate] = useState("2026-07-26");

  // دالة جلب البيانات وتكامل الـ API
  const fetchDashboardData = useCallback(
    async (dateParam = simulatedDate) => {
      setError("");
      try {
        const response = await apiClient.get(
          `/api/meter/${meterId}/dashboard/`,
          {
            params: { simulated_date: dateParam },
          }
        );
        if (response.data.status === "success") {
          setData(response.data.data);
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message || "تعذر جلب بيانات لوحة المراقبة حياً.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [meterId, simulatedDate]
  );

  // دالة السحب للأسفل للتحديث الفوري التفاعلي (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // تشغيل الجلب التلقائي للبيانات عند تهيئة الشاشة
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // دالة مخصصة لتمكين السفر عبر الزمن والتبديل بين التواريخ لمحاكاة سيناريوهات الفحص المختلفة
  const handleTimeTravel = (newDate) => {
    setIsLoading(true);
    setSimulatedDate(newDate);
    fetchDashboardData(newDate);
  };

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    simulatedDate,
    onRefresh,
    handleTimeTravel,
  };
}
