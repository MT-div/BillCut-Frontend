import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useSettings() {
  const { user, logout } = useContext(AuthContext);
  const userId = user?.id;
  const meterId = user?.defaultMeterId;

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // أ. حالات الملف الشخصي والأمان (تحديث الحساب)
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ب. حالات الميزانية بالليرة السورية
  const [targetBudget, setTargetBudget] = useState("");

  // ج. حالات تفضيلات إشعارات الدفع الخارجية (Toggles)
  const [budgetPush, setBudgetPush] = useState(true);
  const [tierPush, setTierPush] = useState(true);
  const [anomalyPush, setAnomalyPush] = useState(true);

  // دالة جلب البيانات والتفضيلات الحالية للمستخدم من السيرفر عند التهيئة
  const fetchUserSettings = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      // 1. جلب إعدادات الإشعارات التراكمية
      const resSettings = await apiClient.get(
        `/api/user/${userId}/notification_settings/`
      );
      if (resSettings.data.status === "success") {
        const d = resSettings.data.data;
        setBudgetPush(d.budgetPushEnabled);
        setTierPush(d.tierPushEnabled);
        setAnomalyPush(d.anomalyPushEnabled);
      }

      // 2. جلب قيمة الميزانية الحالية المحددة للعداد إن وجدت
      if (meterId) {
        const resBudget = await apiClient.get(
          `/api/meter/${meterId}/dashboard/`
        );
        if (
          resBudget.data.status === "success" &&
          resBudget.data.data.avgBudgetTargetKWh !== "0.00"
        ) {
          // جلب قيمة الميزانية الحالية الفعالة من السيرفر وعرضها
          // سنتركها فارغة للإدخال الجديد أو نعرضها كقيمة توضيحية
        }
      }
    } catch (err) {
      console.log("فشل استرجاع الإعدادات من السيرفر:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, meterId]);

  // دالة تحديث بيانات الملف الشخصي (رقم الهاتف وكلمة المرور)
  const handleUpdateProfile = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPhone.trim() || !currentPassword.trim()) {
      setErrorMsg(
        "يرجى إدخال رقم الهاتف الجديد وكلمة المرور الحالية لتأكيد التعديل."
      );
      return;
    }

    try {
      const response = await apiClient.post("/api/user/profile/update/", {
        username: user?.username,
        newPhone: newPhone.trim(),
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (response.data.status === "success") {
        setSuccessMsg("تم تحديث بيانات ملفك الشخصي وأمان الحساب بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "تعذر تحديث الملف الشخصي، يرجى المحاولة لاحقاً.";
      setErrorMsg(msg);
    }
  };

  // دالة تحديث ميزانية العداد وحساب الاستهلاك المعادل تلقائياً
  const handleUpdateBudget = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!targetBudget.trim() || isNaN(targetBudget)) {
      setErrorMsg(
        "يرجى إدخال قيمة مالية صالحة للميزانية المستهدفة بالليرة السورية."
      );
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/meter/${meterId}/budget/set/`,
        {
          targetBudgetSYP: parseFloat(targetBudget),
        }
      );

      if (response.data.status === "success") {
        setSuccessMsg(
          `تم حفظ ميزانيتك الجديدة بنجاح، سقف استهلاكك المعادل هو ${response.data.data.equivalentLimitKWh} ك.و.س.`
        );
        setTargetBudget("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "تعذر حفظ الميزانية الجديدة.";
      setErrorMsg(msg);
    }
  };

  // دالة التحديث التفاعلي اللحظي والآمن لتفضيلات الإشعارات (Toggles)
  const handleTogglePreference = async (field, currentValue) => {
    const newValue = !currentValue;

    // تحديث الحالة المحلية في الهاتف فوراً لسرعة العرض (Optimistic UI)
    if (field === "budget") setBudgetPush(newValue);
    if (field === "tier") setTierPush(newValue);
    if (field === "anomaly") setAnomalyPush(newValue);

    try {
      // إرسال طلب تحديث صامت للسيرفر لمزامنة قاعدة البيانات
      await apiClient.post(`/api/user/${userId}/notification_settings/`, {
        budgetPushEnabled: field === "budget" ? newValue : budgetPush,
        tierPushEnabled: field === "tier" ? newValue : tierPush,
        anomalyPushEnabled: field === "anomaly" ? newValue : anomalyPush,
      });
    } catch (err) {
      console.log("فشل مزامنة تفضيلات الإشعارات مع السيرفر:", err);
      // التراجع عن التعديل في حال الفشل
      if (field === "budget") setBudgetPush(currentValue);
      if (field === "tier") setTierPush(currentValue);
      if (field === "anomaly") setAnomalyPush(currentValue);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  return {
    isLoading,
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
    newPhone,
    setNewPhone,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    targetBudget,
    setTargetBudget,
    budgetPush,
    tierPush,
    anomalyPush,
    handleUpdateProfile,
    handleUpdateBudget,
    handleTogglePreference,
    logout,
    user,
  };
}
