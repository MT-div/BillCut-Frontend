import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

// استيراد المكونات المشتركة
import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import ProgressGauge from "../components/ProgressGauge";

// استيراد الـ Custom Hook وإدارة الجلسات والثيم
import { useDashboard } from "../hooks/useDashboard";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

export default function DashboardScreen() {
  const { logout, user } = useContext(AuthContext);

  // 1. إدارة حالة العداد النشط حالياً ديناميكياً (تبدأ من العداد الافتراضي للمستخدم)
  const [activeMeterId, setActiveMeterId] = useState(user?.defaultMeterId);

  // تحديث معرّف العداد النشط فوراً عند تغير العداد الافتراضي للجلسة
  useEffect(() => {
    if (user?.defaultMeterId) {
      setActiveMeterId(user.defaultMeterId);
    }
  }, [user?.defaultMeterId]);

  // تمرير معرّف العداد النشط المختار حالياً إلى الـ Hook لجلب بياناته حياً
  const { data, isLoading, isRefreshing, error, onRefresh } =
    useDashboard(activeMeterId);

  if (!activeMeterId) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.loadingText}>
          عذراً، لا يوجد عداد نشط مربوط بحسابك حالياً.
        </Text>
        <View style={{ height: theme.spacing.md }} />
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

  // قراءات الحدود والاستهلاك والتعرفة
  const supportLimit = parseFloat(data?.supportLimitKWh) || 300.0;
  const budgetLimit = parseFloat(data?.budgetLimitKWh) || 0.0;
  const actualConsumption = parseFloat(data?.cycleActualConsumptionKWh) || 0.0;

  // تفعيل التنبيهات الكبرى في أعلى لوحة المراقبة
  const showSupportBanner = actualConsumption >= supportLimit;
  const showBudgetBanner = budgetLimit > 0 && actualConsumption >= budgetLimit;

  const supportBannerMessage = showSupportBanner
    ? `تنبيه: لقد تجاوزت استهلاك الشريحة المدعومة لهذه الدورة (${parseInt(
        supportLimit
      )} ك.و.س)، الاستهلاك الإضافي سيُحتسب بسعر الشريحة العادية.`
    : null;

  const budgetBannerMessage = showBudgetBanner
    ? "تنبيه: لقد تجاوزت الميزانية المالية المستهدفة والمحددة من قبلك لهذه الدورة الكهربائية."
    : null;

  // التحقق الرياضي الدقيق لتنشيط رسائل التجاوز الأربعة التكيفية تحت كعب الكروت
  const isCycleExceeded =
    actualConsumption > parseFloat(data?.predictedCycleConsumptionKWh);
  const isTodayExceeded =
    parseFloat(data?.todayActualKWh) > parseFloat(data?.todayPredictedKWh);

  const isSubTargetExceeded =
    parseFloat(data?.todayActualKWh) > parseFloat(data?.avgSubTargetKWh) &&
    parseFloat(data?.avgSubTargetKWh) > 0;
  const isBudgetTargetExceeded =
    parseFloat(data?.todayActualKWh) > parseFloat(data?.avgBudgetTargetKWh) &&
    parseFloat(data?.avgBudgetTargetKWh) > 0;

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
      {/* 2. مبدل العدادات الأفقي التفاعلي (Chips) */}
      {user?.meters && user.meters.length > 1 && (
        <View style={styles.switcherContainer}>
          <Text style={styles.switcherTitle}>العداد الكهربائي النشط:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {user.meters.map((item) => {
              const isSelected = item.meterId === activeMeterId;
              return (
                <TouchableOpacity
                  key={item.meterId}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : "#E2E8F0",
                    },
                  ]}
                  onPress={() => setActiveMeterId(item.meterId)} // تبديل العداد حياً وجلب بياناته بكسر من الثانية
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
        </View>
      )}

      {/* عرض خطأ الاتصال بالسيرفر إن وجد */}
      <AlertBanner type="error" message={error} />

      {/* عرض لافتة تجاوز الشريحة المدعومة في الأعلى إن تحقق الشرط */}
      <AlertBanner type="error" message={supportBannerMessage} />

      {/* عرض لافتة تجاوز الميزانية المالية في الأعلى إن تحقق الشرط */}
      <AlertBanner type="error" message={budgetBannerMessage} />

      <CustomCard style={styles.gaugeCard}>
        <Text style={styles.cardTitle}>
          مؤشر استهلاك الدورة مقارنة بحد الدعم والميزانية
        </Text>

        {/* عرض المؤشرات الدائرية الجانبية بجانب بعضها لسهولة المقارنة البصرية */}
        <View style={styles.gaugesRow}>
          {/* الدائرة الأولى: الدعم */}
          <View style={styles.gaugeContainer}>
            <ProgressGauge value={actualConsumption} max={supportLimit} />
            <Text style={styles.gaugeLabel}>مؤشر استهلاك حد الدعم</Text>
            {/* إضافة قيمة حد الدعم بالكيلوواط تحت الدائرة مباشرة */}
            <Text style={styles.gaugeValueDetail}>
              حد الدعم: {parseInt(supportLimit)} ك.و.س
            </Text>
          </View>

          {/* الدائرة الثانية: الميزانية */}
          <View style={styles.gaugeContainer}>
            <ProgressGauge
              value={actualConsumption}
              max={budgetLimit > 0 ? budgetLimit : 1.0}
            />
            <Text style={styles.gaugeLabel}>مؤشر استهلاك الميزانية</Text>
            {/* إضافة قيمة الميزانية بالليرة السورية تحت الدائرة مباشرة (حل الـ NaN) */}
            <Text
              style={[styles.gaugeValueDetail, { color: theme.colors.primary }]}
            >
              الميزانية:{" "}
              {budgetLimit > 0
                ? `${parseInt(data?.targetBudgetSYP)} ل.س`
                : "غير محددة"}
            </Text>
          </View>
        </View>

        {/* عرض الأرقام خارج الدائرة بكروت منسقة وخالية من الفواصل العشرية */}
        <View style={styles.gaugeStats}>
          <Text style={styles.statsText}>
            الاستهلاك الفعلي للدورة: {data?.cycleActualConsumptionKWh} ك.و.س
          </Text>
          <Text
            style={[
              styles.statsText,
              { color: theme.colors.primary, marginTop: 4 },
            ]}
          >
            التكلفة المالية المتراكمة: {data?.accumulatedCostSYP} ل.س
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

      {/* كارت التقديرات المالية والاستهلاكية بنهاية الدورة */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>
            التقديرات المالية والاستهلاكية بنهاية الدورة (AI)
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              الاستهلاك الإجمالي المتوقع للدورة:
            </Text>
            <Text style={styles.infoValue}>
              {data?.predictedCycleConsumptionKWh} ك.و.س
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              الفاتورة المالية الإجمالية المتوقعة:
            </Text>
            <Text style={styles.infoValue}>{data?.predictedBillSYP} ل.س</Text>
          </View>
        </CustomCard>
        {/* التحذير 1: لقد تجاوزت الاستهلاك المتوقع لهذه الدورة */}
        {isCycleExceeded && (
          <Text style={styles.alertUnderCard}>
            ⚠️ لقد تجاوزت الاستهلاك المتوقع لهذه الدورة الكهربائية.
          </Text>
        )}
      </View>

      {/* كارت استهلاك اليوم الحالي */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>مراقبة استهلاك اليوم الحالي</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>الاستهلاك الفعلي حتى اللحظة:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
              {data?.todayActualKWh} ك.و.س
            </Text>
          </View>
          <View style={styles.infoRow}>
            {/* تعديل المسمى ليكون الاستهلاك المتوقع لليوم */}
            <Text style={styles.infoLabel}>الاستهلاك المتوقع لليوم:</Text>
            <Text style={styles.infoValue}>
              {data?.todayPredictedKWh} ك.و.س
            </Text>
          </View>
        </CustomCard>
        {/* التحذير 2: لقد تجاوزت الاستهلاك المتوقع لليوم */}
        {isTodayExceeded && (
          <Text style={styles.alertUnderCard}>
            ⚠️ لقد تجاوزت الاستهلاك المتوقع المخطط له لليوم الحالي.
          </Text>
        )}
      </View>

      {/* كارت الحدود الاستهلاكية اليومية المستهدفة لليوم الحالي */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>
            الحدود اليومية المتاحة للأيام المتبقية
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>المعدل اليومي للبقاء في الدعم:</Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.successText }]}
            >
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

        {/* التحذير 3: لقد تجاوزت المعدل اليومي للبقاء في الدعم */}
        {isSubTargetExceeded && (
          <Text style={styles.alertUnderCard}>
            ⚠️ لقد تجاوزت المعدل اليومي الموصى به للبقاء في الدعم، سوف يتم حساب
            المعدل الجديد في نهاية اليوم عند منتصف الليل.
          </Text>
        )}

        {/* التحذير 4: لقد تجاوزت المعدل اليومي للبقاء في الميزانية */}
        {isBudgetTargetExceeded && (
          <Text
            style={[
              styles.alertUnderCard,
              {
                color: theme.colors.secondary,
                borderColor: theme.colors.secondary,
              },
            ]}
          >
            ⚠️ لقد تجاوزت المعدل اليومي الموصى به للبقاء ضمن ميزانيتك الشخصية،
            سوف يتم حساب المعدل الجديد في نهاية اليوم عند منتصف الليل.
          </Text>
        )}
      </View>
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
  gaugeCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    alignSelf: "center",
    textAlign: "center",
  },
  smallCardTitle: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
  gaugeContainer: {
    alignItems: "center",
    width: "48%",
  },
  gaugeLabel: {
    fontSize: 10,
    color: theme.colors.subtext,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: theme.spacing.xs,
    lineHeight: 14,
  },
  gaugeValueDetail: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.text,
    marginTop: 4,
    textAlign: "center",
  },
  gaugeStats: {
    alignItems: "center",
    marginTop: theme.spacing.sm,
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
  sectionContainer: {
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  cardNoMargin: {
    marginBottom: 0,
  },
  alertUnderCard: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: theme.colors.errorText,
    backgroundColor: "#FFF2F2",
    padding: theme.spacing.sm,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.colors.errorText,
    textAlign: "right",
    lineHeight: 16,
  },
  // تصميم مبدل العدادات الأفقي الأنيق
  switcherContainer: {
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  switcherTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  chipsRow: {
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
