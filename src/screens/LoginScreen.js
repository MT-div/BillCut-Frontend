import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// استيراد الأمان والهوية البصرية
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme/theme";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);

  // تعريف الحالات المحلية لإدارة حقول الإدخال والتحميل والأخطاء
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    // 1. التحقق المحلي الأولي قبل إرهاق السيرفر بالطلبات الخاطئة
    if (!username.trim() || !password.trim()) {
      setErrorMsg("يرجى كتابة اسم المستخدم وكلمة المرور بالكامل.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    // 2. إرسال الطلب واستدعاء خدمة المصادقة الـ JWT
    const result = await login(username.trim(), password.trim());

    if (result.status === "error") {
      setErrorMsg(result.message);
      setIsLoading(false);
    }
    // في حال النجاح، سيقوم الـ AppNavigator تلقائياً بالتحويل للمسار الصحيح بفضل الـ Auth Guard
  };

  return (
    // استخدام كيبورد متجنب للاصطدام لحماية الواجهة في شاشات الموبايل الصغيرة
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.brandTitle}>تطبيق BillCut</Text>
        <Text style={styles.brandSubtitle}>
          إدارة الطاقة والتنبؤ بالفواتير وكشف الخلل
        </Text>

        {/* عرض رسالة الخطأ التفاعلية باللون المعتمد بالثيم */}
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* حقل اسم المستخدم */}
        <Text style={styles.label}>اسم الحساب</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم المستخدم أو رقم الهاتف"
          placeholderTextColor={theme.colors.subtext}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setErrorMsg("");
          }}
          autoCapitalize="none"
          keyboardType="default"
        />

        {/* حقل كلمة المرور */}
        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل كلمة المرور الخاصة بك"
          placeholderTextColor={theme.colors.subtext}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMsg("");
          }}
          secureTextEntry={true} // حماية تشفير إدخال كلمة المرور بصرياً
          autoCapitalize="none"
        />

        {/* زر الدخول التفاعلي */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isLoading
                ? theme.colors.subtext
                : theme.colors.primary,
            },
          ]}
          onPress={handleLogin}
          disabled={isLoading} // تعطيل الزر أثناء التحميل لمنع تكرار النقرات
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>تسجيل الدخول الآمن</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  brandSubtitle: {
    fontSize: 13,
    color: theme.colors.subtext,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.errorText,
  },
  errorText: {
    color: theme.colors.errorText,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: "#FAFAFA",
    textAlign: "right", // مواءمة الكتابة باللغة العربية
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
