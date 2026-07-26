import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { theme } from "../theme/theme";

export default function ProgressGauge({ value, max }) {
  const radius = 45; // تقليص قطر الدائرة ليناسب العرض الثنائي بجانب بعضهما
  const strokeWidth = 8; // تقليص سمك شريط التعبئة
  const circumference = 2 * Math.PI * radius; // محيط الدائرة الكلي = 282.7

  const percent = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const strokeColor =
    percent >= 100 ? theme.colors.errorText : theme.colors.secondary;

  return (
    <View style={styles.container}>
      <Svg width={110} height={110} viewBox="0 0 110 110">
        <Circle
          cx="55"
          cy="55"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx="55"
          cy="55"
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.xs,
  },
});
