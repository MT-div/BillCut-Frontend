import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";

// استيراد المكونات المحدثة والمشتركة
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
    activeBudgetMeterId,
    setActiveBudgetMeterId,
    targetBudget,
    setTargetBudget,
    budgetError,
    budgetSuccess,
    isBudgetSubmitting,
    handleUpdateBudget,
    // نافذة التسمية (Modal) والافتراضي
    isRenameModalVisible,
    setIsRenameModalVisible,
    meterToRename,
    setMeterToRename,
    newAliasInput,
    setNewAliasInput,
    isRenaming,
    handleRenameMeter,
    handleSetDefaultMeter,
    // إشعارات وعام
    notificationPrefs,
    handleTogglePreference,
    logout,

    user,

    setBudgetError,
    setBudgetSuccess,
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
      {/* كارت 1: إدارة معلومات وتفاصيل الحساب (الهاتف) */}
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
            error={phoneError ? "يرجى التحقق من المدخلات." : null}
          />
          <CustomInput
            label="كلمة المرور الحالية (لتأكيد تعديل الهاتف)"
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

      {/* كارت 2: أمان الحساب وتعديل كلمة المرور (منفصل ومستقل تماماً) */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>أمان الحساب وتغيير كلمة المرور</Text>
          <CustomInput
            label="كلمة المرور الحالية (إلزامية للتغيير)"
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
        <CustomAlert type="error" message={passwordError} />
        <CustomAlert type="success" message={passwordSuccess} />
      </View>

      {/* كارت 3: إدارة العدادات الخاصة (Meters Management) */}
      <View style={styles.sectionContainer}>
        <CustomCard>
          <Text style={styles.cardTitle}>
            حوكمة العدادات الكهربائية الخاصة بك
          </Text>
          <Text style={styles.subLabel}>
            قائمة بجميع عداداتك المسندة إليك؛ يمكنك تعديل الاسم أو تحديد العداد
            الافتراضي:
          </Text>

          {user?.meters &&
            user.meters.map((item) => (
              <View key={item.meterId} style={styles.meterRow}>
                <View style={styles.meterInfo}>
                  <Text style={styles.meterAlias}>
                    {item.alias}{" "}
                    {item.isDefault && (
                      <Text style={{ color: theme.colors.secondary }}>
                        (الافتراضي)
                      </Text>
                    )}
                  </Text>
                  <Text style={styles.meterIdText}>
                    ID: {item.meterId.substring(0, 18)}...
                  </Text>
                </View>
                <View style={styles.meterActions}>
                  {/* 1. زر تعديل الاسم المستعار يفتح نافذة الـ Modal */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      setMeterToRename(item);
                      setNewAliasInput(item.alias);
                      setIsRenameModalVisible(true);
                    }}
                  >
                    <Text style={styles.actionBtnText}>تعديل الاسم</Text>
                  </TouchableOpacity>
                  {/* 2. زر تعيين الافتراضي يظهر كنجمة تفاعلية ملونة */}
                  {!item.isDefault && (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: theme.colors.secondary },
                      ]}
                      onPress={() =>
                        handleSetDefaultMeter(item.preferenceId, item.meterId)
                      }
                    >
                      <Text style={styles.actionBtnText}>تعيين كافتراضي</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
        </CustomCard>
      </View>

      {/* كارت 4: إدارة الميزانية مع المبدل الأفقي لتحديد العداد المستهدف */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>
            إدارة الميزانية المالية والحدود الكهربائية
          </Text>
          <Text style={styles.subLabel}>
            حدد العداد المستهدف لتعيين أو تحديث ميزانيته الإجمالية بالليرة:
          </Text>

          {/* أزرار التبديل الأفقية للعدادات داخل كارت الميزانية */}
          {user?.meters && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {user.meters.map((item) => {
                const isSelected = item.meterId === activeBudgetMeterId;
                return (
                  <TouchableOpacity
                    key={`budget-meter-${item.meterId}`}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.colors.primary
                          : "#E2E8F0",
                      },
                    ]}
                    onPress={() => {
                      setActiveBudgetMeterId(item.meterId);
                      setBudgetSuccess("");
                      setBudgetError("");
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? "#FFFFFF" : theme.colors.text },
                      ]}
                    >
                      {item.alias}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <CustomInput
            label="الميزانية المالية المستهدفة (بالليرة السورية)"
            placeholder="أدخل قيمة الميزانية الإجمالية (مثال: 250000)"
            value={targetBudget}
            onChangeText={(text) => {
              setTargetBudget(text);
              setBudgetSuccess("");
              setBudgetError("");
            }}
            keyboardType="numeric"
            error={budgetError}
          />
          <CustomButton
            title={
              isBudgetSubmitting
                ? "جاري الحفظ..."
                : "تحديث ميزانية العداد المحدد"
            }
            onPress={handleUpdateBudget}
            color={theme.colors.secondary}
            disabled={isBudgetSubmitting}
          />
        </CustomCard>
        <CustomAlert type="success" message={budgetSuccess} />
      </View>

      {/* كارت 5: تفضيلات إشعارات الدفع الخارجية */}
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

      {/* كارت 6: الخروج الآمن */}
      <CustomCard style={styles.logoutCard}>
        <Text style={styles.cardTitle}>أمان الجلسة والملف الشخصي</Text>
        <CustomButton
          title="تسجيل الخروج الآمن من التطبيق"
          onPress={logout}
          color={theme.colors.errorText}
        />
      </CustomCard>

      {/* ==================== نافذة التعديل المنبثقة للأدوات (Rename Modal) ==================== */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل الاسم المستعار للعداد</Text>
            <Text style={styles.modalSub}>
              رقم العداد: {meterToRename?.meterId.substring(0, 18)}...
            </Text>

            <CustomInput
              placeholder="اكتب الاسم الجديد (مثال: عداد المحل)"
              value={newAliasInput}
              onChangeText={setNewAliasInput}
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleRenameMeter}
                disabled={isRenaming}
              >
                {isRenaming ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>حفظ</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setIsRenameModalVisible(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.colors.text }]}
                >
                  إلغاء
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // تنسيق قائمة العدادات الفاخرة
  meterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
    width: "100%",
  },
  meterInfo: {
    alignItems: "flex-start",
  },
  meterAlias: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  meterIdText: {
    fontSize: 10,
    color: theme.colors.subtext,
    marginTop: 2,
    fontWeight: "600",
  },
  meterActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: theme.spacing.xs,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  // أزرار التبديل الأفقية للميزانية
  chipsRow: {
    paddingVertical: 4,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  // واجهة المنبثقة الـ Modal للتعديل
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 11,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.md,
    fontWeight: "600",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.sm,
  },
  modalBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    width: "48%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
