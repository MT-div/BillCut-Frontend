import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Circle } from "react-native-svg";

// استيراد المكونات المشتركة والـ Hooks والـ ثيم
import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import { useAnalytics } from "../hooks/useAnalytics";
import { theme } from "../theme/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_INNER_WIDTH = SCREEN_WIDTH - 48; // نفس العرض المتاح داخل الكارت، بدون أي تمرير أفقي

export default function AnalyticsScreen() {
  const { data, isLoading, isRefreshing, error, onRefresh, meterId } =
    useAnalytics();

  if (!meterId) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.loadingText}>
          عذراً، لا يوجد عداد نشط مربوط بحسابك لعرض تحليلاته.
        </Text>
      </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري استدعاء الرسوم البيانية والتحليلات الذكية...
        </Text>
      </View>
    );
  }

  // 1. اختصار أسماء الأشهر لأول 3 أحرف
  const monthlyLabels =
    data?.monthlyHistory?.map((item) => {
      const parts = item.monthName.split(" ");
      return parts[0].substring(0, 3);
    }) || [];
  const monthlyValues = data?.monthlyHistory?.map((item) =>
    parseFloat(item.consumptionKWh)
  ) || [0];

  // 2. إعداد مصفوفة الـ 15 يوماً الأخيرة
  // نعرض تسمية كل 3 نقاط فقط لتجنب ازدحام النص (العرض ثابت الآن بدون تمرير)
  const dailyLabels =
    data?.dailyHistory?.map((item, idx) =>
      idx % 3 === 0 ? item.date.split("-")[2] : ""
    ) || [];
  const dailyActual = data?.dailyHistory?.map((item) =>
    parseFloat(item.actualKWh)
  ) || [0];
  const dailyPredicted = data?.dailyHistory?.map((item) =>
    parseFloat(item.predictedKWh)
  ) || [0];

  const anomalousDays =
    data?.dailyHistory?.filter((item) => item.isAnomalous) || [];
  const hasAnomaly = anomalousDays.length > 0;
  const anomalyDatesString = anomalousDays
    .map((item) => item.date.split("-")[2])
    .join("، ");

  // إعدادات مشتركة أساسية بين المخططين
  const baseChartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(27, 79, 114, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(87, 101, 116, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  // إعدادات خاصة بمخطط الأعمدة (السنوي): نبقيها كما هي بالضبط لأن التظليل
  // والألوان طلعت جميلة زي ما هي، فقط نضيف حل تلاصق الأعمدة (barPercentage)
  const barChartConfig = {
    ...baseChartConfig,
    barPercentage: 0.45,
  };

  // إعدادات خاصة بالمخطط الخطي (اليومي): بدون أي تظليل تحت المنحنى، وبدون
  // نقاط افتراضية من المكتبة (سنرسمها نحن يدوياً بالأسفل عبر renderDotContent)
  const lineChartConfig = {
    ...baseChartConfig,
    fillShadowGradientOpacity: 0,
    propsForDots: {
      r: "0",
    },
  };

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
      <AlertBanner type="error" message={error} />

      {/* المخطط الأول: الاستهلاك السنوي بالأعمدة المتباعدة */}
      <CustomCard>
        <Text style={styles.cardTitle}>
          تحليلات الاستهلاك السنوي (آخر 12 شهراً)
        </Text>

        <BarChart
          data={{
            labels: monthlyLabels,
            datasets: [{ data: monthlyValues }],
          }}
          width={CARD_INNER_WIDTH}
          height={220}
          yAxisSuffix=" k"
          chartConfig={barChartConfig}
          verticalLabelRotation={0}
          fromZero
          style={styles.chart}
        />

        <View style={styles.forecastBox}>
          <Text style={styles.forecastTitle}>
            التقدير السحابي للدورة الكهربائية الحالية (AI):
          </Text>
          <View style={styles.forecastRow}>
            <Text style={styles.forecastLabel}>
              الاستهلاك الإجمالي المقدر للشهرين:
            </Text>
            <Text style={styles.forecastValue}>
              {parseFloat(data?.currentCycleForecast?.predictedMonth1KWh || 0) +
                parseFloat(
                  data?.currentCycleForecast?.predictedMonth2KWh || 0
                )}{" "}
              ك.و.س
            </Text>
          </View>
          <View style={styles.forecastRow}>
            <Text style={styles.forecastLabel}>
              الفاتورة المالية الإجمالية المتوقعة:
            </Text>
            <Text
              style={[styles.forecastValue, { color: theme.colors.primary }]}
            >
              {data?.currentCycleForecast?.expectedBillSYP} ل.س
            </Text>
          </View>
        </View>
      </CustomCard>

      {/* المخطط الثاني: مقارنة الاستهلاك اليومي وكشف الخلل */}
      <View style={styles.sectionContainer}>
        <CustomCard style={styles.cardNoMargin}>
          <Text style={styles.cardTitle}>
            مقارنة الاستهلاك اليومي وكشف الخلل (آخر 15 يوماً)
          </Text>

          <LineChart
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  data: dailyActual,
                  color: (opacity = 1) => `rgba(27, 79, 114, ${opacity})`,
                  strokeWidth: 3,
                },
                {
                  data: dailyPredicted,
                  color: (opacity = 1) => `rgba(93, 173, 226, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={CARD_INNER_WIDTH}
            height={220}
            chartConfig={lineChartConfig}
            bezier
            fromZero
            withShadow={false}
            style={styles.chart}
            // نتحكم يدوياً بكل نقطة: المكتبة تستدعي هذا الكولباك لكل نقطة من كل
            // الـ datasets بالترتيب (كل نقاط dailyActual أولاً، ثم dailyPredicted).
            // بهيك منضمن 100% إنو المنحنى المتوقع ما يرسم ولا نقطة إطلاقاً،
            // بدل الاعتماد على withDots اللي بيضل عم يفشل أحياناً حسب نسخة المكتبة.
            // نرسم نقطة لكل قيمة من الاثنين، كل وحدة بموقعها الحقيقي (y الخاص فيها
            // المبني على قيمتها الفعلية)، بس بلون وحجم مختلف حتى تنميّز عن بعض
            // بوضوح حتى لو كانت قريبة من بعضها (لأن القيمتين قريبتين فعلياً في تلك النقطة).
            // ملاحظة مهمة: المكتبة بترجع "index" يبدأ من صفر لكل dataset لحاله
            // (مش رقم متسلسل عبر الاثنين)، فما بينفع نستخدمه لتمييز نوع
            // الداتاسيت. الحل: نقارن قيمة النقطة نفسها (indexData) بمصفوفة
            // الفعلي بنفس الموقع، وهيك نعرف بالتأكيد من أي منحنى جاية النقطة.
            renderDotContent={({ x, y, index, indexData }) => {
              const isActualDataset = indexData === dailyActual[index];

              if (isActualDataset) {
                return (
                  <Circle
                    key={`actual-dot-${index}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={theme.colors.primary}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                );
              }

              return (
                <Circle
                  key={`predicted-dot-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="rgb(93, 173, 226)"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              );
            }}
          />

          {/* صندوق إرشادي مخصص (Custom Legend Row) */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text style={styles.legendText}>الاستهلاك الفعلي</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: theme.colors.secondary },
                ]}
              />
              <Text style={styles.legendText}>الاستهلاك المتوقع</Text>
            </View>
          </View>
        </CustomCard>

        {/* صندوق تحذير كشف الخلل والشذوذ */}
        {hasAnomaly && (
          <Text style={styles.alertUnderCard}>
            ⚠️ تحذير عاجل: كشف النظام نمط استهلاك شاذ وغير اعتيادي (عطل أو تسريب
            كهربائي محتمل) في أيام التواريخ التالية: ({anomalyDatesString}).
            يرجى التحقق من سلامة الأجهزة الكهربائية النشطة في تلك الأيام لتلافي
            الهدر المالي.
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
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    alignSelf: "flex-start",
  },
  chart: {
    marginVertical: theme.spacing.xs,
    borderRadius: 8,
  },
  forecastBox: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  forecastTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 2,
  },
  forecastLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    fontWeight: "500",
  },
  forecastValue: {
    fontSize: 13,
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
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginLeft: theme.spacing.xs,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "bold",
  },
});
