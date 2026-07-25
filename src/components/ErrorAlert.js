import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme/theme";

export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: theme.colors.error,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.errorText,
  },
  text: {
    color: theme.colors.errorText,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
