import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";

// استيراد طبقة الأمان والهوية البصرية
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

// ==================== أولاً: شاشات المحاكاة المؤقتة المنسقة (Mock Screens) ====================

// شاشة انتظار التحميل الذاتي للجلسة (Spinner)
const LoadingScreen = () => (
  <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
    <ActivityIndicator size="large" color={theme.colors.primary} />
    <Text style={[styles.title, { marginTop: theme.spacing.md }]}>
      جاري تهيئة نظام BillCut وتأمين الاتصال...
    </Text>
  </View>
);

// شاشة تسجيل الدخول الافتراضية

// شاشات المشترك العادي (Resident Screens)

const MockAnalytics = () => (
  <View style={styles.center}>
    <Text style={styles.title}>شاشة التحليلات والتنبؤ الذكي الموحدة</Text>
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

// شاشات مدير النظام (Admin Screens)
const MockAdminHome = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <View style={styles.center}>
      <Text style={styles.title}>لوحة التحكم الإدارية الكبرى لمدير النظام</Text>
      <Text style={styles.userText}>المدير النشط حالياً: {user?.fullName}</Text>
      <Button
        title="تسجيل الخروج الآمن"
        color={theme.colors.errorText}
        onPress={logout}
      />
    </View>
  );
};

const MockAdminUsers = () => (
  <View style={styles.center}>
    <Text style={styles.title}>إدارة وحوكمة حسابات المستخدمين (CRUD)</Text>
  </View>
);
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
      component={MockAnalytics}
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
    <Tab.Screen
      name="الرئيسية"
      component={MockAdminHome}
      options={{ title: "لوحة التحكم الإدارية" }}
    />
    <Tab.Screen
      name="المستخدمين"
      component={MockAdminUsers}
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
  const { isLoading, userToken, user } = useContext(AuthContext);

  // عرض واجهة التحميل الدائري لحين قراءة الذاكرة المشفرة للهاتف وصلاحية الجلسة
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!userToken ? (
        // إذا لم يسجل الدخول، يحمل مسار الدخول ويحظر الشاشات الداخلية تماماً
        <AuthNavigator />
      ) : user?.role === "ADMIN" ? (
        // إذا سجل كمدير، يحمل مسار الأدمن المخصص بالكامل
        <AdminTabNavigator />
      ) : (
        // إذا سجل كمستهلك، يحمل مسار المشترك المخصص بالكامل
        <ResidentTabNavigator />
      )}
    </NavigationContainer>
  );
};

// تنسيقات شاشات المحاكاة
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EDF2F7",
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#17202A",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: "#5D6D7E",
    textAlign: "center",
    marginBottom: 40,
  },
  userText: {
    fontSize: 15,
    color: "#1B4F72",
    marginBottom: 30,
    fontWeight: "600",
  },
  errorText: {
    color: "#721C24",
    backgroundColor: "#F8D7DA",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
    width: "100%",
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
});
