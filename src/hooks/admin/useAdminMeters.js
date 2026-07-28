import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

export function useAdminMeters() {
  const [meters, setMeters] = useState([]);
  const [activeTab, setActiveTab] = useState("meters"); // 'meters' أو 'association'

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // أ. تفضيلات القائمة الأولى (التبويب الأول: العدادات الفعالة CRUD)
  // ============================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [newMeterId, setNewMeterId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [isEditVisible, setIsEditVisible] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [editMeterId, setEditMeterId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [meterToDelete, setMeterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================
  // ب. تفضيلات الـ Picker الأول (اختيار المشترك المرقّم سحابياً)
  // ============================================================
  const [usersList, setUsersList] = useState([]);
  const [isUserPickerVisible, setIsUserPickerVisible] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [userOffset, setUserOffset] = useState(0);
  const [userHasMore, setUserHasMore] = useState(true);

  // ============================================================
  // ج. تفضيلات الـ Picker الثاني (اختيار العداد المرقّم سحابياً)
  // ============================================================
  const [pickerMetersList, setPickerMetersList] = useState([]);
  const [isMeterPickerVisible, setIsMeterPickerVisible] = useState(false);
  const [selectedMeterForAssign, setSelectedMeterForAssign] = useState(null);
  const [meterSearchQuery, setMeterSearchQuery] = useState("");
  const [isSearchingPickerMeters, setIsSearchingPickerMeters] = useState(false);
  const [isLoadingMorePickerMeters, setIsLoadingMorePickerMeters] =
    useState(false);
  const [pickerMeterOffset, setPickerMeterOffset] = useState(0);
  const [pickerMeterHasMore, setPickerMeterHasMore] = useState(true);

  // د. ميزانية وربط العدادات
  const [assignmentAlias, setAssignmentAlias] = useState("");
  const [isAssigning, setIsCreatingAssign] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // ------------------------------------------------------------
  // 1. خوارزمية جلب العدادات المرقّمة (التبويب الأول)
  // ------------------------------------------------------------
  const fetchMeters = useCallback(
    async (isInitial = true, searchVal = searchQuery) => {
      if (isInitial) {
        if (searchVal.trim()) setIsSearching(true);
        else setIsLoading(true);
        setOffset(0);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }
      setError("");
      const currentOffset = isInitial ? 0 : offset;

      try {
        const response = await apiClient.get("/api/admin/meters/create/", {
          params: {
            search: searchVal.trim(),
            limit: limit,
            offset: currentOffset,
          },
        });
        const newResults = response.data.results || [];
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setMeters(newResults);
          setOffset(limit);
        } else {
          setMeters((prev) => [...prev, ...newResults]);
          setOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setHasMore(newResults.length < totalCount);
        } else {
          setHasMore(meters.length + newResults.length < totalCount);
        }
      } catch (err) {
        setError("تعذر استرجاع قائمة العدادات من السيرفر.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        setIsSearching(false);
      }
    },
    [offset, meters.length, searchQuery]
  );
  useEffect(() => {
    if (activeTab === "meters") {
      fetchMeters(true, "");
    }
  }, []);
  // دالة تحميل المزيد للتبويب الأول (Infinite Scroll)
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading || isSearching) return;
    fetchMeters(false, searchQuery);
  }, [
    isLoadingMore,
    hasMore,
    isLoading,
    isSearching,
    fetchMeters,
    searchQuery,
  ]);

  // ------------------------------------------------------------
  // 2. خوارزمية جلب المشتركين المرقّمة للـ Picker الأول (التبويب الثاني)
  // ------------------------------------------------------------
  const fetchUsersForPicker = useCallback(
    async (isInitial = true, searchVal = userSearchQuery) => {
      if (isInitial) {
        if (searchVal.trim()) setIsSearchingUsers(true);
        setUserOffset(0);
        setUserHasMore(true);
      } else {
        setIsLoadingMoreUsers(true);
      }
      const currentOffset = isInitial ? 0 : userOffset;

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
          setUsersList(newResults);
          setUserOffset(limit);
        } else {
          setUsersList((prev) => [...prev, ...newResults]);
          setUserOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setUserHasMore(newResults.length < totalCount);
        } else {
          setUserHasMore(usersList.length + newResults.length < totalCount);
        }
      } catch (err) {
        console.log("فشل جلب المستخدمين للـ Picker:", err);
      } finally {
        setIsSearchingUsers(false);
        setIsLoadingMoreUsers(false);
      }
    },
    [userOffset, usersList.length, userSearchQuery]
  );

  // دالة تحميل المزيد للمشتركين داخل الـ Picker (Infinite Scroll)
  const loadMoreUsers = useCallback(() => {
    if (isLoadingMoreUsers || !userHasMore) return;
    fetchUsersForPicker(false, userSearchQuery);
  }, [isLoadingMoreUsers, userHasMore, fetchUsersForPicker, userSearchQuery]);

  // دالة إطلاق البحث الموجه للمشتركين بداخل الـ Picker
  const handleUserSearchSubmit = () => {
    fetchUsersForPicker(true, userSearchQuery);
  };

  // ------------------------------------------------------------
  // 3. خوارزمية جلب العدادات المرقّمة للـ Picker الثاني (التبويب الثاني)
  // ------------------------------------------------------------
  const fetchMetersForPicker = useCallback(
    async (isInitial = true, searchVal = meterSearchQuery) => {
      if (isInitial) {
        if (searchVal.trim()) setIsSearchingPickerMeters(true);
        setPickerMeterOffset(0);
        setPickerMeterHasMore(true);
      } else {
        setIsLoadingMorePickerMeters(true);
      }
      const currentOffset = isInitial ? 0 : pickerMeterOffset;

      try {
        const response = await apiClient.get("/api/admin/meters/create/", {
          params: {
            search: searchVal.trim(),
            limit: limit,
            offset: currentOffset,
          },
        });
        const newResults = response.data.results || [];
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setPickerMetersList(newResults);
          setPickerMeterOffset(limit);
        } else {
          setPickerMetersList((prev) => [...prev, ...newResults]);
          setPickerMeterOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setPickerMeterHasMore(newResults.length < totalCount);
        } else {
          setPickerMeterHasMore(
            pickerMetersList.length + newResults.length < totalCount
          );
        }
      } catch (err) {
        console.log("فشل جلب العدادات للـ Picker:", err);
      } finally {
        setIsSearchingPickerMeters(false);
        setIsLoadingMorePickerMeters(false);
      }
    },
    [pickerMeterOffset, pickerMetersList.length, meterSearchQuery]
  );

  // دالة تحميل المزيد للعدادات داخل الـ Picker (Infinite Scroll)
  const loadMoreMeters = useCallback(() => {
    if (isLoadingMorePickerMeters || !pickerMeterHasMore) return;
    fetchMetersForPicker(false, meterSearchQuery);
  }, [
    isLoadingMorePickerMeters,
    pickerMeterHasMore,
    fetchMetersForPicker,
    meterSearchQuery,
  ]);

  // دالة إطلاق البحث الموجه للعدادات بداخل الـ Picker
  const handleMeterSearchSubmit = () => {
    fetchMetersForPicker(true, meterSearchQuery);
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMeters(true, searchQuery);
  }, [fetchMeters, searchQuery]);

  // 4. تفعيل الجلب والمسح التلقائي للـ Pickers عند تصفح التبويب الثاني
  useEffect(() => {
    if (activeTab === "association") {
      fetchUsersForPicker(true, "");
      fetchMetersForPicker(true, "");
    }
  }, [activeTab]);

  // 5. إضافة عداد جديد
  const handleCreateMeter = async () => {
    setCreateError("");
    if (!newMeterId.trim())
      return setCreateError("يرجى إدخال معرّف العداد الفيزيائي.");

    setIsCreating(true);
    try {
      const response = await apiClient.post("/api/admin/meters/create/", {
        meterId: newMeterId.trim(),
      });
      if (response.data.status === "success") {
        setIsCreateVisible(false);
        setNewMeterId("");
        fetchMeters(true, "");
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || "فشلت عملية إضافة العداد.");
    } finally {
      setIsCreating(false);
    }
  };

  // 6. تعديل عداد قائم (PUT)
  const handleUpdateMeter = async () => {
    setEditError("");
    if (!editMeterId.trim() || !selectedMeter)
      return setEditError("يرجى تحديد القيمة الجديدة.");

    setIsUpdating(true);
    try {
      const response = await apiClient.put(
        `/api/admin/meters/${selectedMeter.meterId}/`,
        {
          newMeterId: editMeterId.trim(),
        }
      );
      if (response.data.status === "success") {
        setIsEditVisible(false);
        setSelectedMeter(null);
        fetchMeters(true, "");
      }
    } catch (err) {
      setEditError(err.response?.data?.message || "تعذر التعديل.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 7. حذف العداد نهائياً
  const handleDeleteMeter = async () => {
    if (!meterToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiClient.delete(
        `/api/admin/meters/${meterToDelete.meterId}/`
      );
      if (response.data.status === "success") {
        setIsDeleteVisible(false);
        setMeterToDelete(null);
        fetchMeters(true, "");
      }
    } catch (err) {
      console.log("تعذر حذف العداد:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 8. إسناد العداد لمستخدم
  const handleAssignMeter = async () => {
    setAssignError("");
    setAssignSuccess("");
    if (
      !selectedUserForAssign ||
      !selectedMeterForAssign ||
      !assignmentAlias.trim()
    ) {
      setAssignError("يرجى تحديد المشترك والعداد وكتابة الاسم المستعار للربط.");
      return;
    }

    setIsCreatingAssign(true);
    try {
      const response = await apiClient.post("/api/admin/meters/assign/", {
        userId: selectedUserForAssign.id,
        meterId: selectedMeterForAssign.meterId,
        alias: assignmentAlias.trim(),
      });
      if (response.data.status === "success") {
        setAssignSuccess("تم إسناد وربط العداد بالمشترك بنجاح.");
        setSelectedUserForAssign(null);
        setSelectedMeterForAssign(null);
        setAssignmentAlias("");
      }
    } catch (err) {
      setAssignError(err.response?.data?.message || "تعذر إتمام الإسناد.");
    } finally {
      setIsCreatingAssign(false);
    }
  };

  return {
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
    fetchMeters, // تصدير التابع يدوياً للبحث بالتبويب الأول
    loadMore,
    hasMore,
    // إنشاء
    isCreateVisible,
    setIsCreateVisible,
    newMeterId,
    setNewMeterId,
    isCreating,
    createError,
    handleCreateMeter,
    // تعديل
    isEditVisible,
    setIsEditVisible,
    selectedMeter,
    setSelectedMeter,
    editMeterId,
    setEditMeterId,
    isUpdating,
    editError,
    handleUpdateMeter,
    // حذف
    isDeleteVisible,
    setIsDeleteVisible,
    meterToDelete,
    setMeterToDelete,
    isDeleting,
    handleDeleteMeter,
    // تفضيلات وبحث الـ Picker الأول (المشتركين)
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
    // تفضيلات وبحث الـ Picker الثاني (العدادات)
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
    // إسناد
    assignmentAlias,
    setAssignmentAlias,
    isAssigning,
    assignError,
    assignSuccess,
    handleAssignMeter,
  };
}
