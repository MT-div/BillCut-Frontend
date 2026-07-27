import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export function useSettings() {
  const { user, logout } = useContext(AuthContext);
  const userId = user?.id;
  const meterId = user?.defaultMeterId;

  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // أ. حالات كارت رقم الهاتف (مستقلة تماماً - لها كلمة مرورها الخاصة)
  // ============================================================
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || "");
  const [phoneCurrentPassword, setPhoneCurrentPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneSuccess, setPhoneSuccess] = useState("");
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);

  // ============================================================
  // ب. حالات كارت كلمة المرور (مستقلة تماماً)
  // ============================================================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // أخطاء منفصلة لكل حقل بدل رسالة عامة مربوطة بحقل واحد فقط
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState(""); // خطأ عام (من السيرفر مثلاً)
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // ============================================================
  // ج. حالات كارت الميزانية
  // ============================================================
  const [targetBudget, setTargetBudget] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [budgetSuccess, setBudgetSuccess] = useState("");
  const [isBudgetSubmitting, setIsBudgetSubmitting] = useState(false);

  // ============================================================
  // د. تفضيلات إشعارات الدفع (Toggles) - كائن واحد لتفادي الـ race condition
  // ============================================================
  const [notificationPrefs, setNotificationPrefs] = useState({
    budgetPush: true,
    tierPush: true,
    anomalyPush: true,
  });

  const fetchUserSettings = useCallback(async () => {
    if (!userId) {
      // إصلاح: كنا نرجع بدون تصفير isLoading، ما يسبب شاشة تحميل معلقة للأبد
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const resSettings = await apiClient.get(
        `/api/user/${userId}/notification_settings/`
      );
      if (resSettings.data.status === "success") {
        const d = resSettings.data.data;
        setNotificationPrefs({
          budgetPush: d.budgetPushEnabled,
          tierPush: d.tierPushEnabled,
          anomalyPush: d.anomalyPushEnabled,
        });
      }
    } catch (err) {
      console.log("فشل استرجاع الإعدادات:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ------------------------------------------------------------
  // 1. خدمة تعديل رقم الهاتف (endpoint مستقل تماماً)
  // ------------------------------------------------------------
  const handleUpdatePhone = async () => {
    setPhoneError("");
    setPhoneSuccess("");

    if (!newPhone.trim()) {
      setPhoneError("حقل رقم الهاتف مطلوب لتعديله.");
      return;
    }
    if (!phoneCurrentPassword.trim()) {
      setPhoneError("يرجى إدخال كلمة المرور الحالية لتأكيد التعديل.");
      return;
    }

    setIsPhoneSubmitting(true);
    try {
      const response = await apiClient.post("/api/user/phone/update/", {
        newPhone: newPhone.trim(),
        currentPassword: phoneCurrentPassword.trim(),
      });

      if (response.data.status === "success") {
        setPhoneSuccess("تم تحديث رقم الهاتف ومزامنة حسابك بنجاح.");
        setPhoneCurrentPassword("");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "تعذر التعديل، يرجى التحقق من كلمة المرور المدخلة.";
      setPhoneError(msg);
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // 2. خدمة تعديل كلمة المرور (endpoint مستقل تماماً)
  // ------------------------------------------------------------
  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const fieldErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let hasError = false;

    if (!currentPassword.trim()) {
      fieldErrors.currentPassword = "هذا الحقل مطلوب.";
      hasError = true;
    }
    if (!newPassword.trim()) {
      fieldErrors.newPassword = "هذا الحقل مطلوب.";
      hasError = true;
    } else if (newPassword.trim().length < 8) {
      fieldErrors.newPassword = "يجب ألا تقل كلمة المرور عن 8 أحرف.";
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      fieldErrors.confirmPassword = "هذا الحقل مطلوب.";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword =
        "كلمة المرور الجديدة وتأكيدها غير متطابقين.";
      hasError = true;
    }

    if (hasError) {
      setPasswordFieldErrors(fieldErrors);
      return;
    }
    setPasswordFieldErrors(fieldErrors);

    setIsPasswordSubmitting(true);
    try {
      const response = await apiClient.post("/api/user/password/update/", {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      if (response.data.status === "success") {
        setPasswordSuccess("تم تعديل وتحديث كلمة المرور بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "تعذر التحديث، يرجى التأكد من كلمة المرور الحالية.";
      setPasswordError(msg);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // 3. خدمة تعديل ميزانية العداد
  // ------------------------------------------------------------
  const handleUpdateBudget = async () => {
    setBudgetError("");
    setBudgetSuccess("");

    const trimmed = targetBudget.trim();
    if (!trimmed || isNaN(trimmed) || Number(trimmed) <= 0) {
      setBudgetError("يرجى إدخال قيمة مالية صالحة بالليرة السورية.");
      return;
    }

    setIsBudgetSubmitting(true);
    try {
      const response = await apiClient.post(
        `/api/meter/${meterId}/budget/set/`,
        { targetBudgetSYP: parseFloat(trimmed) }
      );

      if (response.data.status === "success") {
        setBudgetSuccess(
          `تم حفظ ميزانيتك، سقف استهلاكك الجديد هو ${response.data.data.equivalentLimitKWh} ك.و.س.`
        );
        setTargetBudget("");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "تعذر حفظ الميزانية.";
      setBudgetError(msg);
    } finally {
      setIsBudgetSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // 4. تبديل تفضيلات الإشعارات - يعتمد على أحدث state دائماً (functional update)
  //    هذا يحل مشكلة الـ race condition عند الضغط السريع المتتالي
  // ------------------------------------------------------------
  const handleTogglePreference = (field) => {
    setNotificationPrefs((prev) => {
      const updated = { ...prev, [field]: !prev[field] };

      // إرسال الطلب بالاعتماد على القيم المحدّثة فعلياً (لا نستخدم متغيرات قديمة من الإغلاق)
      apiClient
        .post(`/api/user/${userId}/notification_settings/`, {
          budgetPushEnabled: updated.budgetPush,
          tierPushEnabled: updated.tierPush,
          anomalyPushEnabled: updated.anomalyPush,
        })
        .catch(() => {
          // إذا فشل الطلب، أعد الحالة لما كانت عليه قبل التبديل
          setNotificationPrefs((current) => ({
            ...current,
            [field]: prev[field],
          }));
        });

      return updated;
    });
  };

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  return {
    isLoading,
    // هاتف
    newPhone,
    setNewPhone,
    phoneCurrentPassword,
    setPhoneCurrentPassword,
    phoneError,
    phoneSuccess,
    isPhoneSubmitting,
    handleUpdatePhone,
    // كلمة مرور
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordFieldErrors,
    passwordError,
    passwordSuccess,
    isPasswordSubmitting,
    handleUpdatePassword,
    // ميزانية
    targetBudget,
    setTargetBudget,
    budgetError,
    budgetSuccess,
    isBudgetSubmitting,
    handleUpdateBudget,
    // إشعارات
    notificationPrefs,
    handleTogglePreference,
    // عام
    logout,
    user,
  };
}
