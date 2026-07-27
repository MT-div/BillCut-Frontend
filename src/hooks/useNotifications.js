import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useContext(AuthContext);
  const userId = user?.id; // نعتمد على معرّف المستخدم المباشر لجلب كافة إشعاراته

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchNotifications = useCallback(
    async (isInitial = true) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

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
        // استدعاء الـ API الموحد الجديد لجميع العدادات التابعة للمستخدم
        const response = await apiClient.get("/api/user/notifications/", {
          params: {
            limit: limit,
            offset: currentOffset,
          },
        });

        const newResults = response.data.results || [];
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setNotifications(newResults);
          setOffset(limit);
        } else {
          setNotifications((prev) => [...prev, ...newResults]);
          setOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setHasMore(newResults.length < totalCount);
        } else {
          setHasMore(notifications.length + newResults.length < totalCount);
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message || "تعذر استرداد سجل الإشعارات الموحد.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [userId, offset, notifications.length]
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;
    fetchNotifications(false);
  }, [isLoadingMore, hasMore, isLoading, fetchNotifications]);

  useEffect(() => {
    fetchNotifications(true);
  }, [userId]);

  return {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    loadMore,
    hasMore,
    userId,
  };
}
