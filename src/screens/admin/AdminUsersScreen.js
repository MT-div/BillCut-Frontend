import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import AlertBanner from "../../components/AlertBanner";
``;
import { useAdminUsers } from "../../hooks/admin/useAdminUsers";
import { theme } from "../../theme/theme";

export default function AdminUsersScreen() {
  const {
    filteredUsers,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    searchQuery,
    setSearchQuery,
    isCreateVisible,
    setIsCreateVisible,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    createdTempPassword,
    setCreatedTempPassword,
    isCreating,
    createError,
    handleCreateUser,
    isEditVisible,
    setIsEditVisible,
    setSelectedUser,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    isUpdating,
    editError,
    handleUpdateUser,
    isDeleteVisible,
    setIsDeleteVisible,
    userToDelete,

    setUserToDelete,
    isDeleting,
    handleDeleteUser,
  } = useAdminUsers();

  const renderUserItem = ({ item }) => {
    return (
      <CustomCard style={styles.userCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userRoleTag}>مشترك منزلي</Text>
        </View>
        <Text style={styles.userDetailText}>
          رقم الهاتف: {item.phoneNumber}
        </Text>
        <Text style={styles.userDetailText}>اسم الحساب: {item.username}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              setSelectedUser(item);
              setEditFullName(item.fullName);
              setEditPhone(item.phoneNumber);
              setIsEditVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>تعديل البيانات</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.errorText },
            ]}
            onPress={() => {
              setUserToDelete(item);
              setIsDeleteVisible(true);
            }}
          >
            <Text style={styles.actionBtnText}>حذف الحساب</Text>
          </TouchableOpacity>
        </View>
      </CustomCard>
    );
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          جاري استيراد الحسابات وتفاصيل المشتركين...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlertBanner type="error" message={error} />

      {/* 1. مربع البحث السريع في الأعلى المجهز بالـ RTL العربي الأصلي */}
      <View style={styles.headerBox}>
        <CustomInput
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <CustomButton
          title="➕ إنشاء حساب مشترك جديد"
          onPress={() => {
            setCreatedTempPassword("");
            setIsCreateVisible(true);
          }}
          color={theme.colors.secondary}
        />
      </View>

      {/* 2. قائمة المشتركين التفاعلية عالية الأداء */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderUserItem}
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
            <Text style={styles.emptyText}>لا يوجد مشتركين مسجلين حالياً.</Text>
            <Text style={styles.emptySubText}>
              أدخل بيانات مستخدم جديد بالأعلى لتأسيس حسابه على الفور.
            </Text>
          </View>
        }
      />

      {/* ==================== أ. نافذة إنشاء حساب مستخدم جديد (Create Modal) ==================== */}
      <Modal
        visible={isCreateVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء حساب مشترك جديد</Text>

            {createdTempPassword ? (
              <View style={styles.successPwdBox}>
                <Text style={styles.pwdTitle}>تم إنشاء الحساب بنجاح!</Text>
                <Text style={styles.pwdLabel}>
                  يرجى نسخ بيانات الدخول المؤقتة ومشاركتها مع المستهلك:
                </Text>
                <Text style={styles.pwdValue}>
                  اسم الحساب: user_{(newPhone || "").slice(-10)}
                </Text>
                <Text style={styles.pwdValue}>
                  كلمة المرور: {createdTempPassword}
                </Text>
                <View style={{ height: theme.spacing.sm }} />
                <CustomButton
                  title="إغلاق وتمام الحفظ"
                  onPress={() => setIsCreateVisible(false)}
                  color={theme.colors.primary}
                />
              </View>
            ) : (
              <View style={{ width: "100%" }}>
                <CustomAlert type="error" message={createError} />
                <CustomInput
                  label="الاسم الكامل للمشترك"
                  placeholder="مثال: أحمد السوري"
                  value={newFullName}
                  onChangeText={setNewFullName}
                />
                <CustomInput
                  label="رقم الهاتف الخلوي"
                  placeholder="مثال: 0987654322"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: theme.colors.secondary },
                    ]}
                    onPress={handleCreateUser}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalBtnText}>إنشاء الحساب</Text>
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
      </Modal>

      {/* ==================== ب. نافذة تعديل بيانات المستخدم (Edit Modal) ==================== */}
      <Modal
        visible={isEditVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تعديل بيانات الحساب المشترك</Text>
            <CustomAlert type="error" message={editError} />
            <CustomInput
              label="الاسم الكامل المعدّل"
              value={editFullName}
              onChangeText={setEditFullName}
            />
            <CustomInput
              label="رقم الهاتف المعدّل"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleUpdateUser}
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

      {/* ==================== ج. نافذة تأكيد الحذف النهائي (Delete Confirmation Modal) ==================== */}
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
              تأكيد الحذف النهائي للحساب
            </Text>
            <Text style={styles.warningText}>
              تنبيه: سيؤدي حذف حساب المستخدم ({userToDelete?.fullName}) إلى
              إلغاء إسناد عداداته وفصلها نهائياً عن النظام، هل أنت متأكد من
              الحذف؟
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  { backgroundColor: theme.colors.errorText },
                ]}
                onPress={handleDeleteUser}
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
  userCard: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  userRoleTag: {
    fontSize: 10,
    color: theme.colors.primary,
    backgroundColor: "#EBF5FB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#AED6F1",
    fontWeight: "bold",
  },
  userDetailText: {
    fontSize: 12.5,
    color: theme.colors.subtext,
    marginVertical: 1.5,
    fontWeight: "500",
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
  successPwdBox: {
    width: "100%",
    alignItems: "center",
  },
  pwdTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.successText,
    marginBottom: 8,
  },
  pwdLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: theme.spacing.md,
  },
  pwdValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    marginVertical: 2,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 6,
    width: "100%",
    textAlign: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
