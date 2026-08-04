import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

import CustomCard from "../../components/CustomCard";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import CustomAlert from "../../components/CustomAlert";

import { AuthContext } from "../../context/AuthContext";
import { useAdminHome } from "../../hooks/admin/useAdminHome";
import { theme } from "../../theme/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_INNER_WIDTH = SCREEN_WIDTH - 64;

export default function AdminHomeScreen() {
  const { user, logout, toggleViewMode } = useContext(AuthContext);
  const {
    stats,
    thresholdData,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    customTargetMeanInput,
    setCustomTargetMeanInput,
    isUpdatingThreshold,
    thresholdSuccessMsg,
    thresholdErrorMsg,
    handleUpdateThreshold,
  } = useAdminHome();

  const barChartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(27, 79, 114, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(87, 101, 116, ${opacity})`,
    barPercentage: 0.45,
    style: {
      borderRadius: 12,
    },
  };

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

      {/* 2. كارت إحصائيات المنظومة الحية */}
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

      {/* 3. كارت إجمالي الاستهلاك الشهري لكافة المشتركين (System-Wide Monthly Consumption) */}
      <CustomCard style={styles.systemMonthlyCard}>
        <Text style={styles.cardTitle}>
          إجمالي الاستهلاك الشهري العام لكافة المشتركين (آخر 12 شهراً)
        </Text>
        <Text style={styles.subLabel}>
          تجميع سحابي ومباشر لكافة قراءات العدادات المسجلة في المنظومة (kWh):
        </Text>

        <BarChart
          data={{
            labels: stats?.systemMonthlyChart?.labels || ["لا توجد بيانات"],
            datasets: [{ data: stats?.systemMonthlyChart?.values || [0] }],
          }}
          width={CARD_INNER_WIDTH}
          height={210}
          yAxisSuffix=" k"
          chartConfig={barChartConfig}
          verticalLabelRotation={0}
          fromZero
          style={styles.chartStyle}
        />
      </CustomCard>

      {/* 4. كارت الرسم البياني المرتفع لكثافة الأخطاء */}
      {thresholdData?.chartImageUri && (
        <CustomCard style={styles.largeChartCard}>
          <Text style={styles.chartMainTitle}>
            مخطط توزيع كثافة أخطاء التنبؤ وتحديد العتبات (EVT)
          </Text>
          <View style={styles.largeChartWrapper}>
            <Image
              source={{ uri: thresholdData.chartImageUri }}
              style={styles.largeDensityImage}
              resizeMode="contain"
            />
          </View>
        </CustomCard>
      )}

      {/* 5. كارت حوكمة ومعايرة العتبات المنسق */}
      <CustomCard style={styles.thresholdCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>معايرة وتكيّف العتبة الإقليمية</Text>
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>معايرة متكيفة ⚡</Text>
          </View>
        </View>

        <Text style={styles.subLabel}>
          مقارنة قيم المرجعية والفعالة الحالية مع القيمة المقترحة آلياً بناءً
          على متوسط النظام:
        </Text>

        <View style={styles.infoDetailsTable}>
          <View style={styles.infoDetailRow}>
            <Text style={styles.infoDetailLabel}>العتبة الفعّالة الحالية:</Text>
            <Text style={styles.infoDetailValueHighlight}>
              {thresholdData?.calculatedThresholdKWh} kWh/يوم
            </Text>
          </View>

          <View style={styles.infoDetailRow}>
            <Text style={styles.infoDetailLabel}>
              العتبة المقترحة آلياً بالنظام:
            </Text>
            <Text style={styles.infoDetailValueProposed}>
              {thresholdData?.proposedSystemThresholdKWh} kWh/يوم
            </Text>
          </View>

          <View style={styles.infoDetailRow}>
            <Text style={styles.infoDetailLabel}>
              متوسط استهلاك النظام الحالي (المحسوب):
            </Text>
            <Text style={styles.infoDetailValue}>
              {thresholdData?.systemCalculatedMeanKWh} kWh/يوم
            </Text>
          </View>

          <View style={styles.infoDetailRow}>
            <Text style={styles.infoDetailLabel}>
              العتبة المرجعية الأساسية (القاعدة):
            </Text>
            <Text style={styles.infoDetailValue}>
              {thresholdData?.baseThresholdKWh} kWh/يوم
            </Text>
          </View>

          <View style={[styles.infoDetailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoDetailLabel}>
              متوسط الاستهلاك المرجعي الأساسي:
            </Text>
            <Text style={styles.infoDetailValue}>
              {thresholdData?.baseMeanKWh} kWh/يوم
            </Text>
          </View>
        </View>

        <CustomInput
          label="تخصيص متوسط استهلاك المنطقة يدوياً (اختياري)"
          placeholder={`المحسوب آلياً: ${thresholdData?.systemCalculatedMeanKWh} kWh`}
          value={customTargetMeanInput}
          onChangeText={setCustomTargetMeanInput}
          keyboardType="numeric"
        />

        <CustomButton
          title={
            isUpdatingThreshold
              ? "جاري التطبيق والتكيّف..."
              : "اعتماد وتفعيل العتبة التناسبة ⚡"
          }
          onPress={handleUpdateThreshold}
          color={theme.colors.primary}
          disabled={isUpdatingThreshold}
        />

        <CustomAlert type="error" message={thresholdErrorMsg} />
        <CustomAlert type="success" message={thresholdSuccessMsg} />
      </CustomCard>
      {/* 1. كارت الترحيب وزر التبديل */}
      <CustomCard style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          مرحباً بك يا مدير النظام، {user?.fullName}
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
  welcomeCard: {
    backgroundColor: "#EBF5FB",
    borderWidth: 1,
    borderColor: "#AED6F1",
    marginBottom: theme.spacing.md,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  chartMainTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
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
    marginBottom: theme.spacing.md,
  },
  halfCard: {
    width: "48%",
    alignItems: "center",
    marginBottom: 0,
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
  systemMonthlyCard: {
    marginBottom: theme.spacing.md,
  },
  largeChartCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  largeChartWrapper: {
    width: "100%",
    height: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
  },
  largeDensityImage: {
    width: "100%",
    height: "100%",
  },
  chartStyle: {
    marginVertical: theme.spacing.xs,
    borderRadius: 8,
    alignSelf: "center",
  },
  thresholdCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    width: "100%",
  },
  activeTag: {
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.successText,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.successText,
  },
  infoDetailsTable: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F4F8",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  infoDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  infoDetailLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "600",
  },
  infoDetailValue: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  infoDetailValueHighlight: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  infoDetailValueProposed: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: theme.colors.secondary,
  },
});
