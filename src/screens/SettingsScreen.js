import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";

import CustomCard from "../components/CustomCard";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomAlert from "../components/CustomAlert";

import { useSettings } from "../hooks/useSettings";
import { theme } from "../theme/theme";

export default function SettingsScreen() {
  const {
    isLoading,
    // هاتف
    newPhone,
    setNewPhone,
    phoneCurrentPassword,
    setPhoneCurrentPassword,
    phoneError,
    phoneSuccess,
    isPhoneSubmitting,
    handleUpdatePhone,
    // كلمة مرور
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordFieldErrors,
    passwordError,
    passwordSuccess,
    isPasswordSubmitting,
    handleUpdatePassword,
    // ميزانية
    targetBudget,
    setTargetBudget,
    budgetError,
    budgetSuccess,
    isBudgetSubmitting,
    handleUpdateBudget,
    // إشعارات
    notificationPrefs,
    handleTogglePreference,
    // عام
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
      {/* كارت 1: تعديل رقم الهاتف - مستقل تماماً بحقل كلمة مروره الخاص */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>إدارة معلومات وتفاصيل الحساب</Text>
          <Text style={styles.usernameText}>
            اسم الحساب الحالي: {user?.username}
          </Text>

          <CustomInput
            label="رقم الهاتف الخلوي الجديد"
            placeholder="أدخل رقم هاتفك الجديد"
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
          />

          <CustomInput
            label="كلمة المرور الحالية (لتأكيد التعديل)"
            placeholder="أدخل كلمة مرورك الحالية"
            value={phoneCurrentPassword}
            onChangeText={setPhoneCurrentPassword}
            secureTextEntry
          />

          <CustomButton
            title={
              isPhoneSubmitting
                ? "جاري التحديث..."
                : "تحديث رقم الهاتف ومزامنة الحساب"
            }
            onPress={handleUpdatePhone}
            color={theme.colors.primary}
            disabled={isPhoneSubmitting}
          />
        </CustomCard>
        <CustomAlert type="error" message={phoneError} />
        <CustomAlert type="success" message={phoneSuccess} />
      </View>

      {/* كارت 2: أمان الحساب وتعديل كلمة المرور - مستقل تماماً */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>أمان الحساب وتغيير كلمة المرور</Text>

          <CustomInput
            label="كلمة المرور الحالية (إلزامية للتأكيد والحفظ)"
            placeholder="أدخل كلمة مرورك الحالية"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            error={passwordFieldErrors.currentPassword}
          />

          <CustomInput
            label="كلمة المرور الجديدة"
            placeholder="أدخل كلمة المرور الجديدة"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            error={passwordFieldErrors.newPassword}
          />

          <CustomInput
            label="تأكيد كلمة المرور الجديدة"
            placeholder="أعد إدخال كلمة المرور للتأكيد"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={passwordFieldErrors.confirmPassword}
          />

          <CustomButton
            title={
              isPasswordSubmitting
                ? "جاري الحفظ..."
                : "تعديل وتحديث كلمة المرور"
            }
            onPress={handleUpdatePassword}
            color={theme.colors.primary}
            disabled={isPasswordSubmitting}
          />
        </CustomCard>
        {/* خطأ عام (من السيرفر) يظهر تحت الكرت، منفصل عن أخطاء الحقول الفردية أعلاه */}
        <CustomAlert type="error" message={passwordError} />
        <CustomAlert type="success" message={passwordSuccess} />
      </View>

      {/* كارت 3: إدارة الميزانية المالية والتعرفة العكسية */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>
            إدارة الميزانية المالية والحدود الكهربائية
          </Text>

          <CustomInput
            label="الميزانية المالية المستهدفة (بالليرة السورية)"
            placeholder="أدخل قيمة الميزانية الإجمالية (مثال: 250000)"
            value={targetBudget}
            onChangeText={setTargetBudget}
            keyboardType="numeric"
            error={budgetError}
          />

          <CustomButton
            title={
              isBudgetSubmitting ? "جاري الحفظ..." : "تحديث ميزانية العداد"
            }
            onPress={handleUpdateBudget}
            color={theme.colors.secondary}
            disabled={isBudgetSubmitting}
          />
        </CustomCard>
        <CustomAlert type="success" message={budgetSuccess} />
      </View>

      {/* كارت 4: تفضيلات إشعارات الدفع الخارجية */}
      <CustomCard>
        <Text style={styles.cardTitle}>
          تفضيلات وتصفية إشعارات الدفع (Push)
        </Text>
        <Text style={styles.subLabel}>
          تصفية التنبيهات الخارجية التي تظهر على شاشة الهاتف تجنباً للإزعاج:
        </Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            إشعارات وتنبيهات الميزانية المالية
          </Text>
          <Switch
            value={notificationPrefs.budgetPush}
            onValueChange={() => handleTogglePreference("budgetPush")}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={
              notificationPrefs.budgetPush ? theme.colors.primary : "#F4F6F7"
            }
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>إشعارات تجاوز الشريحة المدعومة</Text>
          <Switch
            value={notificationPrefs.tierPush}
            onValueChange={() => handleTogglePreference("tierPush")}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={
              notificationPrefs.tierPush ? theme.colors.primary : "#F4F6F7"
            }
          />
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            تحذيرات وجود خلل أو عطل كهربائي (عاجل)
          </Text>
          <Switch
            value={notificationPrefs.anomalyPush}
            onValueChange={() => handleTogglePreference("anomalyPush")}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.secondary,
            }}
            thumbColor={
              notificationPrefs.anomalyPush ? theme.colors.primary : "#F4F6F7"
            }
          />
        </View>
      </CustomCard>

      {/* كارت 5: الخروج الآمن */}
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
  sectionContainer: {
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  cardNoMargin: {
    marginBottom: 0,
  },
});
