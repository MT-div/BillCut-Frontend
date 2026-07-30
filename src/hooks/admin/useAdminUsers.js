import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // حالات البحث
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // الترقيم السحابي
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // حالات الإنشاء
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [createdTempPassword, setCreatedTempPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // حالات التعديل
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // حالات الحذف
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // دالة الجلب والترقيم
  const fetchUsers = useCallback(
    async (isInitial = true, searchVal = searchQuery) => {
      if (isInitial) {
        if (searchVal.trim()) {
          setIsSearching(true);
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

        // تنقية وتنسيق مصفوفة النتائج عبر adminMapper
        const rawResults = response.data.results || [];
        const mappedResults = adminMapper.toUserListViewModel(rawResults);
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setUsers(mappedResults);
          setOffset(limit);
        } else {
          setUsers((prev) => [...prev, ...mappedResults]);
          setOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setHasMore(mappedResults.length < totalCount);
        } else {
          setHasMore(users.length + mappedResults.length < totalCount);
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message ||
          "تعذر جلب قائمة المستخدمين النشطين من السيرفر.";
        setError(errMsg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        setIsSearching(false);
      }
    },
    [offset, users.length, searchQuery]
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchUsers(true, searchQuery);
  }, [fetchUsers, searchQuery]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading || isSearching) return;
    fetchUsers(false, searchQuery);
  }, [isLoadingMore, hasMore, isLoading, isSearching, fetchUsers, searchQuery]);

  const handleSearchSubmit = () => {
    fetchUsers(true, searchQuery);
  };

  useEffect(() => {
    fetchUsers(true, "");
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
        fetchUsers(true, "");
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
    handleSearchSubmit,
    loadMore,
    hasMore,
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
