import axios from "axios";
import { ENV } from "../config/env";
import { Storage } from "../utils/storage";

// 1. إنشاء نسخة التخاطب الموحدة والمركزية باستخدام إعدادات البيئة
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: ENV.TIMEOUT || 10000,
});

// 2. حاقن الطلبات التلقائي (Request Interceptor) لحقن Bearer Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const publicRoutes = ["/api/auth/login/", "/api/token/refresh/"];
      const isPublicRoute = publicRoutes.some((route) =>
        config.url?.includes(route)
      );

      if (!isPublicRoute) {
        const accessToken = await Storage.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.log("فشل قراءة الـ Token وحقنه في الترويسة:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. مراقب الاستجابات المحدث (Response Interceptor) لمنع فخ الـ 401 عند الدخول
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // استثناء مسارات تسجيل الدخول وتجديد التوكن من عملية التجديد الصامته لمنع ابتلاع الأخطاء
    const isAuthRoute =
      originalRequest.url?.includes("/api/auth/login/") ||
      originalRequest.url?.includes("/api/token/refresh/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await Storage.getRefreshToken();

        if (refreshToken) {
          const res = await axios.post(
            `${ENV.API_BASE_URL}/api/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          if (res.status === 200 && res.data.access) {
            const newAccessToken = res.data.access;
            await Storage.setAccessToken(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log(
          "فشل التحديث التلقائي للـ Token، الجلسة منتهية تماماً:",
          refreshError
        );
        await Storage.clearSession(); // مسح الجلسة المنتهية بنظافة من الهاتف
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
