import { theme } from "../../theme/theme";

/**
 * SubscriptionMapper (DTO Transformer for Subscription Requests)
 */
export const subscriptionMapper = {
  toDomainList: (rawList) => {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item) => subscriptionMapper.toDomain(item));
  },

  toDomain: (item) => {
    if (!item) return null;

    let statusLabel = "قيد الانتظار";
    let statusColor = "#D4AC0D"; // أصفر
    let statusBg = "#FCF3CF";

    if (item.status === "COMPLETED") {
      statusLabel = "مكتمل";
      statusColor = theme.colors.successText; // أخضر
      statusBg = "#E8F8F5";
    } else if (item.status === "CANCELLED") {
      statusLabel = "ملغى";
      statusColor = theme.colors.errorText; // أحمر
      statusBg = "#FDEDEC";
    }

    let formattedDate = "";
    try {
      if (item.createdAt) {
        formattedDate = new Date(item.createdAt).toLocaleDateString("ar-SY", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      formattedDate = item.createdAt || "";
    }

    return {
      requestId: item.requestId || 0,
      fullName: item.fullName || "مواطن",
      phoneNumber: item.phoneNumber || "",
      governorate: item.governorate || "دمشق",
      detailedAddress: item.detailedAddress || "",
      status: item.status || "PENDING",
      statusLabel,
      statusColor,
      statusBg,
      formattedDate,
    };
  },
};
