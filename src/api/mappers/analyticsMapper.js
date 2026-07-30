/**
 * AnalyticsMapper (DTO Transformer / Chart ViewModel Builder)
 * يقوم بتجهيز مصفوفات الرسوم البيانية وتجهيز النصوص وعناوين المحاور
 * لضمان عدم انهيار مكتبة react-native-chart-kit عند وجود بيانات فارغة.
 */
export const analyticsMapper = {
  toViewModel: (raw) => {
    if (!raw) return null;

    // 1. معالجة وتجهيز بيانات المخطط السنوي (آخر 12 شهراً)
    const rawMonthly = Array.isArray(raw.monthlyHistory)
      ? raw.monthlyHistory
      : [];
    const monthlyLabels = rawMonthly.map((item) => {
      const parts = (item.monthName || "").split(" ");
      return parts[0] ? parts[0].substring(0, 3) : "";
    });
    const monthlyValues = rawMonthly.map(
      (item) => parseFloat(item.consumptionKWh) || 0
    );

    // 2. معالجة وتجهيز بيانات المخطط اليومي (آخر 15 يوماً)
    const rawDaily = Array.isArray(raw.dailyHistory) ? raw.dailyHistory : [];
    const dailyLabels = rawDaily.map((item, idx) =>
      idx % 3 === 0 && item.date ? item.date.split("-")[2] : ""
    );
    const dailyActual = rawDaily.map((item) => parseFloat(item.actualKWh) || 0);
    const dailyPredicted = rawDaily.map(
      (item) => parseFloat(item.predictedKWh) || 0
    );

    // 3. استخراج وتنسيق أيام الشذوذ والأعطال
    const anomalousDays = rawDaily.filter((item) => item.isAnomalous);
    const hasAnomaly = anomalousDays.length > 0;
    const anomalyDatesString = anomalousDays
      .map((item) => (item.date ? item.date.split("-")[2] : ""))
      .join("، ");

    // 4. معالجة التنبؤ الشهري والدورة
    const p1 = parseFloat(raw.currentCycleForecast?.predictedMonth1KWh) || 0;
    const p2 = parseFloat(raw.currentCycleForecast?.predictedMonth2KWh) || 0;
    const totalPredictedCycleKWh = roundToTwo(p1 + p2);
    const expectedBillSYP =
      parseInt(raw.currentCycleForecast?.expectedBillSYP) || 0;

    return {
      meterId: raw.meterId || "",

      // مصفوفات المخطط السنوي الجاهزة للرسم مباشرة
      monthlyChart: {
        labels: monthlyLabels.length > 0 ? monthlyLabels : ["لا توجد بيانات"],
        values: monthlyValues.length > 0 ? monthlyValues : [0],
      },

      // مصفوفات المخطط اليومي الجاهزة للرسم مباشرة
      dailyChart: {
        labels: dailyLabels.length > 0 ? dailyLabels : ["لا توجد بيانات"],
        actualValues: dailyActual.length > 0 ? dailyActual : [0],
        predictedValues: dailyPredicted.length > 0 ? dailyPredicted : [0],
      },

      // التنبؤات والتحذيرات
      totalPredictedCycleKWh,
      expectedBillSYP,
      hasAnomaly,
      anomalyDatesString,
    };
  },
};

function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}
