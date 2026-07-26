import "react-native-gesture-handler";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { I18nManager } from "react-native";
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);
export default function App() {
  return (
    // تغليف التطبيق بالكامل بمزود الأمان وقراءة الجلسات
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
