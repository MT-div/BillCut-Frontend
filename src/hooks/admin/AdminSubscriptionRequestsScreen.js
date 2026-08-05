import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import CustomCard from "../../components/CustomCard";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";
import AlertBanner from "../../components/AlertBanner";

import { useAdminSubscriptionRequests } from "../../hooks/admin/useAdminSubscriptionRequests";
import { theme } from "../../theme/theme";

export default function AdminSubscriptionRequestsScreen() {
  const {
    requestsList,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    searchQuery,
    setSearchQuery,
    statusFilter,
    handleFilterChange,
    isSearching,
    handleSearchSubmit,
    loadMore,
    isProvisionVisible,
    setIsProvisionVisible,
    selectedRequest,
    setSelectedRequest,
    aliasInput,
    setAliasInput,
    isProvisioning,
    provisionError,
    provisionResult,
    setProvisionResult,
    handleProvisionSubmit,
    isMeterPickerVisible,
    setIsMeterPickerVisible,
    selectedMeterForProvision,
    setSelectedMeterForProvision,
    meterSearchQuery,
    setMeterSearchQuery,
    isSearchingPickerMeters,
    fetchMetersForPicker,
    pickerMetersList,
    handleUpdateStatus,
    isDeleteVisible,
    setIsDeleteVisible,
    requestToDelete,
    setRequestToDelete,
    isDeleting,
    handleDeleteRequest,
  } = useAdminSubscriptionRequests();

  const renderRequestItem = useCallback(({ item }) => {
    const isPending = item.status === "PENDING";

    return (
      <CustomCard style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: item.statusBg }]}
          >
            <Text style={[styles.statusText, { color: item.statusColor }]}>
              {item.statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.detailText}>📞 رقم الهاتف: {item.phoneNumber}</Text>
        <Text style={styles.detailText}>📍 المحافظة: {item.governorate}</Text>
        <Text style={styles.detailText}>
          🏠 العنوان: {item.detailedAddress}
        </Text>
        <Text style={styles.dateText}>
          📅 تاريخ التقديم: {item.formattedDate}
        </Text>

        <View style={styles.actionsRow}>
          {isPending && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.colors.successText },
              ]}
              onPress={() => {
                setSelectedRequest(item);
                setSelectedMeterForProvision(null);
                setProvisionResult(null);
                setAliasInput("عداد المنزل");
                fetchMetersForPicker("");
                setIsProvisionVisible(true);
              }}
            >
              <Text style={styles.actionBtnText}>⚡ تركيب وحساب</Text>
            </TouchableOpacity>
          )}

          {isPending && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => handleUpdateStatus(item.requestId, "COMPLETED")}
            >
              <Text style={styles.actionBtnText}>تعيين كمكتمل</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.colors.errorText,
                width: isPending ? "30%" : "100%",
              },
            ]}
            onPress={() => {
              setRequestToDelete(item);
              setIsDeleteVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>حذف الطلب</Text>
          </TouchableOpacity>
        </View>
      </CustomCard>
    );
  }, []);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>جاري تحميل المزيد من الطلبات...</Text>
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل طلبات الاشتراك...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlertBanner type="error" message={error} />

      {/* 1. مربع البحث وأزرار الفلترة الأفقية */}
      <View style={styles.headerBox}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <CustomInput
              placeholder="ابحث بالاسم، الهاتف، أو المحافظة..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.searchBtn,
              {
                backgroundColor: isSearching
                  ? theme.colors.subtext
                  : theme.colors.primary,
              },
            ]}
            onPress={handleSearchSubmit}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>بحث</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* أزرار الفلترة الأفقية Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
        >
          {[
            { label: "الكل", value: "" },
            { label: "قيد الانتظار 🟡", value: "PENDING" },
            { label: "مكتمل 🟢", value: "COMPLETED" },
            { label: "ملغى 🔴", value: "CANCELLED" },
          ].map((chip) => {
            const isSelected = statusFilter === chip.value;
            return (
              <TouchableOpacity
                key={chip.label}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : "#E2E8F0",
                  },
                ]}
                onPress={() => handleFilterChange(chip.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? "#FFFFFF" : theme.colors.text },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. قائمة الطلبات */}
      <FlatList
        data={requestsList}
        keyExtractor={(item) => String(item.requestId)}
        renderItem={renderRequestItem}
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
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyText}>لا توجد طلبات اشتراك مطابقة.</Text>
          </View>
        }
      />

      {/* ==================== أ. نافذة أتمتة التركيب والربط المزدوج (Provision Modal) ==================== */}
      <Modal
        visible={isProvisionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProvisionVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>تركيب عداد وإنشاء/ربط حساب</Text>
              <Text style={styles.modalSub}>
                المستفيد: {selectedRequest?.fullName} (
                {selectedRequest?.phoneNumber})
              </Text>

              {provisionResult ? (
                <View style={styles.successResultBox}>
                  <Text style={styles.successResultTitle}>
                    تمت العملية بنجاح! 🎉
                  </Text>
                  <Text style={styles.successResultMsg}>
                    {provisionResult.message}
                  </Text>

                  {provisionResult.data?.isNewUser ? (
                    <View style={styles.passwordDetailsBox}>
                      <Text style={styles.pwdDetailText}>
                        اسم المستخدم: {provisionResult.data.username}
                      </Text>
                      <Text style={styles.pwdDetailText}>
                        كلمة المرور المؤقتة:{" "}
                        {provisionResult.data.temporaryPassword}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.existingUserText}>
                      المواطن مسجل مسبقاً. تم ربط العداد الجديد بنجاح بدليل
                      حسابه الحالي.
                    </Text>
                  )}

                  <CustomButton
                    title="إغلاق وتمام"
                    onPress={() => {
                      setIsProvisionVisible(false);
                      setProvisionResult(null);
                    }}
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <View style={{ width: "100%" }}>
                  <CustomAlert type="error" message={provisionError} />

                  <Text style={styles.pickerLabel}>
                    اختر العداد المراد تركيبه:
                  </Text>
                  <TouchableOpacity
                    style={styles.pickerSelectorBtn}
                    onPress={() => setIsMeterPickerVisible(true)}
                  >
                    <Text style={styles.pickerSelectorText}>
                      {selectedMeterForProvision
                        ? `⚡ العداد: ${selectedMeterForProvision.meterId.substring(
                            0,
                            18
                          )}...`
                        : "اضغط لاختيار العداد الفيزيائي من القائمة..."}
                    </Text>
                  </TouchableOpacity>

                  <CustomInput
                    label="الاسم المستعار للعداد"
                    value={aliasInput}
                    onChangeText={setAliasInput}
                  />

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: theme.colors.successText },
                      ]}
                      onPress={handleProvisionSubmit}
                      disabled={isProvisioning}
                    >
                      {isProvisioning ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalBtnText}>
                          حفظ وتمام التركيب
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalBtn,
                        { backgroundColor: theme.colors.border },
                      ]}
                      onPress={() => setIsProvisionVisible(false)}
                    >
                      <Text
                        style={[
                          styles.modalBtnText,
                          { color: theme.colors.text },
                        ]}
                      >
                        إلغاء
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ==================== ب. Picker اختيار العداد منبثق ==================== */}
      <Modal
        visible={isMeterPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMeterPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>ابحث واختر العداد المكتشف</Text>
            <CustomInput
              placeholder="ابحث بمعرف العداد..."
              value={meterSearchQuery}
              onChangeText={(text) => {
                setMeterSearchQuery(text);
                fetchMetersForPicker(text);
              }}
            />
            <FlatList
              data={pickerMetersList}
              keyExtractor={(item) => `meter-picker-${item.meterId}`}
              style={{ maxHeight: 220, marginVertical: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItemRow}
                  onPress={() => {
                    setSelectedMeterForProvision(item);
                    setIsMeterPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>⚡ {item.meterId}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.pickerEmptyText}>
                  لا توجد عدادات مطابقة.
                </Text>
              }
            />
            <CustomButton
              title="إغلاق"
              onPress={() => setIsMeterPickerVisible(false)}
              color={theme.colors.border}
            />
          </View>
        </View>
      </Modal>

      {/* ==================== ج. تأكيد الحذف ==================== */}
      <Modal
        visible={isDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { borderColor: theme.colors.errorText },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.colors.errorText }]}
            >
              تأكيد حذف طلب الاشتراك
            </Text>
            <Text style={styles.warningText}>
              سيؤدي هذا لمسح طلب الاشتراك الخاص بالمواطن (
              {requestToDelete?.fullName}) نهائياً، هل تؤكد الحذف؟
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.errorText },
                ]}
                onPress={handleDeleteRequest}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>حذف نهائي</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setIsDeleteVisible(false)}
              >
                <Text
                  style={[styles.modalBtnText, { color: theme.colors.text }]}
                >
                  إلغاء
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBox: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  searchInputContainer: {
    width: "78%",
    marginBottom: -12,
  },
  searchBtn: {
    width: "20%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: "bold",
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
  },
  emptyCenter: {
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.subtext,
  },
  requestCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "bold",
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.text,
    marginVertical: 1.5,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 10,
    color: theme.colors.subtext,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#F0F4F8",
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    width: "31%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "bold",
  },
  footerLoader: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.subtext,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 2,
  },
  modalSub: {
    fontSize: 11,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.md,
    fontWeight: "600",
  },
  pickerLabel: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  pickerSelectorBtn: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  pickerSelectorText: {
    fontSize: 12.5,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.sm,
  },
  modalBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.errorText,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  successResultBox: {
    alignItems: "center",
    width: "100%",
  },
  successResultTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.successText,
    marginBottom: 6,
  },
  successResultMsg: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  passwordDetailsBox: {
    backgroundColor: "#FAFAFA",
    padding: theme.spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: "100%",
    marginBottom: theme.spacing.md,
  },
  pwdDetailText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.text,
    marginVertical: 2,
    textAlign: "center",
  },
  existingUserText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  pickerModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 400,
  },
  pickerItemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  pickerItemText: {
    fontSize: 12.5,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  pickerEmptyText: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    marginVertical: theme.spacing.md,
  },
});
