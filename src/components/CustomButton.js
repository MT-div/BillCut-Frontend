import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { theme } from "../theme/theme";

export default function CustomButton({
  title,
  onPress,
  isLoading = False,
  color,
}) {
  const buttonColor = color || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isLoading ? theme.colors.subtext : buttonColor },
      ]}
      onPress={onPress}
      disabled={isLoading}
      // # يمنع ضغط الزر مكرراً أثناء معالجة الطلب
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
