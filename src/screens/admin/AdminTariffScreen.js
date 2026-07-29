import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
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
  const {
    activeTab,
    setActiveTab,
    tariffs,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    success,
    onRefresh,
    // حقول التاريخ الثلاثية المضافة
    year,
    setYear,
    month,
    setMonth,
    day,
    setDay,
    tiers,
    addTier,
    removeLastTier,
    updateTierField,
    handleSaveTariff,
    handleDeleteTariff,
  } = useAdminTariff();

  const renderTariffItem = (item) => {
    const isFuture = new Date(item.effectiveDate) > new Date();

    return (
      <CustomCard
        key={`tariff-version-${item.versionId}`}
        style={styles.tariffCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderTitle}>
            إصدار التعرفة رقم {item.versionId}
          </Text>
          <Text
            style={[
              styles.statusTag,
              {
                backgroundColor: isFuture ? "#FCF3CF" : "#EBF5FB",
                color: isFuture ? "#856404" : theme.colors.primary,
              },
            ]}
          >
            {isFuture ? "مستقبلية (لم تطبق بعد)" : "سارية المفعول حالياً"}
          </Text>
        </View>
        <Text style={styles.dateText}>
          تاريخ بدء سريان الأسعار: {item.effectiveDate}
        </Text>

        <View style={styles.tiersTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: "15%" }]}>
              الشريحة
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
              الحد الأدنى
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
              الحد الأعلى
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
              السعر
            </Text>
          </View>
          {item.tiers &&
            item.tiers.map((t) => (
              <View key={`tier-row-${t.tierId}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  {t.tierNumber}
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {parseInt(t.startKWh)}
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>
                  {t.endKWh ? parseInt(t.endKWh) : "مفتوح"}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      width: "25%",
                      color: theme.colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {parseInt(t.pricePerKWh)} ل.س
                </Text>
              </View>
            ))}
        </View>

        {/* زر حذف التعرفة المستقبلية جاهز ومدمج برمجياً لحذف كامل التعرفة سحابياً عند نقرة واحدة */}
        {isFuture && (
          <TouchableOpacity
            style={styles.deleteTariffBtn}
            onPress={() => handleDeleteTariff(item.versionId)}
          >
            <Text style={styles.deleteTariffBtnText}>
              حذف وإلغاء هذه التعرفة المستقبلية
            </Text>
          </TouchableOpacity>
        )}
      </CustomCard>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري استيراد سجلات التعرفة والشرائح...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomAlert type="error" message={error} />
      <CustomAlert type="success" message={success} />

      {/* أزرار تبويب النظام المدمجة (Segmented Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "view" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("view")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "view" && styles.activeTabText,
            ]}
          >
            استعراض التعرفات النشطة والمستقبلية
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "create" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("create")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "create" && styles.activeTabText,
            ]}
          >
            تحديد وإضافة تعرفة جديدة
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================== أولاً: محتوى التبويب الأول (استعراض التعرفات) ==================== */}
      {activeTab === "view" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {tariffs && tariffs.length > 0 ? (
            tariffs.map((item) => renderTariffItem(item))
          ) : (
            <View style={styles.emptyCenter}>
              <Text style={styles.emptyText}>سجل التعرفات فارغ حالياً.</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // ==================== ثانياً: محتوى التبويب الثاني (تصميم الجدول الأفقي الرشيق) ====================
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* الكارت 1: إدخال التاريخ بالصيغة الثلاثية الأفقية الاحترافية والمنسقة لـ الـ RTL */}
          <CustomCard style={styles.sectionCard}>
            <Text style={styles.cardTitle}>
              تاريخ سريان ونفاذ الأسعار الجديدة
            </Text>
            <Text style={styles.subLabel}>
              أدخل تاريخ بدء سريان التعرفة بالتفصيل (يجب أن تفرز كالسنة، الشهر،
              اليوم):
            </Text>

            <View style={styles.dateInputRow}>
              <View style={styles.dateInputContainer}>
                <CustomInput
                  label="السنة (YYYY)"
                  placeholder="2026"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.dateSeparator}>-</Text>
              <View style={styles.dateInputContainer}>
                <CustomInput
                  label="الشهر (MM)"
                  placeholder="08"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.dateSeparator}>-</Text>
              <View style={styles.dateInputContainer}>
                <CustomInput
                  label="اليوم (DD)"
                  placeholder="01"
                  value={day}
                  onChangeText={setDay}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </CustomCard>

          <CustomCard style={styles.sectionCard}>
            <Text style={styles.cardTitle}>
              بناء وهيكلة شرائح التعرفة الجديدة
            </Text>
            <Text style={styles.subLabel}>
              الحد الأدنى لكل شريحة يُحسب تلقائياً من الحد الأعلى للشريحة التي
              قبلها. الشريحة الأخيرة تُعتبر دائماً مفتوحة الحد الأعلى؛ أي قيمة
              تكتبها في حقلها سيتم تجاهلها عند إصدار التعرفة (وسيظهر لك تنبيه
              بذلك).
            </Text>

            <View style={styles.gridHeaderRow}>
              <Text style={[styles.gridHeaderCell, { width: "12%" }]}>
                شريحة
              </Text>
              <Text style={[styles.gridHeaderCell, { width: "26%" }]}>
                حد أدنى
              </Text>
              <Text style={[styles.gridHeaderCell, { width: "28%" }]}>
                حد أعلى
              </Text>
              <Text style={[styles.gridHeaderCell, { width: "26%" }]}>
                سعر (ل.س)
              </Text>
            </View>

            {tiers.map((item, index) => (
              <View
                key={`grid-row-${item.tierNumber}`}
                style={styles.gridBodyRow}
              >
                <View style={[styles.gridCellWrap, { width: "12%" }]}>
                  <Text style={styles.gridCellText}>{item.tierNumber}</Text>
                </View>

                <View style={[styles.gridDisabledInput, { width: "26%" }]}>
                  <Text style={styles.gridDisabledText}>{item.startKWh}</Text>
                </View>

                <View style={styles.gridInputWrap}>
                  <CustomInput
                    placeholder="مفتوح"
                    value={item.endKWh}
                    onChangeText={(val) =>
                      updateTierField(index, "endKWh", val)
                    }
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.gridInputWrap}>
                  <CustomInput
                    placeholder="600"
                    value={item.pricePerKWh}
                    onChangeText={(val) =>
                      updateTierField(index, "pricePerKWh", val)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}

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

          <CustomButton
            title={
              isSaving
                ? "جاري تفعيل وحفظ التعرفة..."
                : "تنشيط وإصدار التعرفة الكهربائية الجديدة"
            }
            onPress={handleSaveTariff}
            color={theme.colors.primary}
            disabled={isSaving}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.subtext,
  },
  activeTabText: {
    color: theme.colors.primary,
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
  emptyCenter: {
    paddingVertical: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.subtext,
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
    fontSize: 11.5,
    color: theme.colors.subtext,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
    textAlign: "right",
  },
  sectionCard: {
    marginBottom: theme.spacing.md,
  },
  tariffCard: {
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
    width: "100%",
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  statusTag: {
    fontSize: 9.5,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 11,
    color: theme.colors.subtext,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    textAlign: "right",
  },
  tiersTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EDF2F7",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeaderCell: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableCell: {
    fontSize: 11.5,
    color: theme.colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  deleteTariffBtn: {
    backgroundColor: "#FDEDEC",
    borderWidth: 1,
    borderColor: theme.colors.errorText,
    borderRadius: 6,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  deleteTariffBtnText: {
    color: theme.colors.errorText,
    fontSize: 11,
    fontWeight: "bold",
  },
  gridHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  gridHeaderCell: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },
  // صف الشريحة: كل الخلايا الآن بنفس الارتفاع الثابت ومحاذاة مركزية موحدة، بلا هوامش سالبة
  gridBodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing.sm,
  },
  gridInputWrap: {
    width: "28%",
    justifyContent: "center",
  },
  gridCellWrap: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  gridCellText: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  gridDisabledInput: {
    height: 48,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gridDisabledText: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.lg,
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
  // تصميم حقول التاريخ الثلاثية الأفقية التفاعلية المتأصلة لـ RTL
  dateInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: theme.spacing.xs,
  },
  dateInputContainer: {
    // توزيع الحقول بنسب متناسقة وعريضة لتتناسب مع مدخلات السنة الكبرى
    width: "28%",
  },
  dateSeparator: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.border,
    marginHorizontal: theme.spacing.sm,
    marginTop: 10, // موازنة ميكانيكية للشرطة الفاصلة بين الحقول الثلاثة
  },
});
