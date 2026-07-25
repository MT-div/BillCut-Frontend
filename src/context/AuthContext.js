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

  // 1. دالة تسجيل الدخول والتواصل مع السيرفر الخلفي لـ BillCut
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

        // حفظ الـ Tokens مشفرة في الذاكرة العشوائية السحابية للتطبيق وللهاتف عتادياً
        setUserToken(access);
        setUser(userData);

        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", refresh);
        await SecureStore.setItemAsync("user_data", JSON.stringify(userData));

        setIsLoading(false);
        return { status: "success" };
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.message ||
        "تعذر الاتصال بالسيرفر، يرجى التحقق من الشبكة.";
      return { status: "error", message: errorMsg };
    }
  };

  // 2. دالة تسجيل الخروج ومسح الـ Tokens المشفرة نهائياً من الهاتف لضمان الأمان
  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      await SecureStore.deleteItemAsync("user_data");
    } catch (e) {
      console.log("خطأ أثناء تسجيل الخروج:", e);
    }
    setIsLoading(false);
  };

  // 3. دالة التحقق الذاتي عند فتح التطبيق لأول مرة (Silent Login)
  const loadStorageData = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const savedUserData = await SecureStore.getItemAsync("user_data");

      if (accessToken && savedUserData) {
        setUserToken(accessToken);
        setUser(JSON.parse(savedUserData));
      }
    } catch (e) {
      console.log("فشل قراءة الذاكرة المشفرة للهاتف:", e);
    }
    setIsLoading(false);
  };

  // تشغيل الفحص الذاتي للجلسة فور فتح التطبيق
  useEffect(() => {
    loadStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, isLoading, userToken, user }}>
      {children}
    </AuthContext.Provider>
  );
};
