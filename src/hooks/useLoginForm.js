import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useLoginForm() {
  const { login } = useContext(AuthContext);

  // إدارة حالات حقول الإدخال والتحميل والأخطاء محلياً داخل الـ Hook
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    // التحقق الفوري محلياً قبل التخاطب مع السيرفر
    if (!username.trim() || !password.trim()) {
      setErrorMsg("يرجى كتابة اسم المستخدم وكلمة المرور بالكامل.");
      return false;
    }

    setErrorMsg("");
    setIsLoading(true);

    // استدعاء خدمة تسجيل الدخول المشفرة للباكيند
    const result = await login(username.trim(), password.trim());

    if (result.status === "error") {
      setErrorMsg(result.message);
      setIsLoading(false);
      return false;
    }

    return true;
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    errorMsg,
    setErrorMsg,
    handleLogin,
  };
}
