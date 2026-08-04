import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminHome() {
  const [stats, setStats] = useState({ usersCount: 0, metersCount: 0 });
  const [thresholdData, setThresholdData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [customTargetMeanInput, setCustomTargetMeanInput] = useState("");
  const [isUpdatingThreshold, setIsUpdatingThreshold] = useState(false);
  const [thresholdSuccessMsg, setThresholdSuccessMsg] = useState("");
  const [thresholdErrorMsg, setThresholdErrorMsg] = useState("");

  const fetchAdminHomeData = useCallback(async () => {
    setError("");

    // 1. جلب الإحصائيات الأساسية فورياً ودون تعطيل
    try {
      const resStats = await apiClient.get("/api/admin/stats/");
      if (resStats.data.status === "success") {
        setStats(adminMapper.toStatsViewModel(resStats.data.data));
      }
    } catch (errStats) {
      console.log("فشل جلب الإحصائيات:", errStats);
    }

    // 2. جلب العتبة وصورة رسم Matplotlib بشكل مستقل
    try {
      const resThreshold = await apiClient.get("/api/admin/anomaly_threshold/");
      if (resThreshold.data.status === "success") {
        setThresholdData(
          adminMapper.toThresholdViewModel(resThreshold.data.data)
        );
      }
    } catch (errThreshold) {
      const errMsg =
        errThreshold.response?.data?.message ||
        "تعذر استرجاع رسم العتبة التناسبة.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAdminHomeData();
  }, [fetchAdminHomeData]);

  const handleUpdateThreshold = async () => {
    setThresholdErrorMsg("");
    setThresholdSuccessMsg("");
    setIsUpdatingThreshold(true);

    try {
      const response = await apiClient.post("/api/admin/anomaly_threshold/", {
        customTargetMean: customTargetMeanInput.trim() || null,
        regionName: "المنطقة المحلية / سوريا",
      });

      if (response.data.status === "success") {
        setThresholdSuccessMsg(response.data.message);
        setCustomTargetMeanInput("");
        fetchAdminHomeData(); // تحديث الصورة والأرقام حياً
      }
    } catch (err) {
      setThresholdErrorMsg(
        err.response?.data?.message || "فشلت عملية التكييف."
      );
    } finally {
      setIsUpdatingThreshold(false);
    }
  };

  useEffect(() => {
    fetchAdminHomeData();
  }, [fetchAdminHomeData]);

  return {
    stats,
    thresholdData,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    refetchStats: fetchAdminHomeData,
    customTargetMeanInput,
    setCustomTargetMeanInput,
    isUpdatingThreshold,
    thresholdSuccessMsg,
    thresholdErrorMsg,
    handleUpdateThreshold,
  };
}
