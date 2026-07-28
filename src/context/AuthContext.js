import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

//   : استبدل الرابط بـ IP حاسبك المحلي عند تجربة التطبيق على هاتف حقيقي متصل بنفس الشبكة
export const BASE_URL = "http://10.0.2.2:8000";

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("admin"); // 'admin' أو 'resident'

  useEffect(() => {
    loadStorageData();
  }, []);
  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login/`, {
        username,
        password,
      });
      if (response.data.status === "success") {
        const { access, refresh } = response.data.tokens;
        const userData = response.data.user;

        setUserToken(access);
        setUser(userData);
        // ضبط وضع العرض الافتراضي بناءً على دور المستخدم
        setViewMode(userData.role === "ADMIN" ? "admin" : "resident");

        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", refresh);
        await SecureStore.setItemAsync("user_data", JSON.stringify(userData));

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

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUser(null);
    setViewMode("admin");
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    await SecureStore.deleteItemAsync("user_data");
    setIsLoading(false);
  };

  // دالة تبديل وضع العرض للأدمن بين لوحة الإدارة وواجهة المستهلك العادي
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "admin" ? "resident" : "admin"));
  };

  const loadStorageData = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const savedUserData = await SecureStore.getItemAsync("user_data");
      if (accessToken && savedUserData) {
        const parsedUser = JSON.parse(savedUserData);
        setUserToken(accessToken);
        setUser(parsedUser);
        setViewMode(parsedUser.role === "ADMIN" ? "admin" : "resident");
      }
    } catch (e) {
      console.log("فشل قراءة الذاكرة المشفرة:", e);
    }
    setIsLoading(false);
  };
  // دالة مخصصة ومحترفة لتحديث ومزامنة بيانات المستخدم والعدادات محلياً في ذاكرة الهاتف عند أي تعديل سحابي
  const updateUserData = async (updatedMeters, defaultMeterId) => {
    if (user) {
      const updatedUser = {
        ...user,
        defaultMeterId: defaultMeterId || user.defaultMeterId,
        meters: updatedMeters || user.meters,
      };
      setUser(updatedUser);
      await SecureStore.setItemAsync("user_data", JSON.stringify(updatedUser));
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
