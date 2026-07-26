import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useContext(AuthContext);
  const meterId = user?.defaultMeterId;

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // حالة تحميل الصفحة التالية
  const [error, setError] = useState("");

  // إعدادات الصفحات
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10; // تحميل 10 إشعارات في كل مرة

  // دالة جلب الصفحة الأولى أو التحديث (Reset & Fetch)
  const fetchNotifications = useCallback(
    async (isInitial = true) => {
      if (!meterId) return;

      if (isInitial) {
        setIsLoading(true);
        setOffset(0);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");
      const currentOffset = isInitial ? 0 : offset;

      try {
        // إرسال الطلب ممرراً حقول الحد والإزاحة في البارامترات للترقيم السحابي
        const response = await apiClient.get(
          `/api/meter/${meterId}/notifications/`,
          {
            params: {
              limit: limit,
              offset: currentOffset,
            },
          }
        );

        const newResults = response.data.results || [];
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setNotifications(newResults);
          setOffset(limit);
        } else {
          setNotifications((prev) => [...prev, ...newResults]); // دمج القائمة الجديدة مع القديمة بالتتابع
          setOffset((prev) => prev + limit);
        }

        // التحقق: هل توجد قراءات أخرى متبقية في السيرفر؟
        if (isInitial) {
          setHasMore(newResults.length < totalCount);
        } else {
          setHasMore(notifications.length + newResults.length < totalCount);
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message || "تعذر استرداد سجل الإشعارات.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [meterId, offset, notifications.length]
  );

  // دالة التحديث الفوري عند السحب للأعلى (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  // دالة جلب وتحميل الصفحة التالية تلقائياً عند النزول لكعب الشاشة (Lazy Load)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;
    fetchNotifications(false);
  }, [isLoadingMore, hasMore, isLoading, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(true);
  }, [meterId]); // يعمل فقط عند قراءة العداد لأول مرة

  return {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    loadMore,
    hasMore,
    meterId,
  };
}
