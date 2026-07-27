import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";

// استيراد المكونات المشتركة
import CustomCard from "../components/CustomCard";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import ErrorAlert from "../components/ErrorAlert";

// استيراد الـ Hook المطور والثيم
import { useSettings } from "../hooks/useSettings";
import { theme } from "../theme/theme";

export default function SettingsScreen() {
  const {
    isLoading,
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
    newPhone,
    setNewPhone,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    targetBudget,
    setTargetBudget,
    budgetPush,
    tierPush,
    anomalyPush,
    handleUpdateProfile,
    handleUpdateBudget,
    handleTogglePreference,
    logout,
    user,
  } = useSettings();

  if (isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري استيراد إعدادات حسابك التفضيلية...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* عرض صناديق الخطأ أو النجاح التفاعلية في الأعلى بالملي */}
      <ErrorAlert message={errorMsg} />

      {successMsg ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* الكارت 1: الملف الشخصي وأمان الحساب */}
      <CustomCard>
        <Text style={styles.cardTitle}>تعديل الملف الشخصي وأمان الحساب</Text>
        <Text style={styles.usernameText}>اسم الحساب: {user?.username}</Text>

        <CustomInput
          label="رقم الهاتف الخلوي الجديد"
          placeholder="أدخل رقم هاتفك الجديد"
          value={newPhone}
          onChangeText={(text) => {
            setNewPhone(text);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          keyboardType="phone-pad"
        />

        <CustomInput
          label="كلمة المرور الجديدة (اختياري)"
          placeholder="أدخل كلمة مرور جديدة إن رغبت"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          secureTextEntry={true}
        />

        <CustomInput
          label="تأكيد كلمة المرور الجديدة"
          placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          secureTextEntry={true}
        />

        <CustomInput
          label="كلمة المرور الحالية (إلزامية للتأكيد)"
          placeholder="أدخل كلمة مرورك الحالية لحفظ التعديلات"
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          secureTextEntry={true}
        />

        <CustomButton
          title="حفظ بيانات الحساب"
          onPress={handleUpdateProfile}
          color={theme.colors.primary}
        />
      </CustomCard>

      {/* الكارت 2: إدارة الميزانية المالية والتعرفة العكسية */}
      <CustomCard>
        <Text style={styles.cardTitle}>
          إدارة الميزانية المالية والحدود الكهربائية
        </Text>

        <CustomInput
          label="الميزانية المالية المستهدفة (بالليرة السورية)"
          placeholder="أدخل قيمة الميزانية الإجمالية (مثال: 250000)"
          value={targetBudget}
          onChangeText={(text) => {
            setTargetBudget(text);
            setSuccessMsg("");
            setErrorMsg("");
          }}
          keyboardType="numeric"
        />

        <CustomButton
          title="تحديث ميزانية العداد"
          onPress={handleUpdateBudget}
          color={theme.colors.secondary}
        />
      </CustomCard>

      {/* الكارت 3: تفضيلات إشعارات الدفع الخارجية (Toggles) */}
      <CustomCard>
        <Text style={styles.cardTitle}>
          تفضيلات وتصفية إشعارات الدفع (Push Notifications)
        </Text>
        <Text style={styles.subLabel}>
          تصفية التنبيهات الخارجية التي تظهر على شاشة الهاتف تجنباً للإزعاج:
        </Text>

        {/* المفتاح 1: إشعارات الميزانية */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            إشعارات وتنبيهات الميزانية المالية
          </Text>
          <Switch
            value={budgetPush}
            onValueChange={() => handleTogglePreference("budget", budgetPush)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={budgetPush ? theme.colors.primary : "#F4F6F7"}
          />
        </View>

        {/* المفتاح 2: إشعارات الشرائح والدعم */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>إشعارات تجاوز الشريحة المدعومة</Text>
          <Switch
            value={tierPush}
            onValueChange={() => handleTogglePreference("tier", tierPush)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={tierPush ? theme.colors.primary : "#F4F6F7"}
          />
        </View>

        {/* المفتاح 3: تحذيرات الأعطال والخلل */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            تحذيرات وجود خلل أو عطل كهربائي (عاجل)
          </Text>
          <Switch
            value={anomalyPush}
            onValueChange={() => handleTogglePreference("anomaly", anomalyPush)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={anomalyPush ? theme.colors.primary : "#F4F6F7"}
          />
        </View>
      </CustomCard>

      {/* الكارت 4: تسجيل الخروج الآمن والنهائي */}
      <CustomCard style={styles.logoutCard}>
        <Text style={styles.cardTitle}>أمان الجلسة والملف الشخصي</Text>
        <CustomButton
          title="تسجيل الخروج الآمن من التطبيق"
          onPress={logout}
          color={theme.colors.errorText}
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
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  usernameText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    alignSelf: "flex-start",
  },
  subLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  successContainer: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.successText,
  },
  successText: {
    color: theme.colors.successText,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  toggleLabel: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "600",
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: theme.colors.errorText,
    backgroundColor: "#FFF2F2",
  },
});
