import { useState, useEffect, useCallback, useContext } from "react";
import apiClient from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";
import { settingsMapper } from "../api/mappers/settingsMapper";

export function useSettings() {
  const { user, logout, updateUserData } = useContext(AuthContext);
  const userId = user?.id;

  const [isLoading, setIsLoading] = useState(true);

  // أ. حالات كارت رقم الهاتف
  const [newPhone, setNewPhone] = useState(user?.phoneNumber || "");
  const [phoneCurrentPassword, setPhoneCurrentPassword] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneSuccess, setPhoneSuccess] = useState("");
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false);

  // ب. حالات كارت كلمة المرور
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // ج. حالات كارت الميزانية
  const [activeBudgetMeterId, setActiveBudgetMeterId] = useState(
    user?.defaultMeterId || ""
  );
  const [targetBudget, setTargetBudget] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [budgetSuccess, setBudgetSuccess] = useState("");
  const [isBudgetSubmitting, setIsBudgetSubmitting] = useState(false);

  // د. تفضيلات إشعارات الدفع (Toggles)
  const [notificationPrefs, setNotificationPrefs] = useState({
    budgetPush: true,
    tierPush: true,
    anomalyPush: true,
  });

  // هـ. حالات النافذة المنبثقة لتعديل اسم العداد (Modal)
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [meterToRename, setMeterToRename] = useState(null);
  const [newAliasInput, setNewAliasInput] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const fetchUserSettings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const resSettings = await apiClient.get(
        `/api/user/${userId}/notification_settings/`
      );
      if (resSettings.data.status === "success") {
        const mappedPrefs = settingsMapper.toDomain(resSettings.data.data);
        setNotificationPrefs(mappedPrefs);
      }
    } catch (err) {
      console.log("فشل استرجاع الإعدادات:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 1. تعديل الهاتف مع المسح الموضعي للأخطاء
  const handlePhoneChange = (text) => {
    setNewPhone(text);
    if (phoneError) setPhoneError("");
    if (phoneSuccess) setPhoneSuccess("");
  };

  const handleUpdatePhone = async () => {
    setPhoneError("");
    setPhoneSuccess("");
    if (!newPhone.trim()) return setPhoneError("حقل رقم الهاتف مطلوب.");
    if (!phoneCurrentPassword.trim())
      return setPhoneError("يرجى إدخال كلمة المرور لتأكيد التعديل.");

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
      setPhoneError(err.response?.data?.message || "فشل التعديل.");
    } finally {
      setIsPhoneSubmitting(false);
    }
  };

  // 2. تعديل كلمة المرور
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
      fieldErrors.newPassword = "يجب ألا تقل عن 8 أحرف.";
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      fieldErrors.confirmPassword = "هذا الحقل مطلوب.";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = "كلمتا المرور غير متطابقتين.";
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
        setPasswordSuccess("تم تحديث كلمة المرور بنجاح.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "فشلت العملية.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // 3. تعديل الميزانية
  const handleUpdateBudget = async () => {
    setBudgetError("");
    setBudgetSuccess("");
    if (!activeBudgetMeterId) return setBudgetError("يرجى تحديد العداد أولاً.");

    const trimmed = targetBudget.trim();
    if (!trimmed || isNaN(trimmed) || Number(trimmed) <= 0) {
      setBudgetError("يرجى إدخال قيمة مالية صالحة بالليرة السورية.");
      return;
    }

    setIsBudgetSubmitting(true);
    try {
      const response = await apiClient.post(
        `/api/meter/${activeBudgetMeterId}/budget/set/`,
        {
          targetBudgetSYP: parseFloat(trimmed),
        }
      );
      if (response.data.status === "success") {
        setBudgetSuccess(
          `تم حفظ ميزانيتك، سقف استهلاكك الجديد هو ${response.data.data.equivalentLimitKWh} ك.و.س.`
        );
        setTargetBudget("");
      }
    } catch (err) {
      setBudgetError(err.response?.data?.message || "تعذر حفظ الميزانية.");
    } finally {
      setIsBudgetSubmitting(false);
    }
  };

  // 4. تعديل الاسم المستعار للعداد
  const handleRenameMeter = async () => {
    if (!newAliasInput.trim() || !meterToRename) return;
    setIsRenaming(true);
    try {
      const response = await apiClient.put(
        `/api/user/meter/preferences/${meterToRename.preferenceId}/`,
        {
          alias: newAliasInput.trim(),
        }
      );
      if (response.data.status === "success") {
        const updatedMeters = (user?.meters || []).map((m) =>
          m.meterId === meterToRename.meterId
            ? { ...m, alias: newAliasInput.trim() }
            : m
        );
        await updateUserData(updatedMeters, null);
        setIsRenameModalVisible(false);
        setMeterToRename(null);
        setNewAliasInput("");
      }
    } catch (err) {
      console.log("تعذر التعديل:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  // 5. تعيين العداد كافتراضي
  const handleSetDefaultMeter = async (preferenceId, targetMeterId) => {
    try {
      const response = await apiClient.put(
        `/api/user/meter/preferences/${preferenceId}/`,
        {
          isDefault: true,
        }
      );
      if (response.data.status === "success") {
        const updatedMeters = (user?.meters || []).map((m) =>
          m.meterId === targetMeterId
            ? { ...m, isDefault: true }
            : { ...m, isDefault: false }
        );
        await updateUserData(updatedMeters, targetMeterId);
      }
    } catch (err) {
      console.log("تعذر تعيين العداد الافتراضي:", err);
    }
  };

  // 6. التبديل مع الاستفادة من settingsMapper
  const handleTogglePreference = (field) => {
    setNotificationPrefs((prev) => {
      const updated = { ...prev, [field]: !prev[field] };
      const payload = settingsMapper.toApiPayload(updated);

      apiClient
        .post(`/api/user/${userId}/notification_settings/`, payload)
        .catch(() => {
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
    newPhone,
    setNewPhone: handlePhoneChange,
    phoneCurrentPassword,
    setPhoneCurrentPassword,
    phoneError,
    phoneSuccess,
    isPhoneSubmitting,
    handleUpdatePhone,
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
    activeBudgetMeterId,
    setActiveBudgetMeterId,
    targetBudget,
    setTargetBudget,
    budgetError,
    budgetSuccess,
    isBudgetSubmitting,
    handleUpdateBudget,
    isRenameModalVisible,
    setIsRenameModalVisible,
    meterToRename,
    setMeterToRename,
    newAliasInput,
    setNewAliasInput,
    isRenaming,
    handleRenameMeter,
    handleSetDefaultMeter,
    notificationPrefs,
    handleTogglePreference,
    logout,
    user,
    setBudgetError,
    setBudgetSuccess,
  };
}
