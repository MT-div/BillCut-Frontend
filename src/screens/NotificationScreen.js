import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

// استيراد المكونات المشتركة والـ Hooks والـ ثيم
import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import { useNotifications } from "../hooks/useNotifications";
import { theme } from "../theme/theme";

export default function NotificationScreen() {
  const { notifications, isLoading, isRefreshing, error, onRefresh, meterId } =
    useNotifications();

  // تنسيق وعرض الكارت الفردي للإشعار التراكمي
  const renderNotificationItem = ({ item }) => {
    // تحديد لون الحافة اليمنى التفاعلي بناءً على نوع وتصنيف التنبيه (أحمر للأعطال، برتقالي للميزانية، وأزرق للدعم)
    let borderRightColor = theme.colors.primary;
    if (item.type === "ANOMALY") {
      borderRightColor = theme.colors.errorText;
    } else if (item.type === "BUDGET") {
      borderRightColor = theme.colors.secondary;
    }

    // تنسيق التاريخ والوقت العربي
    const formattedDate = new Date(item.timestamp).toLocaleDateString("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <CustomCard style={[styles.notificationCard, { borderRightColor }]}>
        <View style={styles.headerRow}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <Text style={styles.messageText}>{item.message}</Text>
      </CustomCard>
    );
  };

  if (!meterId) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.loadingText}>
          عذراً، لا يوجد عداد نشط مربوط بحسابك لعرض تنبيهاته.
        </Text>
      </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري تحميل أرشيف سجل التنبيهات...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* عرض خطأ الاتصال إن وجد */}
      <AlertBanner type="error" message={error} />

      {/* استخدام FlatList عالية الأداء لتخديم القوائم التراكمية وسحب التحديث */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notificationId.toString()}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyText}>سجل التنبيهات فارغ حالياً.</Text>
            <Text style={styles.emptySubText}>
              ستظهر هنا جميع إشعارات الاستهلاك وحالة الدعم وكشف الأعطال اليومية
              حياً فور حدوثها.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
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
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    lineHeight: 18,
  },
  notificationCard: {
    borderRightWidth: 5, // # حافة يمنى أنيقة جداً تعطي مظهراً عصرياً وممتازاً للـ RTL
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    width: "100%",
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    textAlign: "right",
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.subtext,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 12.5,
    color: theme.colors.subtext,
    textAlign: "right",
    lineHeight: 18,
    marginTop: 2,
  },
});
