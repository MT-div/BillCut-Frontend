import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import CustomCard from "../components/CustomCard";
import AlertBanner from "../components/AlertBanner";
import { useNotifications } from "../hooks/useNotifications";
import { theme } from "../theme/theme";

export default function NotificationScreen() {
  const {
    notifications,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    loadMore,
    userId,
  } = useNotifications();

  // استخدام useCallback لثبات خوارزمية ريندر العناصر أثناء السكرول
  const renderNotificationItem = useCallback(({ item }) => {
    return (
      <CustomCard
        style={[
          styles.notificationCard,
          {
            borderRightColor: item.borderColor,
            backgroundColor: item.cardBg,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            {item.isUnread && <View style={styles.unreadDot} />}
            <Text
              style={[styles.notificationTitle, { color: item.titleColor }]}
            >
              {item.title}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.formattedDate}</Text>
        </View>

        <View style={styles.aliasBadge}>
          <Text style={styles.aliasBadgeText}>📌 {item.meterAlias}</Text>
        </View>

        <Text style={[styles.messageText, { color: item.messageColor }]}>
          {item.message}
        </Text>
      </CustomCard>
    );
  }, []);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>جاري تحميل التنبيهات السابقة...</Text>
      </View>
    );
  };

  if (!userId) {
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
          جاري تحميل أرشيف سجل التنبيهات الموحد...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlertBanner type="error" message={error} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        // خصائص أداء تحسين التمرير السريع (60fps Performance Props)
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
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
    borderRightWidth: 5,
    borderLeftWidth: 0,
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginLeft: 6,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.subtext,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.subtext,
    marginTop: 4,
    fontWeight: "600",
  },
  aliasBadge: {
    backgroundColor: "#EBF5FB",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#AED6F1",
    marginBottom: theme.spacing.sm,
  },
  aliasBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
