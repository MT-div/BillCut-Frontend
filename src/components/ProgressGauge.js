import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../theme/theme";

export default function ProgressGauge({ value, max }) {
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  const percent = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // اللون يتغير للأحمر فقط عند تجاوز حد الدعم أو الميزانية بالكامل
  const strokeColor =
    percent >= 100 ? theme.colors.errorText : theme.colors.secondary;

  return (
    <View style={styles.container}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        <Circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx="90"
          cy="90"
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.sm,
  },
});
