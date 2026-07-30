/**
 * DashboardMapper (DTO Transformer / ViewModel Builder)
 * يحول استجابة الباكند الخام إلى نموذج عرض متكامل (ViewModel) جاهز للشاشة
 * ويحسب كافة أعلام التنبؤ والتجاوز مسبقاً لراحة الشاشة.
 */
export const dashboardMapper = {
  toViewModel: (raw) => {
    if (!raw) return null;

    const supportLimit = parseFloat(raw.supportLimitKWh) || 300.0;
    const budgetLimit = parseFloat(raw.budgetLimitKWh) || 0.0;
    const actualConsumption = parseFloat(raw.cycleActualConsumptionKWh) || 0.0;

    const todayActual = parseFloat(raw.todayActualKWh) || 0.0;
    const todayPredicted = parseFloat(raw.todayPredictedKWh) || 0.0;
    const avgSubTarget = parseFloat(raw.avgSubTargetKWh) || 0.0;
    const avgBudgetTarget = parseFloat(raw.avgBudgetTargetKWh) || 0.0;
    const predictedCycleConsumption =
      parseFloat(raw.predictedCycleConsumptionKWh) || 0.0;

    return {
      meterId: raw.meterId || "",
      simulatedDate: raw.simulatedDate || "",
      cycleProgressDays: raw.cycleProgressDays || 0,
      cycleRemainingDays: raw.cycleRemainingDays || 0,
      cycleStartDate: raw.cycleStartDate || "",
      cycleEndDate: raw.cycleEndDate || "",

      // الأرقام الرياضية المحسوبة
      supportLimitKWh: supportLimit,
      budgetLimitKWh: budgetLimit,
      cycleActualConsumptionKWh: actualConsumption,
      accumulatedCostSYP: parseInt(raw.accumulatedCostSYP) || 0,
      predictedBillSYP: parseInt(raw.predictedBillSYP) || 0,
      predictedCycleConsumptionKWh: predictedCycleConsumption,
      targetBudgetSYP: parseInt(raw.targetBudgetSYP) || 0,
      todayActualKWh: todayActual,
      todayPredictedKWh: todayPredicted,
      avgSubTargetKWh: avgSubTarget,
      avgBudgetTargetKWh: avgBudgetTarget,

      // أعلام التنبيه والتجاوز الجاهزة مسبقاً للشاشة (Pre-calculated Flags)
      isSupportExceeded: actualConsumption >= supportLimit,
      isBudgetExceeded: budgetLimit > 0 && actualConsumption >= budgetLimit,
      isCycleExceeded: actualConsumption > predictedCycleConsumption,
      isTodayExceeded: todayActual > todayPredicted,
      isSubTargetExceeded: todayActual > avgSubTarget && avgSubTarget > 0,
      isBudgetTargetExceeded:
        todayActual > avgBudgetTarget && avgBudgetTarget > 0,
    };
  },
};
