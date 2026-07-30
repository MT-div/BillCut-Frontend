import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Circle } from "react-native-svg";

import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import { useAnalytics } from "../hooks/useAnalytics";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_INNER_WIDTH = SCREEN_WIDTH - 48;

export default function AnalyticsScreen() {
  const { user } = useContext(AuthContext);

  const [activeMeterId, setActiveMeterId] = useState(user?.defaultMeterId);

  useEffect(() => {
    if (user?.defaultMeterId) {
      setActiveMeterId(user.defaultMeterId);
    }
  }, [user?.defaultMeterId]);

  const { data, isLoading, isRefreshing, error, onRefresh } =
    useAnalytics(activeMeterId);

  if (!activeMeterId) {
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

  const barChartConfig = {
    ...baseChartConfig,
    barPercentage: 0.45,
  };

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
      {/* مبدل العدادات الأفقي التفاعلي (Chips) */}
      {user?.meters && user.meters.length > 1 && (
        <View style={styles.switcherContainer}>
          <Text style={styles.switcherTitle}>
            العداد الكهربائي النشط في التحليلات:
          </Text>
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
                  onPress={() => setActiveMeterId(item.meterId)}
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

      <AlertBanner type="error" message={error} />

      {/* المخطط الأول: الاستهلاك السنوي بالأعمدة المتباعدة */}
      <CustomCard>
        <Text style={styles.cardTitle}>
          تحليلات الاستهلاك السنوي (آخر 12 شهراً)
        </Text>

        <BarChart
          data={{
            labels: data?.monthlyChart?.labels || ["لا توجد بيانات"],
            datasets: [{ data: data?.monthlyChart?.values || [0] }],
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
              {data?.totalPredictedCycleKWh || 0} ك.و.س
            </Text>
          </View>
          <View style={styles.forecastRow}>
            <Text style={styles.forecastLabel}>
              الفاتورة المالية الإجمالية المتوقعة:
            </Text>
            <Text
              style={[styles.forecastValue, { color: theme.colors.primary }]}
            >
              {data?.expectedBillSYP || 0} ل.س
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
              labels: data?.dailyChart?.labels || ["لا توجد بيانات"],
              datasets: [
                {
                  data: data?.dailyChart?.actualValues || [0],
                  color: (opacity = 1) => `rgba(27, 79, 114, ${opacity})`,
                  strokeWidth: 3,
                },
                {
                  data: data?.dailyChart?.predictedValues || [0],
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
            renderDotContent={({ x, y, index, indexData }) => {
              const actualVal = data?.dailyChart?.actualValues?.[index];
              const isActualDataset = indexData === actualVal;

              return (
                <Circle
                  key={`dot-${indexData}-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={
                    isActualDataset ? theme.colors.primary : "rgb(93, 173, 226)"
                  }
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              );
            }}
          />

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

        {data?.hasAnomaly && (
          <Text style={styles.alertUnderCard}>
            ⚠️ تحذير عاجل: كشف النظام نمط استهلاك شاذ وغير اعتيادي (عطل أو تسريب
            كهربائي محتمل) في أيام التواريخ التالية: ({data?.anomalyDatesString}
            ). يرجى التحقق من سلامة الأجهزة الكهربائية النشطة في تلك الأيام
            لتلافي الهدر المالي.
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
