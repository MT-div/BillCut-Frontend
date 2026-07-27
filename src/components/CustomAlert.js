import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

export default function CustomAlert({ type = "error", message }) {
  if (!message) return null;

  // المواءمة اللونية حسب نوع التنبيه (نجاح أو فشل)
  const isSuccess = type === "success";
  const bg = isSuccess ? theme.colors.success : theme.colors.error;
  const borderCol = isSuccess
    ? theme.colors.successText
    : theme.colors.errorText;
  const textCol = isSuccess ? theme.colors.successText : theme.colors.errorText;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: borderCol },
      ]}
    >
      <Text style={[styles.text, { color: textCol }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 18,
  },
});
