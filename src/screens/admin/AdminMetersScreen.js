import React from "react";
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
} from "react-native";

// استيراد المكونات المشتركة والثيم
import CustomCard from "../../components/CustomCard";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CustomAlert from "../../components/CustomAlert";
import { useAdminMeters } from "../../hooks/admin/useAdminMeters";
import { theme } from "../../theme/theme";
import AlertBanner from "../../components/AlertBanner";

export default function AdminMetersScreen() {
  const {
    meters,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    searchQuery,
    setSearchQuery,
    isSearching,
    fetchMeters,
    loadMore,
    hasMore,
    isCreateVisible,
    setIsCreateVisible,
    newMeterId,
    setNewMeterId,
    isCreating,
    createError,
    handleCreateMeter,
    isEditVisible,
    setIsEditVisible,
    setSelectedMeter,
    editMeterId,
    setEditMeterId,
    isUpdating,
    editError,
    handleUpdateMeter,
    isDeleteVisible,
    setIsDeleteVisible,
    meterToDelete,
    setMeterToDelete,
    isDeleting,
    handleDeleteMeter,
    isUserPickerVisible,
    setIsUserPickerVisible,
    selectedUserForAssign,
    setSelectedUserForAssign,
    userSearchQuery,
    setUserSearchQuery,
    isSearchingUsers,
    handleUserSearchSubmit,
    isLoadingMoreUsers,
    loadMoreUsers,
    userHasMore,
    usersList,
    isMeterPickerVisible,
    setIsMeterPickerVisible,
    selectedMeterForAssign,
    setSelectedMeterForAssign,
    meterSearchQuery,
    setMeterSearchQuery,
    isSearchingPickerMeters,
    handleMeterSearchSubmit,
    isLoadingMorePickerMeters,
    loadMoreMeters,
    pickerMeterHasMore,
    pickerMetersList,
    assignmentAlias,
    setAssignmentAlias,
    isAssigning,
    assignError,
    assignSuccess,
    handleAssignMeter,
  } = useAdminMeters();

  const renderMeterItem = ({ item }) => {
    return (
      <CustomCard style={styles.meterCard}>
        <Text style={styles.meterTitle}>معرّف العداد (UUID)</Text>
        <Text style={styles.meterIdText}>{item.meterId}</Text>
        <Text style={styles.dateText}>
          تاريخ التسجيل:{" "}
          {new Date(item.registerDate).toLocaleDateString("ar-SY")}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              setSelectedMeter(item);
              setEditMeterId(item.meterId);
              setIsEditVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>تعديل المعرّف</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.errorText },
            ]}
            onPress={() => {
              setMeterToDelete(item);
              setIsDeleteVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>حذف العداد</Text>
          </TouchableOpacity>
        </View>
      </CustomCard>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>جاري تحميل العدادات الإضافية...</Text>
      </View>
    );
  };

  // مكوّن الـ Footer المخصص للمشتركين بداخل الـ Picker
  const renderUserPickerFooter = () => {
    if (!isLoadingMoreUsers) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>تحميل المزيد من المستخدمين...</Text>
      </View>
    );
  };

  // مكوّن الـ Footer المخصص للعدادات بداخل الـ Picker
  const renderMeterPickerFooter = () => {
    if (!isLoadingMorePickerMeters) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>تحميل المزيد من الأجهزة...</Text>
      </View>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل لوحة إدارة الأجهزة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlertBanner type="error" message={error} />

      {/* أزرار تبويب النظام المدمجة (Segmented Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "meters" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("meters")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "meters" && styles.activeTabText,
            ]}
          >
            إدارة الأجهزة والعتاد
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "association" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("association")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "association" && styles.activeTabText,
            ]}
          >
            إسناد وحوكمة العدادات
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================== أولاً: محتوى التبويب الأول (Meters CRUD) ==================== */}
      {activeTab === "meters" ? (
        <View style={{ flex: 1 }}>
          <View style={styles.headerBox}>
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <CustomInput
                  placeholder="ابحث بمعرّف العداد..."
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
                onPress={() => fetchMeters(true, searchQuery)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>بحث</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={{ height: theme.spacing.sm }} />
            <CustomButton
              title="➕ تسجيل عداد فيزيائي جديد"
              onPress={() => setIsCreateVisible(true)}
              color={theme.colors.secondary}
            />
          </View>

          <FlatList
            data={meters}
            keyExtractor={(item, index) =>
              item.meterId?.toString() || index.toString()
            }
            renderItem={renderMeterItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyCenter}>
                <Text style={styles.emptyText}>
                  لا توجد عدادات مسجلة حالياً.
                </Text>
                <Text style={styles.emptySubText}>
                  سجّل معرّف العداد الجديد بالأعلى لتعريفه في السيرفر.
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        // ==================== ثانياً: محتوى التبويب الثاني (Meters Association & Searchable Pickers) ====================
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomCard>
            <Text style={styles.cardTitle}>
              إسناد وربط العدادات بحسابات المستهلكين
            </Text>
            <Text style={styles.subLabel}>
              حوكمة العلاقات وإسناد الأجهزة؛ حدد المشترك والعداد واكتب التسمية
              المستعارة للحفظ:
            </Text>

            <CustomAlert type="error" message={assignError} />
            <CustomAlert type="success" message={assignSuccess} />

            {/* حقل اختيار المشترك القابل للبحث المتقدم عبر الـ Modal */}
            <Text style={styles.pickerLabel}>المشترك المستهدف</Text>
            <TouchableOpacity
              style={styles.pickerSelectorBtn}
              onPress={() => setIsUserPickerVisible(true)}
            >
              <Text style={styles.pickerSelectorText}>
                {selectedUserForAssign
                  ? `👤 ${selectedUserForAssign.fullName} (رقم الهاتف: ${selectedUserForAssign.phoneNumber})`
                  : "اختر المشترك من هنا..."}
              </Text>
            </TouchableOpacity>

            {/* حقل اختيار العداد القابل للبحث المتقدم عبر الـ Modal */}
            <Text style={styles.pickerLabel}>العداد المستهدف للربط</Text>
            <TouchableOpacity
              style={styles.pickerSelectorBtn}
              onPress={() => setIsMeterPickerVisible(true)}
            >
              <Text style={styles.pickerSelectorText}>
                {selectedMeterForAssign
                  ? `⚡ العداد: ${selectedMeterForAssign.meterId.substring(
                      0,
                      18
                    )}...`
                  : "اختر العداد من هنا..."}
              </Text>
            </TouchableOpacity>

            <CustomInput
              label="الاسم المستعار للعداد عند هذا المشترك (مثال: عداد البيت)"
              placeholder="اكتب الاسم المستعار للربط"
              value={assignmentAlias}
              onChangeText={setAssignmentAlias}
            />

            <CustomButton
              title={
                isAssigning
                  ? "جاري إرسال طلب الإسناد..."
                  : "حفظ وإسناد العداد للمشترك"
              }
              onPress={handleAssignMeter}
              color={theme.colors.primary}
              disabled={isAssigning}
            />
          </CustomCard>
        </ScrollView>
      )}

      {/* ==================== أ. نافذة إضافة عداد جديد (Create Modal) ==================== */}
      <Modal
        visible={isCreateVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تسجيل عداد فيزيائي جديد</Text>
            <CustomAlert type="error" message={createError} />
            <CustomInput
              label="المعّرف الفيزيائي الفريد للعداد (UUID)"
              placeholder="مثال: 11111111-1111-1111-1111-111111111111"
              value={newMeterId}
              onChangeText={setNewMeterId}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.secondary },
                ]}
                onPress={handleCreateMeter}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>تسجيل العداد</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setIsCreateVisible(false)}
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

      {/* ==================== ب. نافذة تعديل العداد (Edit Modal) ==================== */}
      <Modal
        visible={isEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل معرّف العداد الفيزيائي</Text>
            <CustomAlert type="error" message={editError} />
            <CustomInput
              label="المعرّف الفيزيائي الجديد (UUID)"
              value={editMeterId}
              onChangeText={setEditMeterId}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleUpdateMeter}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>حفظ التعديل</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setIsEditVisible(false)}
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

      {/* ==================== ج. تأكيد الحذف النهائي للعداد (Delete Confirmation) ==================== */}
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
              تأكيد الحذف النهائي للعداد
            </Text>
            <Text style={styles.warningText}>
              تنبيه حرج جداً: سيؤدي حذف العداد (
              {meterToDelete?.meterId.substring(0, 18)}...) لمسح وحذف كافة سجلات
              وقراءات وتنبؤات وميزانية العداد تماماً وبشكل مستديم من السيرفر، هل
              تؤكد الحذف؟
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.errorText },
                ]}
                onPress={handleDeleteMeter}
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

      {/* ==================== د. الـ Searchable Picker المنبثق لاختيار المشترك المرقّم سحابياً ==================== */}
      <Modal
        visible={isUserPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUserPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>ابحث واختر المشترك المستهدف</Text>

            {/* مربع البحث والزر الموجه المخصص لتوفير اتصال السيرفر */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <CustomInput
                  placeholder="اكتب اسم المشترك أو هاتفه..."
                  value={userSearchQuery}
                  onChangeText={setUserSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.searchBtn,
                  {
                    backgroundColor: isSearchingUsers
                      ? theme.colors.subtext
                      : theme.colors.primary,
                  },
                ]}
                onPress={handleUserSearchSubmit}
                disabled={isSearchingUsers}
              >
                {isSearchingUsers ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>بحث</Text>
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={usersList}
              keyExtractor={(item, index) => `user-picker-${item.id}-${index}`}
              style={{ maxHeight: 220, marginVertical: theme.spacing.sm }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItemRow}
                  onPress={() => {
                    setSelectedUserForAssign(item);
                    setIsUserPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    👤 {item.fullName} (الهاتف: {item.phoneNumber})
                  </Text>
                </TouchableOpacity>
              )}
              // # تفعيل التصفح والتحميل اللانهائي (Infinite Scroll) لـ الـ Picker المخصص
              onEndReached={loadMoreUsers}
              onEndReachedThreshold={0.2}
              ListFooterComponent={renderUserPickerFooter}
              ListEmptyComponent={
                <Text style={styles.pickerEmptyText}>
                  لا يوجد مشتركين مطابقين للبحث.
                </Text>
              }
            />
            <CustomButton
              title="إغلاق"
              onPress={() => setIsUserPickerVisible(false)}
              color={theme.colors.border}
            />
          </View>
        </View>
      </Modal>

      {/* ==================== هـ. الـ Searchable Picker المنبثق لاختيار العداد المرقّم سحابياً ==================== */}
      <Modal
        visible={isMeterPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMeterPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.modalTitle}>ابحث واختر العداد المستهدف</Text>

            {/* مربع البحث والزر الموجه المخصص لتوفير اتصال السيرفر */}
            <View style={styles.searchRow}>
              <View style={styles.searchInputContainer}>
                <CustomInput
                  placeholder="اكتب معرّف العداد للبحث..."
                  value={meterSearchQuery}
                  onChangeText={setMeterSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.searchBtn,
                  {
                    backgroundColor: isSearchingPickerMeters
                      ? theme.colors.subtext
                      : theme.colors.primary,
                  },
                ]}
                onPress={handleMeterSearchSubmit}
                disabled={isSearchingPickerMeters}
              >
                {isSearchingPickerMeters ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>بحث</Text>
                )}
              </TouchableOpacity>
            </View>

            <FlatList
              data={pickerMetersList}
              keyExtractor={(item, index) =>
                `meter-picker-${item.meterId}-${index}`
              }
              style={{ maxHeight: 220, marginVertical: theme.spacing.sm }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItemRow}
                  onPress={() => {
                    setSelectedMeterForAssign(item);
                    setIsMeterPickerVisible(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>
                    ⚡ العداد: {item.meterId.substring(0, 24)}...
                  </Text>
                </TouchableOpacity>
              )}
              //  # تفعيل التصفح والتحميل اللانهائي (Infinite Scroll) لـ الـ Picker المخصص
              onEndReached={loadMoreMeters}
              onEndReachedThreshold={0.2}
              ListFooterComponent={renderMeterPickerFooter}
              ListEmptyComponent={
                <Text style={styles.pickerEmptyText}>
                  لا توجد عدادات مطابقة للبحث.
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.subtext,
  },
  activeTabText: {
    color: theme.colors.primary,
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
  },
  emptySubText: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    lineHeight: 18,
  },
  meterCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  meterTitle: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  meterIdText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: 6,
  },
  dateText: {
    fontSize: 10.5,
    color: theme.colors.subtext,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F0F4F8",
  },
  actionBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: 6,
    width: "48%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    alignSelf: "flex-start",
  },
  subLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    lineHeight: 16,
    marginBottom: theme.spacing.md,
    textAlign: "right",
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
    marginBottom: theme.spacing.md,
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
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 12.5,
    color: theme.colors.errorText,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
    fontWeight: "600",
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
  pickerLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
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
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  pickerModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 450,
  },
  pickerItemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
    width: "100%",
  },
  pickerItemText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "bold",
  },
  pickerEmptyText: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    marginVertical: theme.spacing.md,
    fontWeight: "600",
  },
});
