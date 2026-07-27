import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useLoginForm() {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // فصل وتحديد أخطاء الحقول لتلوين مدخلاتها بالأحمر موضعياً
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");

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
    setUsername,
    password,
    setPassword,
    isLoading,
    usernameError,
    passwordError,
    globalError,
    setGlobalError,
    handleLogin,
  };
}
