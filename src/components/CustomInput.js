import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

export default function CustomInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  error,
}) {
  // تفعيل اللون الأحمر للإطار والنص عند وجود خطأ في هذا الحقل تحديداً
  const borderColor = error ? theme.colors.errorText : theme.colors.border;
  const labelColor = error ? theme.colors.errorText : theme.colors.text;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      )}
      <TextInput
        style={[styles.input, { borderColor }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.subtext}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {/* عرض نص الخطأ الموضعي تحت الحقل مباشرة إن وجد */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: "#FAFAFA",
    textAlign: "right",
  },
  errorText: {
    color: theme.colors.errorText,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 2,
    alignSelf: "flex-start",
    textAlign: "left",
  },
});
