import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import apiClient from "../../api/apiClient";
import { adminMapper } from "../../api/mappers/adminMapper";

export function useAdminTariff() {
  const [activeTab, setActiveTab] = useState("view");
  const [tariffs, setTariffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccessMsg] = useState("");

  // حقول إدخال التاريخ
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  // مصفوفة الشرائح الديناميكية
  const [tiers, setTiers] = useState([
    { tierNumber: 1, startKWh: 0, endKWh: "", pricePerKWh: "" },
  ]);

  const fetchTariffs = useCallback(async () => {
    setError("");
    try {
      const response = await apiClient.get("/api/admin/tariff/update/");
      if (response.data.status === "success") {
        const rawResults = response.data.data || [];
        const mappedTariffs = adminMapper.toTariffListViewModel(rawResults);
        setTariffs(mappedTariffs);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        "تعذر استرجاع سجلات التعرفات من السيرفر.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTariffs();
  }, [fetchTariffs]);

  useEffect(() => {
    fetchTariffs();
  }, [fetchTariffs]);

  const addTier = () => {
    setError("");
    setSuccessMsg("");
    setTiers((prev) => {
      const prevTier = prev[prev.length - 1];
      const prevStart = parseFloat(prevTier.startKWh);
      const prevEnd = parseFloat(prevTier.endKWh);

      if (
        prevTier.endKWh === "" ||
        prevTier.endKWh === null ||
        prevTier.endKWh === undefined ||
        isNaN(prevEnd)
      ) {
        setError(
          "يرجى تحديد الحد الأعلى للشريحة السابقة أولاً قبل إضافة شريحة جديدة."
        );
        return prev;
      }

      if (prevEnd <= prevStart) {
        setError(
          "يجب أن يكون الحد الأعلى للشريحة السابقة أكبر من حدها الأدنى."
        );
        return prev;
      }

      const nextTierNumber = prev.length + 1;
      return [
        ...prev,
        {
          tierNumber: nextTierNumber,
          startKWh: prevEnd,
          endKWh: "",
          pricePerKWh: "",
        },
      ];
    });
  };

  const removeLastTier = () => {
    setError("");
    setSuccessMsg("");
    if (tiers.length <= 1) return;
    setTiers((prev) => prev.slice(0, -1));
  };

  const updateTierField = (index, field, value) => {
    setError("");
    setSuccessMsg("");
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const buildFormattedTiers = (clearLastEnd) =>
    tiers.map((t, idx) => {
      const isLast = idx === tiers.length - 1;
      return {
        tierNumber: t.tierNumber,
        startKWh: parseFloat(t.startKWh),
        endKWh: isLast
          ? clearLastEnd
            ? null
            : t.endKWh === ""
            ? null
            : parseFloat(t.endKWh)
          : parseFloat(t.endKWh),
        pricePerKWh: parseFloat(t.pricePerKWh),
      };
    });

  const proceedSaveTariff = async (formattedDateStr, formattedTiers) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post("/api/admin/tariff/update/", {
        effectiveDate: formattedDateStr,
        tiers: formattedTiers,
      });

      if (response.data.status === "success") {
        setSuccessMsg(response.data.message || "تم حفظ التعرفة بنجاح.");
        setYear("");
        setMonth("");
        setDay("");
        setTiers([{ tierNumber: 1, startKWh: 0, endKWh: "", pricePerKWh: "" }]);
        fetchTariffs();
      }
    } catch (err) {
      setError(err.response?.data?.message || "فشلت عملية حفظ التعرفة.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTariff = () => {
    setError("");
    setSuccessMsg("");

    if (!year.trim() || !month.trim() || !day.trim()) {
      setError("يرجى إدخال تاريخ السريان بالكامل (السنة، الشهر، واليوم).");
      return;
    }

    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (
      isNaN(y) ||
      isNaN(m) ||
      isNaN(d) ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      setError(
        "التاريخ المدخل غير صالح، يرجى كتابة أرقام صحيحة لليوم والشهر والسنة."
      );
      return;
    }

    const formattedDateStr = `${y}-${m.toString().padStart(2, "0")}-${d
      .toString()
      .padStart(2, "0")}`;

    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const isLast = i === tiers.length - 1;
      const start = parseFloat(t.startKWh);
      const price = parseFloat(t.pricePerKWh);

      if (t.pricePerKWh === "" || isNaN(price) || price <= 0) {
        setError(
          `يرجى كتابة سعر الكيلوواط للشريحة رقم ${t.tierNumber} بشكل صحيح.`
        );
        return;
      }

      if (!isLast) {
        const end = parseFloat(t.endKWh);
        if (t.endKWh === "" || isNaN(end) || end <= start) {
          setError(`الحدود الاستهلاكية للشريحة رقم ${t.tierNumber} غير صالحة.`);
          return;
        }
      }
    }

    const lastTier = tiers[tiers.length - 1];
    const lastEndFilled =
      lastTier.endKWh !== "" &&
      lastTier.endKWh !== null &&
      lastTier.endKWh !== undefined;

    if (lastEndFilled) {
      Alert.alert(
        "تنبيه",
        "الشريحة الأخيرة تعتبر دائماً مفتوحة الحد الأعلى، وسيتم تفريغ القيمة المكتوبة في هذا الحقل عند المتابعة. هل تريد المتابعة؟",
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "موافق، متابعة",
            onPress: () => {
              setTiers((prev) => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                updated[lastIdx] = { ...updated[lastIdx], endKWh: "" };
                return updated;
              });
              proceedSaveTariff(formattedDateStr, buildFormattedTiers(true));
            },
          },
        ],
        { cancelable: true }
      );
      return;
    }

    proceedSaveTariff(formattedDateStr, buildFormattedTiers(false));
  };

  const handleDeleteTariff = async (versionId) => {
    try {
      const response = await apiClient.delete(
        `/api/admin/tariff/detail/${versionId}/`
      );
      if (response.data.status === "success") {
        fetchTariffs();
      }
    } catch (err) {
      setError(err.response?.data?.message || "تعذر حذف التعرفة المستهدفة.");
    }
  };

  return {
    activeTab,
    setActiveTab,
    tariffs,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    success,
    onRefresh,
    year,
    setYear,
    month,
    setMonth,
    day,
    setDay,
    tiers,
    addTier,
    removeLastTier,
    updateTierField,
    handleSaveTariff,
    handleDeleteTariff,
  };
}
