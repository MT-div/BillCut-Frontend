import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import apiClient from "../api/apiClient";

// 1. الفحص المعماري لبيئة Expo Go
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// 2. إعداد معالج الإشعارات بحذر شديد فقط خارج Expo Go
if (!isExpoGo) {
  try {
    const Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log("تنبيه إعداد الإشعارات:", e);
  }
}

export async function registerForPushNotificationsAsync() {
  // حزام أمان مطلق: إذا كنا داخل Expo Go نمنع استدعاء المكتبة نهائياً لمنع أي انهيار
  if (isExpoGo) {
    console.log(
      "ℹ️ ملاحظة: إشعارات الدفع الخارجية غير مدعومة داخل Expo Go على SDK 53+. تم تعطيل التسجيل بأمان."
    );
    return null;
  }

  let token = null;

  try {
    // 3. التحميل الديناميكي (Lazy Load) للمكتبات فقط عند الحاجة الحقيقية في التطبيق المبني
    const Notifications = require("expo-notifications");
    const Device = require("expo-device");

    if (Device.isDevice || Platform.OS === "android") {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("تم رفض صلاحية إرسال الإشعارات!");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;

      if (token) {
        await apiClient.post("/api/user/push_token/", { pushToken: token });
        console.log("تم حفظ PushToken في السيرفر بنجاح:", token);
      }
    }
  } catch (error) {
    console.log("تنبيه في تسجيل الإشعارات:", error.message);
  }

  return token;
}
