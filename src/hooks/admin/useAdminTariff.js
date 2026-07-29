import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import apiClient from "../../api/apiClient";

export function useAdminTariff() {
  const [activeTab, setActiveTab] = useState("view"); // 'view' أو 'create'
  const [tariffs, setTariffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccessMsg] = useState("");

  // أ. حالات كارت التاريخ المحدثة لثلاثة حقول مستقلة (سنة، شهر، يوم)
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  // مصفوفة الشرائح الديناميكية
  // شريحة البداية: حد أدنى = 0 تلقائياً، وحد أعلى وسعر فارغان وقابلان للتعديل
  const [tiers, setTiers] = useState([
    { tierNumber: 1, startKWh: 0, endKWh: "", pricePerKWh: "" },
  ]);

  const fetchTariffs = useCallback(async () => {
    setError("");
    try {
      const response = await apiClient.get("/api/admin/tariff/update/");
      if (response.data.status === "success") {
        setTariffs(response.data.data);
      }
    } catch (err) {
      setError("تعذر استرجاع سجلات التعرفات من السيرفر.");
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

  // إضافة شريحة جديدة: يشترط أن يكون الحد الأعلى للشريحة السابقة مكتوباً وصحيحاً
  // بداية الشريحة الجديدة = نهاية الشريحة السابقة تلقائياً
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

  // يبني مصفوفة الشرائح النهائية الجاهزة للإرسال للسيرفر
  // clearLastEnd: عندما يوافق المستخدم على تفريغ الحد الأعلى للشريحة الأخيرة
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

  // التنفيذ الفعلي لعملية الحفظ (استدعاء الـ API)
  const proceedSaveTariff = async (formattedDateStr, formattedTiers) => {
    setIsSaving(true);
    try {
      const response = await apiClient.post("/api/admin/tariff/update/", {
        effectiveDate: formattedDateStr,
        tiers: formattedTiers,
      });

      if (response.data.status === "success") {
        setSuccessMsg(response.data.message);
        // تصفير الحقول للبدء من جديد بنظافة
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

  // خدمة حفظ وإصدار التعرفة: تحقق من التاريخ والشرائح، ثم تنبيه المستخدم
  // إذا كان الحد الأعلى للشريحة الأخيرة معبأً (سيتم اعتباره مفتوحاً دوماً)
  const handleSaveTariff = () => {
    setError("");
    setSuccessMsg("");

    // 1. التحقق من اكتمال إدخال حقول التاريخ الثلاثة
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

    // صياغة التاريخ بصيغة ISO القياسية (YYYY-MM-DD)
    const formattedDateStr = `${y}-${m.toString().padStart(2, "0")}-${d
      .toString()
      .padStart(2, "0")}`;

    // 2. التحقق من صحة كل الشرائح (باستثناء الحد الأعلى للشريحة الأخيرة فهو اختياري دوماً)
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

    // 3. الشريحة الأخيرة تعتبر دائماً مفتوحة الحد الأعلى
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
    // إدخال وتجميع التاريخ الثلاثي
    year,
    setYear,
    month,
    setMonth,
    day,
    setDay,
    // إدخال وتجميع الشرائح
    tiers,
    addTier,
    removeLastTier,
    updateTierField,
    handleSaveTariff,
    handleDeleteTariff,
  };
}
