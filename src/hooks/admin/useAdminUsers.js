import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // تحميل الصفحة التالية
  const [error, setError] = useState("");

  // أ. حالات البحث والزر الموجه (مفصولة ومحمية)
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false); // تجميد وتعطيل زر البحث أثناء جلب البيانات

  // ب. تفضيلات الترقيم السحابي (Pagination)
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // ج. حالات نافذة الإنشاء الجديد (Create Modal)
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [createdTempPassword, setCreatedTempPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // د. حالات نافذة التعديل (Edit Modal)
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // هـ. حالات نافذة تأكيد الحذف (Delete Confirmation)
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة جلب البيانات والتحميل التدريجي (تدعم تصفير الإزاحة عند البحث الجديد)
  const fetchUsers = useCallback(
    async (isInitial = true, searchVal = searchQuery) => {
      if (isInitial) {
        if (searchVal.trim()) {
          setIsSearching(true); // تشغيل لودر زر البحث الموجه عند البحث
        } else {
          setIsLoading(true);
        }
        setOffset(0);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");
      const currentOffset = isInitial ? 0 : offset;

      try {
        const response = await apiClient.get("/api/admin/users/create/", {
          params: {
            search: searchVal.trim(),
            limit: limit,
            offset: currentOffset,
          },
        });

        const newResults = response.data.results || [];
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setUsers(newResults);
          setOffset(limit);
        } else {
          setUsers((prev) => [...prev, ...newResults]); // دمج الصفحات الجديدة
          setOffset((prev) => prev + limit);
        }

        // التحقق من توفر صفحات متبقية سحابياً
        if (isInitial) {
          setHasMore(newResults.length < totalCount);
        } else {
          setHasMore(users.length + newResults.length < totalCount);
        }
      } catch (err) {
        setError("تعذر جلب قائمة المستخدمين النشطين من السيرفر.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        setIsSearching(false); // فك تجميد زر البحث
      }
    },
    [offset, users.length, searchQuery]
  );

  // دالة السحب للأعلى للتحديث الفوري الموحد (Pull-to-Refresh)
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers(true, searchQuery);
  }, [fetchUsers, searchQuery]);

  // دالة جلب وتحميل الصفحة التالية تلقائياً عند النزول لكعب الشاشة (Lazy Load)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading || isSearching) return;
    fetchUsers(false, searchQuery);
  }, [isLoadingMore, hasMore, isLoading, isSearching, fetchUsers, searchQuery]);

  // دالة تفعيل طلب البحث الموجه بالضغط على الزر (إلغاء الـ useEffect التلقائي لحماية السيرفر)
  const handleSearchSubmit = () => {
    fetchUsers(true, searchQuery);
  };

  useEffect(() => {
    fetchUsers(true, ""); // الجلب الأولي الافتراضي للقائمة فارغة من قيود البحث عند فتح الشاشة لأول مرة
  }, []);

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
        fetchUsers(true, ""); // تصفير البحث وتحديث القائمة فوراً
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
        fetchUsers(true, "");
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
        fetchUsers(true, "");
      }
    } catch (err) {
      console.log("فشل الحذف:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    filteredUsers: users,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    onRefresh,
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearchSubmit, // دالة الإطلاق بالزر
    loadMore,
    hasMore,
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
