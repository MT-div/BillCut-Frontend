import React, { useContext } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import ProgressGauge from "../components/ProgressGauge";

import { useDashboard } from "../hooks/useDashboard";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

export default function DashboardScreen() {
  const { logout, user } = useContext(AuthContext);

  //# قراءة معرف العداد المربوط بالحساب ديناميكياً لمنع جمود الكود
  const meterId = user?.defaultMeterId;

  const { data, isLoading, isRefreshing, error, onRefresh } =
    useDashboard(meterId); //# يمرر المعرف الديناميكي

  if (!meterId) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.loadingText}>
          عذراً، لا يوجد عداد نشط مربوط بحسابك حالياً.
        </Text>
        <Button
          title="تسجيل الخروج الآمن"
          color={theme.colors.errorText}
          onPress={logout}
        />
      </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري استرداد بيانات العداد الذكية...
        </Text>
      </View>
    );
  }

  //# قراءة حد الدعم الممرر ديناميكياً من السيرفر (مثل 300)
  const supportLimit = data?.supportLimitKWh || 300.0;
  const showBanner = data?.cycleActualConsumptionKWh >= supportLimit;

  const bannerMessage = showBanner
    ? `تنبيه: لقد تجاوزت استهلاك الشريحة المدعومة لهذه الدورة (${parseInt(
        supportLimit
      )} ك.و.س)، الاستهلاك الإضافي سيُحتسب بسعر الشريحة العادية.`
    : null;

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
      <AlertBanner type="error" message={bannerMessage || error} />

      <CustomCard style={styles.gaugeCard}>
        <Text style={styles.cardTitle}>
          مؤشر تقدم استهلاك الدورة الكهربائية
        </Text>

        {/* الدائرة أصبحت صامتة وبدون أي كتابة بداخلها لراحة العين والجمالية */}
        <ProgressGauge
          value={data?.cycleActualConsumptionKWh || 0.0}
          max={supportLimit}
        />

        {/* عرض الأرقام خارج الدائرة بكروت منسقة وخالية من الفواصل العشرية */}
        <View style={styles.gaugeStats}>
          <Text style={styles.statsText}>
            الاستهلاك الحالي: {data?.cycleActualConsumptionKWh} ك.و.س
          </Text>
          <Text
            style={[
              styles.statsText,
              { color: theme.colors.primary, marginTop: 4 },
            ]}
          >
            التكلفة الحالية: {data?.accumulatedCostSYP} ل.س
          </Text>
        </View>
        <Text style={styles.dateRangeText}>
          دورة: {data?.cycleStartDate} إلى {data?.cycleEndDate}
        </Text>
      </CustomCard>

      <View style={styles.row}>
        <CustomCard style={styles.halfCard}>
          <Text style={styles.smallCardTitle}>الأيام المنقضية</Text>
          <Text style={styles.numberBig}>{data?.cycleProgressDays} أيام</Text>
        </CustomCard>
        <CustomCard style={styles.halfCard}>
          <Text style={styles.smallCardTitle}>الأيام المتبقية</Text>
          <Text style={[styles.numberBig, { color: theme.colors.secondary }]}>
            {data?.cycleRemainingDays} يوماً
          </Text>
        </CustomCard>
      </View>

      <CustomCard>
        <Text style={styles.cardTitle}>
          التقديرات المالية بنهاية الدورة (AI)
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الفاتورة الإجمالية المتوقعة:</Text>
          <Text style={styles.infoValue}>{data?.predictedBillSYP} ل.س</Text>
        </View>
      </CustomCard>

      <CustomCard>
        <Text style={styles.cardTitle}>مراقبة استهلاك اليوم الحالي</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الاستهلاك الفعلي حتى اللحظة:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
            {data?.todayActualKWh} ك.و.س
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>الاستهلاك اليومي المتوقع للغد:</Text>
          <Text style={styles.infoValue}>{data?.todayPredictedKWh} ك.و.س</Text>
        </View>
      </CustomCard>

      <CustomCard>
        <Text style={styles.cardTitle}>
          الحدود اليومية المتاحة للأيام المتبقية
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>المعدل اليومي للبقاء في الدعم:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.successText }]}>
            {data?.avgSubTargetKWh} ك.و.س
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            المعدل اليومي للبقاء في الميزانية:
          </Text>
          <Text style={[styles.infoValue, { color: theme.colors.secondary }]}>
            {data?.avgBudgetTargetKWh} ك.و.س
          </Text>
        </View>
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
  gaugeCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  smallCardTitle: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  gaugeStats: {
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  statsText: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  dateRangeText: {
    fontSize: 11,
    color: theme.colors.subtext,
    marginTop: theme.spacing.sm,
    fontWeight: "600",
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
  numberBig: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.colors.subtext,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
  },
});
