import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// استيراد المكونات المشتركة والثيم
import CustomCard from "../../components/CustomCard";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";
import { useAdminTariff } from "../../hooks/admin/useAdminTariff";
import { theme } from "../../theme/theme";

export default function AdminTariffScreen() {
  // استدعاء الـ Hook وإرسال الـ States ب سطر واحد (SRP)
  const {
    effectiveDate,
    setEffectiveDate,
    tiers,
    addTier,
    removeLastTier,
    updateTierField,
    isSaving,
    error,
    success,
    handleSaveTariff,
  } = useAdminTariff();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* عرض صناديق الخطأ والنجاح التفاعلية */}
      <CustomAlert type="error" message={error} />
      <CustomAlert type="success" message={success} />

      {/* الكارت 1: تاريخ سريان ونفاذ الفاتورة الجديدة */}
      <CustomCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>إصدار وتاريخ سريان التعرفة الجديدة</Text>
        <Text style={styles.subLabel}>
          حدد تاريخ بدء العمل بأسعار الشرائح الجديدة؛ ليعتمدها السيرفر تلقائياً
          بمجرد حلول التاريخ:
        </Text>

        <CustomInput
          label="تاريخ نفاذ القرار الحكومي (YYYY-MM-DD)"
          placeholder="مثال: 2025-11-01"
          value={effectiveDate}
          onChangeText={setEffectiveDate}
        />
      </CustomCard>

      {/* الكارت 2: معالج بناء الشرائح التفاعلي الديناميكي */}
      <CustomCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>
          معالج بناء الشرائح الكهربائية (Dynamic Tiers)
        </Text>
        <Text style={styles.subLabel}>
          اضغط على إضافة شريحة لبناء هيكل الشرائح؛ وسيتم قفل وتحديد الحد الأدنى
          تلقائياً:
        </Text>

        {tiers.map((item, index) => {
          const isLast = index === tiers.length - 1;
          return (
            <View key={`tier-card-${item.tierNumber}`} style={styles.tierBox}>
              <Text style={styles.tierTitle}>
                الشريحة رقم {item.tierNumber}
              </Text>

              {/* الحد الأدنى للشرائح يظهر مقفلاً وتلقائياً لمنع التداخل الحسابي */}
              <View style={styles.disabledInputBox}>
                <Text style={styles.disabledLabel}>
                  الحد الأدنى للاستهلاك (تلقائي): {item.startKWh} ك.و.س
                </Text>
              </View>

              {/* حقل الحد الأعلى للشريحة (يُتاح لجميع الشرائح عدا الأخيرة المفتوحة) */}
              {!isLast ? (
                <CustomInput
                  label="الحد الأعلى للاستهلاك (ك.و.س)"
                  placeholder="مثال: 300"
                  value={item.endKWh}
                  onChangeText={(val) => updateTierField(index, "endKWh", val)}
                  keyboardType="numeric"
                />
              ) : (
                <View style={styles.openTierInfo}>
                  <Text style={styles.openTierText}>
                    📌 هذه هي الشريحة الأخيرة المفتوحة (سقف الاستهلاك مفتوح لما
                    فوق {item.startKWh} ك.و.س).
                  </Text>
                </View>
              )}

              <CustomInput
                label="سعر الكيلوواط الساعي في هذه الشريحة (بالليرة السورية)"
                placeholder="مثال: 600"
                value={item.pricePerKWh}
                onChangeText={(val) =>
                  updateTierField(index, "pricePerKWh", val)
                }
                keyboardType="numeric"
              />
            </View>
          );
        })}

        {/* أزرار إضافة وحذف الشرائح تفاعلياً */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={addTier}
          >
            <Text style={styles.controlBtnText}>➕ إضافة شريحة</Text>
          </TouchableOpacity>
          {tiers.length > 1 && (
            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: theme.colors.errorText },
              ]}
              onPress={removeLastTier}
            >
              <Text style={styles.controlBtnText}>➖ حذف الأخيرة</Text>
            </TouchableOpacity>
          )}
        </View>
      </CustomCard>

      {/* زر الحفظ النهائي والتفعيل التلقائي */}
      <CustomButton
        title={
          isSaving
            ? "جاري تفعيل وحفظ التعرفة..."
            : "حفظ وإصدار التعرفة الكهربائية الجديدة"
        }
        onPress={handleSaveTariff}
        color={theme.colors.primary}
        disabled={isSaving}
      />
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
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  tierBox: {
    backgroundColor: "#FAFAFA",
    padding: theme.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F4F8",
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  disabledInputBox: {
    width: "100%",
    height: 40,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  disabledLabel: {
    fontSize: 11,
    color: theme.colors.subtext,
    fontWeight: "bold",
  },
  openTierInfo: {
    backgroundColor: "#EBF5FB",
    padding: theme.spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#AED6F1",
    marginBottom: theme.spacing.sm,
  },
  openTierText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: "bold",
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.sm,
  },
  controlBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    width: "48%",
    justifyContent: "center",
    alignItems: "center",
  },
  controlBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});
