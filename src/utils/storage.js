import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
};

export const Storage = {
  // مفاتيح الوصول
  setAccessToken: (token) => SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token),
  getAccessToken: () => SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),

  // مفاتيح التجديد
  setRefreshToken: (token) =>
    SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token),
  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  // بيانات المستخدم
  setUserData: (data) =>
    SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(data)),
  getUserData: async () => {
    const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  // مسح الشامل للجلسة عند الخروج
  clearSession: async () => {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
  },
};
