import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // نص البحث
  const [searchQuery, setSearchQuery] = useState("");

  // أ. حالات نافذة الإنشاء الجديد (Create Modal)
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [createdTempPassword, setCreatedTempPassword] = useState("");
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

  // تحديث دالة الجلب لتقبل البحث السحابي المباشر عبر البارامترات
  const fetchUsers = useCallback(
    async (searchVal = searchQuery) => {
      try {
        const response = await apiClient.get("/api/admin/users/create/", {
          params: { search: searchVal.trim() }, // # إرسال نص البحث كـ Query Parameter للسيرفر
        });
        if (response.data.status === "success") {
          setUsers(response.data.data);
        }
      } catch (err) {
        setError("تعذر جلب قائمة المستخدمين النشطين من السيرفر.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery]
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  // تحديث تلقائي وفوري لجلب البيانات المفلترة من السيرفر كلما قام الأدمن بتحديث نص البحث
  useEffect(() => {
    fetchUsers();
  }, [searchQuery]); // # مراقبة نص البحث لإرسال الطلب فوراً

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
        setCreatedTempPassword(response.data.data.temporaryPassword);
        setNewFullName("");
        setNewPhone("");
        fetchUsers();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "فشلت عملية إنشاء الحساب.");
    } finally {
      setIsCreating(false);
    }
  };

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

  return {
    filteredUsers: users, // أصبحت القائمة مفلترة ومجهزة سلفاً من السيرفر بكفاءة كاملة
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
    selectedUser,
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
  };
}
