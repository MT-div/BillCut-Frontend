/**
 * UserMapper (DTO Transformer)
 * يقوم بتنقية وتسوية بيانات المستخدم القادمة من الباكند
 * وتحويلها لكائن مضمون الحقول (Domain Model) قبل حفظه في الذاكرة.
 */
export const userMapper = {
  toDomain: (rawUser) => {
    if (!rawUser) return null;

    return {
      id: rawUser.id || 0,
      username: rawUser.username || "",
      fullName: rawUser.fullName || "مستخدم BillCut",
      phoneNumber: rawUser.phoneNumber || "",
      role: rawUser.role || "RESIDENT", // RESIDENT أو ADMIN
      defaultMeterId: rawUser.defaultMeterId || null,
      meters: Array.isArray(rawUser.meters)
        ? rawUser.meters.map((m) => ({
            preferenceId: m.preferenceId,
            meterId: m.meterId,
            alias: m.alias || "عداد كهرباء",
            isDefault: Boolean(m.isDefault),
          }))
        : [],
    };
  },
};
