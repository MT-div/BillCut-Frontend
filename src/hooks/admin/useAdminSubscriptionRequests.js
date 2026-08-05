import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { subscriptionMapper } from "../../api/mappers/subscriptionMapper";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminSubscriptionRequests() {
  const [requestsList, setRequestsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // حالات البحث والفلترة حسب الحالة
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" أو "PENDING" أو "COMPLETED" أو "CANCELLED"
  const [isSearching, setIsSearching] = useState(false);

  // الترقيم السحابي
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // حالات نافذة الأتمتة المزدوجة (Provision Modal)
  const [isProvisionVisible, setIsProvisionVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [aliasInput, setAliasInput] = useState("عداد المنزل");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState("");
  const [provisionResult, setProvisionResult] = useState(null);

  // أداة اختيار العدادات القابلة للبحث للتركيب
  const [pickerMetersList, setPickerMetersList] = useState([]);
  const [isMeterPickerVisible, setIsMeterPickerVisible] = useState(false);
  const [selectedMeterForProvision, setSelectedMeterForProvision] =
    useState(null);
  const [meterSearchQuery, setMeterSearchQuery] = useState("");
  const [isSearchingPickerMeters, setIsSearchingPickerMeters] = useState(false);

  // حالات تأكيد الحذف
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // حالات نافذة تأكيد التعيين كمكتمل بعد فحص العدادات
  const [isCompleteConfirmVisible, setIsCompleteConfirmVisible] =
    useState(false);
  const [requestToComplete, setRequestToComplete] = useState(null);
  const [userBoundMeters, setUserBoundMeters] = useState([]);
  const [isCheckingMeters, setIsCheckingMeters] = useState(false);

  // دالة فحص عدادات المشترك قبل فتح نافذة التأكيد
  const handleCheckAndOpenCompleteModal = async (requestItem) => {
    setIsCheckingMeters(true);
    setError("");
    try {
      // البحث عن العدادات المسندة برقم هاتف صاحب الطلب
      const response = await apiClient.get("/api/admin/meters/create/", {
        params: { search: requestItem.phoneNumber, limit: 10, offset: 0 },
      });

      const foundMeters = response.data.results || [];

      // استخراج العدادات المسندة لهذا المستخدم
      const boundMeters = [];
      foundMeters.forEach((m) => {
        if (Array.isArray(m.associatedUsers)) {
          m.associatedUsers.forEach((u) => {
            if (u.phoneNumber === requestItem.phoneNumber) {
              boundMeters.push({ alias: u.alias, meterId: m.meterId });
            }
          });
        }
      });

      if (boundMeters.length === 0) {
        setError(
          "عذراً، يمنع تعيين الطلب كمكتمل لعدم وجود أي عداد مرتبط بحساب هذا المشترك حتى الآن. يرجى الضغط على زر 'تركيب وحساب' لتركيب عداد أولاً."
        );
        return;
      }

      setUserBoundMeters(boundMeters);
      setRequestToComplete(requestItem);
      setIsCompleteConfirmVisible(true);
    } catch (err) {
      console.log("فشل فحص العدادات:", err);
    } finally {
      setIsCheckingMeters(false);
    }
  };

  // تأكيد التعيين كمكتمل
  const handleConfirmComplete = async () => {
    if (!requestToComplete) return;
    try {
      await handleUpdateStatus(requestToComplete.requestId, "COMPLETED");
      setIsCompleteConfirmVisible(false);
      setRequestToComplete(null);
    } catch (e) {
      console.log("تعذر التكتمال:", e);
    }
  };
  // 1. جلب الطلبات
  const fetchRequests = useCallback(
    async (
      isInitial = true,
      searchVal = searchQuery,
      statusVal = statusFilter
    ) => {
      if (isInitial) {
        if (searchVal.trim() || statusVal) setIsSearching(true);
        else setIsLoading(true);
        setOffset(0);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");
      const currentOffset = isInitial ? 0 : offset;

      try {
        const response = await apiClient.get(
          "/api/admin/subscription_requests/",
          {
            params: {
              search: searchVal.trim(),
              status: statusVal || undefined,
              limit: limit,
              offset: currentOffset,
            },
          }
        );

        const rawResults = response.data.results || [];
        const mappedResults = subscriptionMapper.toDomainList(rawResults);
        const totalCount = response.data.count || 0;

        if (isInitial) {
          setRequestsList(mappedResults);
          setOffset(limit);
        } else {
          setRequestsList((prev) => [...prev, ...mappedResults]);
          setOffset((prev) => prev + limit);
        }

        if (isInitial) {
          setHasMore(mappedResults.length < totalCount);
        } else {
          setHasMore(requestsList.length + mappedResults.length < totalCount);
        }
      } catch (err) {
        setError(err.response?.data?.message || "تعذر جلب طلبات الاشتراك.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        setIsSearching(false);
      }
    },
    [offset, requestsList.length, searchQuery, statusFilter]
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRequests(true, searchQuery, statusFilter);
  }, [fetchRequests, searchQuery, statusFilter]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading || isSearching) return;
    fetchRequests(false, searchQuery, statusFilter);
  }, [
    isLoadingMore,
    hasMore,
    isLoading,
    isSearching,
    fetchRequests,
    searchQuery,
    statusFilter,
  ]);

  const handleSearchSubmit = () => {
    fetchRequests(true, searchQuery, statusFilter);
  };

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchRequests(true, searchQuery, newStatus);
  };

  // 2. جلب العدادات للـ Picker
  const fetchMetersForPicker = useCallback(
    async (searchVal = meterSearchQuery) => {
      setIsSearchingPickerMeters(true);
      try {
        const response = await apiClient.get("/api/admin/meters/create/", {
          params: { search: searchVal.trim(), limit: 10, offset: 0 },
        });
        const rawResults = response.data.results || [];
        setPickerMetersList(adminMapper.toMeterListViewModel(rawResults));
      } catch (err) {
        console.log("فشل جلب العدادات:", err);
      } finally {
        setIsSearchingPickerMeters(false);
      }
    },
    [meterSearchQuery]
  );

  // 3. أتمتة الإنشاء والربط المزدوج بنقرة زر (3-in-1 Provisioning)
  const handleProvisionSubmit = async () => {
    setProvisionError("");
    if (!selectedRequest || !selectedMeterForProvision || !aliasInput.trim()) {
      setProvisionError("يرجى تحديد العداد وكتابة تسميته المستعارة.");
      return;
    }

    setIsProvisioning(true);
    try {
      const response = await apiClient.post(
        "/api/admin/subscription_requests/provision/",
        {
          requestId: selectedRequest.requestId,
          meterId: selectedMeterForProvision.meterId,
          alias: aliasInput.trim(),
        }
      );

      if (response.data.status === "success") {
        setProvisionResult({
          message: response.data.message,
          data: response.data.data,
        });
        fetchRequests(true, searchQuery, statusFilter);
      }
    } catch (err) {
      setProvisionError(
        err.response?.data?.message || "تعذر إتمام عملية التركيب والربط."
      );
    } finally {
      setIsProvisioning(false);
    }
  };

  // 4. تعديل الحالة يدوياً
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await apiClient.put(
        `/api/admin/subscription_requests/${requestId}/`,
        {
          status: newStatus,
        }
      );
      if (response.data.status === "success") {
        fetchRequests(true, searchQuery, statusFilter);
      }
    } catch (err) {
      console.log("فشل تعديل الحالة:", err);
    }
  };

  // 5. حذف الطلب
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    try {
      const response = await apiClient.delete(
        `/api/admin/subscription_requests/${requestToDelete.requestId}/`
      );
      if (response.data.status === "success") {
        setIsDeleteVisible(false);
        setRequestToDelete(null);
        fetchRequests(true, searchQuery, statusFilter);
      }
    } catch (err) {
      console.log("فشل الحذف:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchRequests(true, "", "");
  }, []);

  return {
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
    hasMore,
    // أتمتة الإسناد
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
    // الـ Picker
    isMeterPickerVisible,
    setIsMeterPickerVisible,
    selectedMeterForProvision,
    setSelectedMeterForProvision,
    meterSearchQuery,
    setMeterSearchQuery,
    isSearchingPickerMeters,
    fetchMetersForPicker,
    pickerMetersList,
    // تحديث وتغير وحذف
    handleUpdateStatus,
    isDeleteVisible,
    setIsDeleteVisible,
    requestToDelete,
    setRequestToDelete,
    isDeleting,
    handleDeleteRequest,
    //التاكد من ارتباط العدادات قبل التعيين كمكتمل
    isCompleteConfirmVisible,
    setIsCompleteConfirmVisible,
    requestToComplete,
    userBoundMeters,
    isCheckingMeters,
    handleCheckAndOpenCompleteModal,
    handleConfirmComplete,
  };
}
