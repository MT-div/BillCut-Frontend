import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // حالة فلترة البحث عن المشتركين
  const [searchQuery, setSearchQuery] = useState("");

  // أ. حالات نافذة الإنشاء الجديد (Create Modal)
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [createdTempPassword, setCreatedTempPassword] = useState(""); // لعرض الباسورد للأدمن
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ب. حالات نافذة التعديل (Edit Modal)
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // ج. حالات نافذة تأكيد الحذف (Delete Confirmation)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة جلب قائمة المستخدمين من السيرفر
  const fetchUsers = useCallback(async () => {
    setError("");
    try {
      const response = await apiClient.get("/api/admin/users/create/");
      if (response.data.status === "success") {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError("تعذر جلب قائمة المستخدمين النشطين من السيرفر.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 1. خدمة إنشاء حساب مستخدم جديد
  const handleCreateUser = async () => {
    setCreateError("");
    if (!newFullName.trim() || !newPhone.trim()) {
      setCreateError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.post("/api/admin/users/create/", {
        fullName: newFullName.trim(),
        phoneNumber: newPhone.trim(),
      });

      if (response.data.status === "success") {
        // عرض الباسورد المؤقت للمدير لنسخه ومشاركته مع العميل
        setCreatedTempPassword(response.data.data.temporaryPassword);
        setNewFullName("");
        setNewPhone("");
        fetchUsers(); // تحديث القائمة الحية فورا
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "فشلت عملية إنشاء الحساب.");
    } finally {
      setIsCreating(false);
    }
  };

  // 2. خدمة تعديل بيانات مستخدم قائم
  const handleUpdateUser = async () => {
    setEditError("");
    if (!editFullName.trim() || !editPhone.trim() || !selectedUser) {
      setEditError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await apiClient.put(
        `/api/admin/users/${selectedUser.id}/`,
        {
          fullName: editFullName.trim(),
          phoneNumber: editPhone.trim(),
        }
      );

      if (response.data.status === "success") {
        setIsEditVisible(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "تعذر تحديث بيانات الحساب.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. خدمة حذف حساب مستخدم نهائياً
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiClient.delete(
        `/api/admin/users/${userToDelete.id}/`
      );
      if (response.data.status === "success") {
        setIsDeleteVisible(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      console.log("فشل الحذف:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // تصفية وقراءة قائمة المستخدمين بناءً على مربع البحث حياً في الذاكرة لسرعة الأداء
  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber.includes(searchQuery)
  );

  return {
    filteredUsers,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    searchQuery,
    setSearchQuery,
    // إنشاء
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
    // تعديل
    isEditVisible,
    setIsEditVisible,
    selectedUser,
    setSelectedUser,
    editFullName,
    setEditFullName,
    editPhone,
    setEditPhone,
    isUpdating,
    editError,
    handleUpdateUser,
    // حذف
    isDeleteVisible,
    setIsDeleteVisible,
    userToDelete,
    setUserToDelete,
    isDeleting,
    handleDeleteUser,
  };
}
