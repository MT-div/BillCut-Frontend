import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminMeters() {
  const [meters, setMeters] = useState([]);
  const [activeTab, setActiveTab] = useState("meters");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // حالات القائمة الأولى CRUD
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
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

  // Picker 1: المشتركين
  const [usersList, setUsersList] = useState([]);
  const [isUserPickerVisible, setIsUserPickerVisible] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [userOffset, setUserOffset] = useState(0);
  const [userHasMore, setUserHasMore] = useState(true);

  // Picker 2: العدادات
  const [pickerMetersList, setPickerMetersList] = useState([]);
  const [isMeterPickerVisible, setIsMeterPickerVisible] = useState(false);
  const [selectedMeterForAssign, setSelectedMeterForAssign] = useState(null);
  const [meterSearchQuery, setMeterSearchQuery] = useState("");
  const [isSearchingPickerMeters, setIsSearchingPickerMeters] = useState(false);
  const [isLoadingMorePickerMeters, setIsLoadingMorePickerMeters] =
    useState(false);
  const [pickerMeterOffset, setPickerMeterOffset] = useState(0);
  const [pickerMeterHasMore, setPickerMeterHasMore] = useState(true);

  // ميزانية وإسناد
  const [assignmentAlias, setAssignmentAlias] = useState("");
  const [isAssigning, setIsCreatingAssign] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // إلغاء الإسناد
  const [isUnassignVisible, setIsUnassignVisible] = useState(false);
  const [associationToUnassign, setAssociationToUnassign] = useState(null);
  const [isUnassigning, setIsUnassigning] = useState(false);

  // 1. جلب العدادات
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
        const rawResults = response.data.results || [];
        const mappedResults = adminMapper.toMeterListViewModel(rawResults);
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setMeters(mappedResults);
          setOffset(limit);
        } else {
          setMeters((prev) => [...prev, ...mappedResults]);
          setOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setHasMore(mappedResults.length < totalCount);
        } else {
          setHasMore(meters.length + mappedResults.length < totalCount);
        }
      } catch (err) {
        const errMsg =
          err.response?.data?.message ||
          "تعذر استرجاع قائمة العدادات من السيرفر.";
        setError(errMsg);
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
  }, [activeTab]);

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

  // 2. جلب المشتركين للـ Picker 1
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
        const rawResults = response.data.results || [];
        const mappedResults = adminMapper.toUserListViewModel(rawResults);
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setUsersList(mappedResults);
          setUserOffset(limit);
        } else {
          setUsersList((prev) => [...prev, ...mappedResults]);
          setUserOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setUserHasMore(mappedResults.length < totalCount);
        } else {
          setUserHasMore(usersList.length + mappedResults.length < totalCount);
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

  const loadMoreUsers = useCallback(() => {
    if (isLoadingMoreUsers || !userHasMore) return;
    fetchUsersForPicker(false, userSearchQuery);
  }, [isLoadingMoreUsers, userHasMore, fetchUsersForPicker, userSearchQuery]);

  const handleUserSearchSubmit = () => {
    fetchUsersForPicker(true, userSearchQuery);
  };

  // 3. جلب العدادات للـ Picker 2
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
        const rawResults = response.data.results || [];
        const mappedResults = adminMapper.toMeterListViewModel(rawResults);
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setPickerMetersList(mappedResults);
          setPickerMeterOffset(limit);
        } else {
          setPickerMetersList((prev) => [...prev, ...mappedResults]);
          setPickerMeterOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setPickerMeterHasMore(mappedResults.length < totalCount);
        } else {
          setPickerMeterHasMore(
            pickerMetersList.length + mappedResults.length < totalCount
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

  const loadMoreMeters = useCallback(() => {
    if (isLoadingMorePickerMeters || !pickerMeterHasMore) return;
    fetchMetersForPicker(false, meterSearchQuery);
  }, [
    isLoadingMorePickerMeters,
    pickerMeterHasMore,
    fetchMetersForPicker,
    meterSearchQuery,
  ]);

  const handleMeterSearchSubmit = () => {
    fetchMetersForPicker(true, meterSearchQuery);
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMeters(true, searchQuery);
  }, [fetchMeters, searchQuery]);

  useEffect(() => {
    if (activeTab === "association") {
      fetchUsersForPicker(true, "");
      fetchMetersForPicker(true, "");
    }
  }, [activeTab]);

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

  const handleUnassignMeter = async () => {
    if (!associationToUnassign) return;
    setIsUnassigning(true);
    try {
      const response = await apiClient.post("/api/admin/meters/unassign/", {
        userId: associationToUnassign.userId,
        meterId: associationToUnassign.meterId,
      });
      if (response.data.status === "success") {
        setIsUnassignVisible(false);
        setAssociationToUnassign(null);
        fetchMeters(true, searchQuery);
      }
    } catch (err) {
      console.log("تعذر إلغاء الإسناد:", err);
    } finally {
      setIsUnassigning(false);
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
    selectedMeter,
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
    isUnassignVisible,
    setIsUnassignVisible,
    associationToUnassign,
    setAssociationToUnassign,
    isUnassigning,
    handleUnassignMeter,
  };
}
