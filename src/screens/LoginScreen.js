import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";

import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import CustomAlert from "../components/CustomAlert";

import { useLoginForm } from "../hooks/useLoginForm";
import { theme } from "../theme/theme";

export default function LoginScreen() {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    usernameError,
    passwordError,
    globalError,
    passwordInputRef,
    handleLogin,
  } = useLoginForm();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.brandTitle}>تطبيق BillCut</Text>
            <Text style={styles.brandSubtitle}>
              إدارة الطاقة والتنبؤ بالفواتير وكشف الخلل
            </Text>

            <CustomAlert type="error" message={globalError} />

            <CustomInput
              label="اسم الحساب"
              placeholder="أدخل اسم المستخدم أو رقم الهاتف"
              value={username}
              onChangeText={setUsername}
              error={usernameError}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <CustomInput
              ref={passwordInputRef}
              label="كلمة المرور"
              placeholder="أدخل كلمة المرور الخاصة بك"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              error={passwordError}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <CustomButton
              title="تسجيل الدخول الآمن"
              onPress={handleLogin}
              isLoading={isLoading}
              color={theme.colors.primary}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
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
