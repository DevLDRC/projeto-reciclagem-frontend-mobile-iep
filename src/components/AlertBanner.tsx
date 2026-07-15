import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { colors, fonts } from "../utils/theme";

interface AlertBannerProps {
  message: { text: string; type: "success" | "error" | "warning" } | null;
}

export default function AlertBanner({ message }: AlertBannerProps) {
  if (!message) return null;

  return (
    <View style={[styles.alertBanner, styles[`alert_${message.type}`]]}>
      {message.type === "success" && <CheckCircle2 size={16} color={colors.green700} />}
      {message.type === "error" && <AlertTriangle size={16} color={colors.red700} />}
      {message.type === "warning" && <AlertTriangle size={16} color={colors.yellow700} />}
      <Text style={[styles.alertText, styles[`alertText_${message.type}`]]}>
        {message.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alert_success: {
    backgroundColor: colors.green150,
    borderColor: colors.green200,
  },
  alert_error: {
    backgroundColor: colors.red50,
    borderColor: colors.red200,
  },
  alert_warning: {
    backgroundColor: colors.yellow100,
    borderColor: colors.yellow200,
  },
  alertText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    marginLeft: 8,
    flex: 1,
  },
  alertText_success: {
    color: colors.green700,
  },
  alertText_error: {
    color: colors.red700,
  },
  alertText_warning: {
    color: colors.yellow700,
  },
});
