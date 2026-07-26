import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export function useDashboard(meterId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // دالة جلب البيانات وتكامل الـ API بالتوقيت الفعلي المباشر
  const fetchDashboardData = useCallback(async () => {
    if (!meterId) return;
    setError('');
    try {
      // تم إلغاء تمرير simulated_date تماماً ليعمل التطبيق كنسخة إنتاجية واقعية وحية
      const response = await apiClient.get(`/api/meter/${meterId}/dashboard/`);
      if (response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "تعذر جلب بيانات لوحة المراقبة حياً.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [meterId]);

  // دالة التحديث عند السحب لأسفل (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // الجلب التلقائي للقراءات الفورية
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    onRefresh
  };
}