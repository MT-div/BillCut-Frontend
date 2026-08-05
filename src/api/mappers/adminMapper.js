/**
 * AdminMapper (Master DTO Transformer for Admin Operations)
 */

function roundToTwo(num) {
  if (isNaN(num) || num === null || num === undefined) return 0.0;
  return +(Math.round(num + "e+2") + "e-2");
}

export const adminMapper = {
  // 1. تنقية كائن الإحصائيات
  // 1. تنقية كائن الإحصائيات وإعداد مخطط الاستهلاك الموحد لكافة المشتركين
  toStatsViewModel: (raw) => {
    if (!raw)
      return {
        usersCount: 0,
        metersCount: 0,
        systemMonthlyChart: { labels: [], values: [] },
      };

    const rawMonthly = Array.isArray(raw.systemMonthlyHistory)
      ? raw.systemMonthlyHistory
      : [];
    const monthlyLabels = rawMonthly.map((item) => {
      const parts = (item.monthName || "").split(" ");
      return parts[0] ? parts[0].substring(0, 3) : "";
    });
    const monthlyValues = rawMonthly.map(
      (item) => parseFloat(item.consumptionKWh) || 0
    );

    return {
      usersCount: parseInt(raw.usersCount) || 0,
      metersCount: parseInt(raw.metersCount) || 0,
      systemMonthlyChart: {
        labels: monthlyLabels.length > 0 ? monthlyLabels : ["لا توجد بيانات"],
        values: monthlyValues.length > 0 ? monthlyValues : [0],
      },
    };
  },
  // 2. تنقية وتجهيز كائن العتبة التكيّفية ورسم المقارنة البصرية (مُصلح)
  toThresholdViewModel: (raw) => {
    if (!raw || !raw.activeThreshold) {
      return {
        targetRegionName: "المنطقة المحلية / سوريا",
        baseMeanKWh: 10.25,
        baseThresholdKWh: 7.0,
        targetRegionMeanKWh: 23.16,
        calculatedThresholdKWh: 15.8,
        systemCalculatedMeanKWh: 23.16,
        proposedSystemThresholdKWh: 15.8,
        chartImageUri: null,
      };
    }

    const t = raw.activeThreshold;
    const baseMean = parseFloat(t.baseMeanKWh) || 10.25;
    const baseThreshold = parseFloat(t.baseThresholdKWh) || 7.0;
    const activeThreshold = parseFloat(t.calculatedThresholdKWh) || 15.8;
    const systemMean = parseFloat(raw.systemCalculatedMeanKWh) || 23.16;

    // استخدام الحساب النظيف والمضمون
    const proposedThreshold = roundToTwo(
      baseThreshold * (systemMean / baseMean)
    );

    return {
      thresholdId: t.thresholdId,
      targetRegionName: t.targetRegionName || "المنطقة المحلية / سوريا",
      baseMeanKWh: baseMean,
      baseThresholdKWh: baseThreshold,
      targetRegionMeanKWh: parseFloat(t.targetRegionMeanKWh) || systemMean,
      calculatedThresholdKWh: activeThreshold,
      systemCalculatedMeanKWh: systemMean,
      proposedSystemThresholdKWh: proposedThreshold,
      chartImageUri: raw.chartBase64
        ? `data:image/png;base64,${raw.chartBase64}`
        : null,
    };
  },

  // 3. تنقية مصفوفة حسابات المشتركين
  toUserListViewModel: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((u) => ({
      id: u.id || 0,
      username: u.username || "",
      fullName: u.fullName || "مستخدم",
      phoneNumber: u.phoneNumber || "",
      role: u.role || "RESIDENT", // RESIDENT, ADMIN, SUPER_ADMIN
      createdAt: u.createdAt ? u.createdAt.substring(0, 10) : "",
    }));
  },

  // 4. تنقية مصفوفة العدادات الفيزيائية
  toMeterListViewModel: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((m) => ({
      meterId: m.meterId || "",
      registerDate: m.registerDate ? m.registerDate.substring(0, 10) : "",
      associatedUsers: Array.isArray(m.associatedUsers)
        ? m.associatedUsers
        : [],
    }));
  },

  // 5. تنقية مصفوفة إصدارات التعرفة
  toTariffListViewModel: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((t) => ({
      versionId: t.versionId || 0,
      effectiveDate: t.effectiveDate || "",
      tiers: Array.isArray(t.tiers)
        ? t.tiers.map((tier) => ({
            tierId: tier.tierId,
            tierNumber: tier.tierNumber,
            startKWh: parseFloat(tier.startKWh) || 0,
            endKWh:
              tier.endKWh !== null && tier.endKWh !== undefined
                ? parseFloat(tier.endKWh)
                : null,
            pricePerKWh: parseFloat(tier.pricePerKWh) || 0,
          }))
        : [],
    }));
  },
};
