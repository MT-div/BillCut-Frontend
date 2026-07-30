import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import CustomCard from "../../components/CustomCard";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";

import { AuthContext } from "../../context/AuthContext";
import { useAdminHome } from "../../hooks/admin/useAdminHome";
import { theme } from "../../theme/theme";

export default function AdminHomeScreen({ navigation }) {
  const { user, logout, toggleViewMode } = useContext(AuthContext);
  const { stats, isLoading, isRefreshing, error, onRefresh } = useAdminHome();

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري تحميل لوحة التحكم الإدارية...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <CustomAlert type="error" message={error} />

      {/* 1. كارت الترحيب وزر التبديل الذكي لواجهة المستهلك */}
      <CustomCard style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          مرحباً بك يا مدير النظام، {user?.fullName}
        </Text>
        <Text style={styles.welcomeSub}>
          لديك صلاحيات كاملة لإدارة النظام، وتستطيع معاينة واجهة المستهلك بـنقرة
          زر:
        </Text>
        <View style={{ height: theme.spacing.sm }} />
        <CustomButton
          title="🔄 الانتقال لمعاينة واجهة المستهلك العادي"
          onPress={toggleViewMode}
          color={theme.colors.secondary}
        />
        <View style={{ height: theme.spacing.xs }} />
        <CustomButton
          title="تسجيل الخروج الآمن"
          onPress={logout}
          color={theme.colors.errorText}
        />
      </CustomCard>

      {/* 2. كارت إحصائيات المنظومة الحية من قاعدة البيانات */}
      <View style={styles.row}>
        <CustomCard style={styles.halfCard}>
          <Text style={styles.smallCardTitle}>المشتركين النشطين</Text>
          <Text style={styles.numberBig}>{stats.usersCount} مستخدم</Text>
        </CustomCard>
        <CustomCard style={styles.halfCard}>
          <Text style={styles.smallCardTitle}>العدادات المسجلة</Text>
          <Text style={[styles.numberBig, { color: theme.colors.primary }]}>
            {stats.metersCount} عداد
          </Text>
        </CustomCard>
      </View>

      {/* 3. كارت أداوات الملاحة الإدارية السريعة */}
      <CustomCard>
        <Text style={styles.cardTitle}>العمليات الحركية لحوكمة النظام</Text>
        <Text style={styles.subLabel}>
          اختصارات وصول سريعة ومباشرة للتنقل بين الشاشات الإدارية المفتوحة:
        </Text>

        <CustomButton
          title="👥 إدارة وتعديل وحذف حسابات المشتركين (CRUD)"
          onPress={() => navigation.navigate("المستخدمين")}
          color={theme.colors.primary}
        />
        <View style={{ height: theme.spacing.xs }} />

        <CustomButton
          title="⚡ إدارة العدادات وإسناد الصلاحيات للعملاء"
          onPress={() => navigation.navigate("العدادات")}
          color={theme.colors.primary}
        />
        <View style={{ height: theme.spacing.xs }} />

        <CustomButton
          title="📈 تحديث وإصدار تسعيرة الشرائح الكهربائية"
          onPress={() => navigation.navigate("التعرفة والشرائح")}
          color={theme.colors.primary}
        />
      </CustomCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeCard: {
    backgroundColor: "#EBF5FB",
    borderWidth: 1,
    borderColor: "#AED6F1",
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 12,
    color: theme.colors.subtext,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  subLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfCard: {
    width: "48%",
    alignItems: "center",
  },
  smallCardTitle: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  numberBig: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
});
