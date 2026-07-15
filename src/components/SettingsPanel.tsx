import React from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { colors, fonts } from "../utils/theme";

interface SettingsPanelProps {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  onTestConnection: () => void;
}

export default function SettingsPanel({
  backendUrl,
  setBackendUrl,
  onTestConnection,
}: SettingsPanelProps) {
  return (
    <View style={styles.settingsPanel}>
      <Text style={styles.sectionTitle}>Configurações de Conexão</Text>
      <Text style={styles.fieldLabel}>URL da API Backend (Spring Boot)</Text>
      <View style={styles.settingsInputRow}>
        <TextInput
          style={styles.settingsInput}
          value={backendUrl}
          onChangeText={setBackendUrl}
          placeholder="Ex: http://10.0.2.2:8080"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.testBtn} onPress={onTestConnection}>
          <Text style={styles.testBtnText}>Testar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={styles.presetBadge}
          onPress={() => setBackendUrl("http://localhost:8080")}
        >
          <Text style={styles.presetText}>localhost</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.presetBadge}
          onPress={() => setBackendUrl("http://10.0.2.2:8080")}
        >
          <Text style={styles.presetText}>Android Emu</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.settingsHelp}>
        * Em aparelhos físicos, use o IP local do computador (Ex: http://192.168.x.x:8080).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsPanel: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: fonts.bold,
    color: colors.slate900,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: fonts.semiBold,
    color: colors.slate600,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  settingsInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.slate900,
    backgroundColor: colors.slate50,
  },
  testBtn: {
    marginLeft: 8,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: colors.lime400,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  testBtnText: {
    color: colors.slate950,
    fontWeight: "700",
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  presetsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  presetBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  presetText: {
    fontSize: 11,
    color: colors.slate600,
    fontFamily: fonts.semiBold,
    fontWeight: "600",
  },
  settingsHelp: {
    fontSize: 11,
    color: colors.slate600,
    fontFamily: fonts.regular,
    marginTop: 6,
    lineHeight: 15,
  },
});
