import { useState } from "react";
import apiClient from "../../api/apiClient";

export function useAdminTariff() {
  const [effectiveDate, setEffectiveDate] = useState("");

  // تأسيس مصفوفة الشرائح الديناميكية (تبدأ افتراضياً بالشريحة الأولى والحد الأدنى 0)
  const [tiers, setTiers] = useState([
    { tierNumber: 1, startKWh: 0.0, endKWh: "300", pricePerKWh: "600" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccessMsg] = useState("");

  // 1. خوارزمية التوليد والحقن التلقائي للشريحة الجديدة بناءً على الشريحة السابقة (SRP & UI Integrity)
  const addTier = () => {
    setError("");
    setSuccessMsg("");

    setTiers((prev) => {
      const prevTier = prev[prev.length - 1];
      const nextTierNumber = prev.length + 1;

      // قراءة الحد الأعلى للشريحة السابقة وتعيينه تلقائياً كحد أدنى للشريحة الجديدة لضمان سلامة المدخلات
      const prevEnd = prevTier ? parseFloat(prevTier.endKWh) : 0;

      if (isNaN(prevEnd) || prevEnd <= 0) {
        setError(
          "يرجى كتابة الحد الأعلى للشريحة السابقة أولاً قبل إضافة شريحة جديدة."
        );
        return prev;
      }

      return [
        ...prev,
        {
          tierNumber: nextTierNumber,
          startKWh: prevEnd, // تعيين ديناميكي تلقائي مقفل
          endKWh: "",
          pricePerKWh: "",
        },
      ];
    });
  };

  // 2. دالة إزالة الشريحة الأخيرة من المصفوفة للتراجع عن الإدخال
  const removeLastTier = () => {
    setError("");
    setSuccessMsg("");
    if (tiers.length <= 1) return; // لا نسمح بحذف الشريحة الأولى الإلزامية في النظام
    setTiers((prev) => prev.slice(0, -1));
  };

  // 3. تحديث القيم الفردية لواصفات الشريحة المحددة
  const updateTierField = (index, field, value) => {
    setError("");
    setSuccessMsg("");
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // 4. خدمة حفظ وإصدار التعرفة الكهربائية السحابية كاملة
  const handleSaveTariff = async () => {
    setError("");
    setSuccessMsg("");

    if (!effectiveDate.trim()) {
      setError("حقل تاريخ سريان ونفاذ التعرفة مطلوب.");
      return;
    }

    // التحقق من صحة واكتمال قيم كافة الشرائح المضافة
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      const isLast = i === tiers.length - 1;

      if (!isLast && (!t.endKWh || isNaN(t.endKWh))) {
        setError(
          `يرجى تحديد الحد الأعلى للشريحة رقم ${t.tierNumber} بشكل صحيح.`
        );
        return;
      }
      if (
        !t.pricePerKWh ||
        isNaN(t.pricePerKWh) ||
        parseFloat(t.pricePerKWh) <= 0
      ) {
        setError(
          `يرجى تحديد سعر الكيلوواط للشريحة رقم ${t.tierNumber} بشكل صحيح.`
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      // إعداد البيانات وتحويلها بالهيكلية المطلوبة للباكيند
      const formattedTiers = tiers.map((t, idx) => ({
        tierNumber: t.tierNumber,
        startKWh: parseFloat(t.startKWh),
        endKWh: t.endKWh === "" ? null : parseFloat(t.endKWh), // الشريحة الأخيرة ترسل Null لتعبر عن "ما فوق"
        pricePerKWh: parseFloat(t.pricePerKWh),
      }));

      const response = await apiClient.post("/api/admin/tariff/update/", {
        effectiveDate: effectiveDate.trim(),
        tiers: formattedTiers,
      });

      if (response.data.status === "success") {
        setSuccessMsg(response.data.message);
        // تصفير البيانات والبدء من جديد
        setEffectiveDate("");
        setTiers([
          { tierNumber: 1, startKWh: 0.0, endKWh: "300", pricePerKWh: "600" },
        ]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "فشلت عملية حفظ وإصدار التعرفة الكهربائية."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    effectiveDate,
    setEffectiveDate,
    tiers,
    addTier,
    removeLastTier,
    updateTierField,
    isSaving,
    error,
    success,
    handleSaveTariff,
  };
}
