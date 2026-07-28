import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// استيراد شاشات المستهلك الحقيقية
import DashboardScreen from "../screens/DashboardScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";

// استيراد شاشات مدير النظام الحقيقية
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";

// استيراد طبقة الأمان والهوية البصرية
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

// ==================== أولاً: شاشات المحاكاة المؤقتة المنسقة (Mock Screens) ====================

const LoadingScreen = () => (
  <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={[styles.title, { marginTop: theme.spacing.md }]}>
      جاري تهيئة نظام BillCut وتأمين الاتصال...
    </Text>
  </View>
);

const MockNotifications = () => (
  <View style={styles.center}>
    <Text style={styles.title}>مركز الإشعارات وأرشيف التنبيهات</Text>
  </View>
);
const MockSettings = () => (
  <View style={styles.center}>
    <Text style={styles.title}>إعدادات الحساب وتفضيلات التنبيهات</Text>
  </View>
);

// شاشات الأدمن المؤقتة لحين برمجتها

const MockAdminMeters = () => (
  <View style={styles.center}>
    <Text style={styles.title}>إدارة وحوكمة العدادات وإسناد الصلاحيات</Text>
  </View>
);
const MockAdminTariff = () => (
  <View style={styles.center}>
    <Text style={styles.title}>تحديث وإصدار الشرائح والتعرفة الحكومية</Text>
  </View>
);

// ==================== ثانياً: بناء النوافذ والموجهات الهيكلية (Navigators) ====================

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 1. مسار المصادقة والدخول العام (Auth Stack)
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// 2. مسار المستهلك المنزلي الموزع سفلياً (Resident Bottom Tab)
const ResidentTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.subtext,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        height: 60,
        paddingBottom: 8,
      },
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    <Tab.Screen
      name="لوحة المراقبة"
      component={DashboardScreen}
      options={{ title: "لوحة المراقبة" }}
    />
    <Tab.Screen
      name="التحليلات"
      component={AnalyticsScreen}
      options={{ title: "التحليلات الذكية" }}
    />
    <Tab.Screen
      name="الإشعارات"
      component={MockNotifications}
      options={{ title: "مركز التنبيهات" }}
    />
    <Tab.Screen
      name="الإعدادات"
      component={MockSettings}
      options={{ title: "إعدادات الحساب" }}
    />
  </Tab.Navigator>
);

// 3. مسار مدير النظام الموزع سفلياً (Admin Bottom Tab)
const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.subtext,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        height: 60,
        paddingBottom: 8,
      },
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
    }}
  >
    {/* ربط شاشة الأدمن الحقيقية الجديدة لتكون أول تبويب نشط للأدمن */}
    <Tab.Screen
      name="الرئيسية"
      component={AdminHomeScreen}
      options={{ title: "لوحة التحكم الإدارية" }}
    />
    <Tab.Screen
      name="المستخدمين"
      component={AdminUsersScreen}
      options={{ title: "حوكمة المشتركين" }}
    />
    <Tab.Screen
      name="العدادات"
      component={MockAdminMeters}
      options={{ title: "إدارة العدادات والأجهزة" }}
    />
    <Tab.Screen
      name="التعرفة والشرائح"
      component={MockAdminTariff}
      options={{ title: "التعرفة الحكومية" }}
    />
  </Tab.Navigator>
);

// ==================== ثالثاً: الموجه الرئيسي الحارس للمسارات (Root App Navigator) ====================

export const AppNavigator = () => {
  const { isLoading, userToken, user, viewMode } = useContext(AuthContext);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!userToken ? (
        <AuthNavigator />
      ) : user?.role === "ADMIN" && viewMode === "admin" ? (
        <AdminTabNavigator /> // # حل المشكلة: توجيه الأدمن لـ الـ TabNavigator ليظهر البار العلوي والسفلي فورا!
      ) : (
        <ResidentTabNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EDF2F7",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#17202A",
    marginBottom: 15,
  },
});
