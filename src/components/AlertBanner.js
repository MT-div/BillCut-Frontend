import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

export default function AlertBanner({ type, message }) {
  if (!message) return null;

  // تحديد ألوان الخلفية والنص بناءً على نوع التنبيه الوارد
  let bg = theme.colors.warning;
  let textCol = theme.colors.warningText;
  let borderCol = theme.colors.warningText;

  if (type === "error" || type === "ANOMALY") {
    bg = theme.colors.error;
    textCol = theme.colors.errorText;
    borderCol = theme.colors.errorText;
  }

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
    marginBottom: theme.spacing.md,
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
