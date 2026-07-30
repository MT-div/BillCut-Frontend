import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

export function useLoginForm() {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");

  // مرجع لحقل كلمة المرور للتركيز عليه تلقائياً عند الضغط على "Next" في الكيبورد
  const passwordInputRef = useRef(null);

  // تحديث الحقول مع مسح الأخطاء الموضعية فوراً أثناء الكتابة (Interactive UX)
  const handleUsernameChange = (text) => {
    setUsername(text);
    if (usernameError) setUsernameError("");
    if (globalError) setGlobalError("");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError("");
    if (globalError) setGlobalError("");
  };

  const handleLogin = async () => {
    setUsernameError("");
    setPasswordError("");
    setGlobalError("");

    let hasError = false;

    if (!username.trim()) {
      setUsernameError("اسم المستخدم مطلوب.");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("كلمة المرور مطلوبة.");
      hasError = true;
    }

    if (hasError) return false;
    setIsLoading(true);

    const result = await login(username.trim(), password.trim());

    if (result.status === "error") {
      setGlobalError(result.message);
      setIsLoading(false);
      return false;
    }

    return true;
  };

  return {
    username,
    setUsername: handleUsernameChange,
    password,
    setPassword: handlePasswordChange,
    isLoading,
    usernameError,
    passwordError,
    globalError,
    passwordInputRef,
    handleLogin,
  };
}
