import React, { createContext, useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { Storage } from "../utils/storage";
import { userMapper } from "../api/mappers/userMapper";
import { registerForPushNotificationsAsync } from "../utils/notifications";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("admin"); // 'admin' أو 'resident'

  // 1. تسجيل إشعارات الهاتف تلقائياً فور توفر توكن المستخدم
  useEffect(() => {
    if (userToken) {
      registerForPushNotificationsAsync();
    }
  }, [userToken]);

  // 2. إعادة قراءة الجلسة المشفرة عند إقلاع التطبيق
  useEffect(() => {
    loadStorageData();
  }, []);

  // 3. خدمة تسجيل الدخول الآمنة عبر apiClient و Storage و userMapper
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login/", {
        username,
        password,
      });

      if (response.data.status === "success") {
        const { access, refresh } = response.data.tokens;
        const userData = userMapper.toDomain(response.data.user);

        setUserToken(access);
        setUser(userData);
        setViewMode(userData.role === "ADMIN" ? "admin" : "resident");

        // التخزين عبر أداة Storage التغليفية
        await Storage.setAccessToken(access);
        await Storage.setRefreshToken(refresh);
        await Storage.setUserData(userData);

        setIsLoading(false);
        return { status: "success" };
      }
    } catch (error) {
      setIsLoading(false);
      return {
        status: "error",
        message: error.response?.data?.message || "تعذر الاتصال بالسيرفر.",
      };
    }
  };

  // 4. خدمة تسجيل الخروج وتصفير الجلسة بمسحة واحدة
  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUser(null);
    setViewMode("admin");
    await Storage.clearSession();
    setIsLoading(false);
  };

  // 5. دالة تبديل وضع العرض للأدمن المزدوج
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "admin" ? "resident" : "admin"));
  };

  // 6. قراءة ومزامنة البيانات حياً صامتاً
  const loadStorageData = async () => {
    try {
      const accessToken = await Storage.getAccessToken();
      const parsedUser = await Storage.getUserData();

      if (accessToken && parsedUser) {
        setUserToken(accessToken);
        setUser(parsedUser);
        setViewMode(parsedUser.role === "ADMIN" ? "admin" : "resident");

        try {
          const res = await apiClient.get("/api/auth/me/");
          if (res.data.status === "success") {
            const freshUserData = userMapper.toDomain(res.data.user);
            setUser(freshUserData);
            setViewMode(freshUserData.role === "ADMIN" ? "admin" : "resident");
            await Storage.setUserData(freshUserData);
          }
        } catch (syncErr) {
          if (
            syncErr.response?.status === 401 ||
            syncErr.response?.status === 403
          ) {
            console.log(
              "الحساب محظور أو الجلسة ملغاة سحابياً، جاري طرد الجلسة محلياً..."
            );
            await logout();
            return;
          }
          console.log("تعذر التحديث الصامت للجلسة (خطأ شبكة):", syncErr);
        }
      }
    } catch (e) {
      console.log("فشل قراءة الذاكرة المشفرة للهاتف:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. تحديث تفضيلات العدادات محلياً مع المزامنة
  const updateUserData = async (updatedMeters, defaultMeterId) => {
    if (user) {
      const updatedUser = {
        ...user,
        defaultMeterId: defaultMeterId || user.defaultMeterId,
        meters: updatedMeters || user.meters,
      };
      setUser(updatedUser);
      await Storage.setUserData(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoading,
        userToken,
        user,
        viewMode,
        toggleViewMode,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
