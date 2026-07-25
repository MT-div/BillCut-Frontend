import axios from "axios";
import * as SecureStore from "expo-secure-store";

// تلميح هندسي هام: استبدل الرابط بـ IP حاسبك المحلي الفعلي (مثال: 192.168.1.100) عند تجربة التطبيق على هاتف حقيقي متصل بنفس الشبكة
export const BASE_URL = "http://127.0.0.1:8000";

// 1. إنشاء نسخة التخاطب الموحدة والمركزية عبر كلاس Axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // مهلة اتصال 10 ثوانٍ لحماية كفاءة وأداء التطبيق عند ضعف الشبكة
});

// 2. برمجة حاقن الطلبات التلقائي (Request Interceptor) لحقن الـ Bearer Token تلقائياً

apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 1. تعريف قائمة بالمسارات العامة المفتوحة التي لا تتطلب توثيقاً أمنياً (مثل تسجيل الدخول وتحديث التوكن)
      const publicRoutes = ["/api/auth/login/", "/api/token/refresh/"];

      // 2. التحقق: إذا كان الرابط المطلوب ليس من المسارات العامة، نقوم بحقن التوكن بأمان
      const isPublicRoute = publicRoutes.some((route) =>
        config.url.includes(route)
      );

      if (!isPublicRoute) {
        const accessToken = await SecureStore.getItemAsync("access_token");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.log("فشل قراءة الـ Token وحقنه في الترويسة:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. برمجة مراقب الاستجابات (Response Interceptor) لمعالجة انتهاء صلاحية المفاتيح آلياً
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // التحقق مما إذا كان السيرفر أرجع 401 (انتهت الصلاحية) ولم يتم إعادة المحاولة للطلب مسبقاً
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // قراءة الـ Refresh Token الطويل الأجل لتحديث الصلاحية صامتاً
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        if (refreshToken) {
          // إرسال طلب تحديث الصلاحية للسيرفر الخلفي لـ BillCut
          const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            const newAccessToken = res.data.access;

            // حفظ الـ Token الجديد المحدث في الذاكرة المشفرة للهاتف فوراً
            await SecureStore.setItemAsync("access_token", newAccessToken);

            // تحديث ترويسة الطلب الأصلي بالـ Token الجديد وإعادة إرساله بنجاح صامت
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.log(
          "فشل التحديث التلقائي للـ Token، الجلسة منتهية تماماً:",
          refreshError
        );
        // هنا يمكن إرسال حدث لتسجيل الخروج التلقائي للمستخدم وإعادته لصفحة الدخول الآمنة
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
