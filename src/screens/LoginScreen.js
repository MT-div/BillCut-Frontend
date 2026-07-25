import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// استيراد المكونات المشتركة التي برمجناها (DTOs & Reusable Elements)
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import ErrorAlert from "../components/ErrorAlert";

// استيراد الـ Custom Hook المخصص والمحتضن لكامل منطق العمل والـ States
import { useLoginForm } from "../hooks/useLoginForm";
import { theme } from "../theme/theme";

export default function LoginScreen() {
  // تفكيك واستدعاء الحالات والوظائف من الـ Hook ب سطر واحد ومثالي (SRP)
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    errorMsg,
    handleLogin,
  } = useLoginForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.brandTitle}>تطبيق BillCut</Text>
        <Text style={styles.brandSubtitle}>
          إدارة الطاقة والتنبؤ بالفواتير وكشف الخلل
        </Text>

        {/* عرض صندوق الخطأ التفاعلي المشترك */}
        <ErrorAlert message={errorMsg} />

        {/* حقل إدخال اسم المستخدم المشترك */}
        <CustomInput
          label="اسم الحساب"
          placeholder="أدخل اسم المستخدم أو رقم الهاتف"
          value={username}
          onChangeText={setUsername}
        />

        {/* حقل إدخال كلمة المرور المشترك المشفر */}
        <CustomInput
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور الخاصة بك"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        {/* زر الدخول المشترك التفاعلي */}
        <CustomButton
          title="تسجيل الدخول الآمن"
          onPress={handleLogin}
          isLoading={isLoading}
          color={theme.colors.primary}
        />
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
});
