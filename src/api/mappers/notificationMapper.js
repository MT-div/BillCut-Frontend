import { theme } from "../../theme/theme";

/**
 * NotificationMapper (DTO Transformer / List Item ViewModel Builder)
 * يحول عناصر الإشعارات الخام إلى نصوص وتواريخ وألوان منسقة مسبقاً
 * لتسريع أداء السكرول ومنع أي تقطيع أثناء التمرير على الجوال.
 */
export const notificationMapper = {
  toViewModelList: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item) => notificationMapper.toViewModel(item));
  },

  toViewModel: (item) => {
    if (!item) return null;

    // 1. تحديد لون شريط البطاقة بناءً على نوع الإشعار
    let borderColor = theme.colors.primary;
    if (item.type === "ANOMALY") {
      borderColor = theme.colors.errorText;
    } else if (item.type === "BUDGET") {
      borderColor = theme.colors.secondary;
    }

    // 2. تنسيق التاريخ العربي مسبقاً لمنع إعادة الإنشاء أثناء السكرول
    let formattedDate = "";
    try {
      if (item.timestamp) {
        formattedDate = new Date(item.timestamp).toLocaleDateString("ar-SY", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      formattedDate = item.timestamp || "";
    }

    const isUnread = !item.isRead;

    return {
      id: item.notificationId
        ? String(item.notificationId)
        : String(Math.random()),
      title: item.title || "تنبيه من النظام",
      message: item.message || "",
      type: item.type || "TIER",
      isUnread: isUnread,
      formattedDate: formattedDate,
      meterAlias: item.meterAlias || "عداد غير معروف",

      // أنماط وألوان مجهزة للشاشة فوراً
      borderColor: borderColor,
      cardBg: isUnread ? theme.colors.surface : "#F4F6F7",
      titleColor: isUnread ? theme.colors.text : theme.colors.subtext,
      messageColor: isUnread ? theme.colors.subtext : "#95A5A6",
    };
  },
};
