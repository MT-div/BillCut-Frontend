/**
 * SettingsMapper (DTO Transformer)
 * يتولى التحويل المتبادل لتفضيلات الإشعارات بين أسماء حقول السيرفر وأسماء الفرونت إند.
 */
export const settingsMapper = {
  toDomain: (raw) => {
    if (!raw) return { budgetPush: true, tierPush: true, anomalyPush: true };

    return {
      budgetPush: Boolean(raw.budgetPushEnabled),
      tierPush: Boolean(raw.tierPushEnabled),
      anomalyPush: Boolean(raw.anomalyPushEnabled),
    };
  },

  toApiPayload: (domain) => {
    return {
      budgetPushEnabled: Boolean(domain.budgetPush),
      tierPushEnabled: Boolean(domain.tierPush),
      anomalyPushEnabled: Boolean(domain.anomalyPush),
    };
  },
};
