/**
 * AdminMapper (Master DTO Transformer for Admin Operations)
 * يتولى تنقية وتسوية بيانات الإحصائيات، المستخدمين، العدادات، والتعرفات
 * القادمة من APIs الإدارة قبل وصولها للواجهات.
 */
export const adminMapper = {
  // 1. تنقية كائن الإحصائيات
  toStatsViewModel: (raw) => {
    if (!raw) return { usersCount: 0, metersCount: 0 };
    return {
      usersCount: parseInt(raw.usersCount) || 0,
      metersCount: parseInt(raw.metersCount) || 0,
    };
  },

  // 2. تنقية مصفوفة حسابات المشتركين
  toUserListViewModel: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((u) => ({
      id: u.id || 0,
      username: u.username || "",
      fullName: u.fullName || "مشترك",
      phoneNumber: u.phoneNumber || "",
      role: u.role || "RESIDENT",
      createdAt: u.createdAt ? u.createdAt.substring(0, 10) : "",
    }));
  },

  // 3. تنقية مصفوفة العدادات الفيزيائية
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

  // 4. تنقية مصفوفة إصدارات التعرفة
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
