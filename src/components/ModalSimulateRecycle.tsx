import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Info } from "lucide-react-native";
import { colors } from "../utils/theme";

interface ModalSimulateRecycleProps {
  visible: boolean;
  onClose: () => void;
  onSimulate: (material: string, weight: string) => void;
}

export default function ModalSimulateRecycle({
  visible,
  onClose,
  onSimulate,
}: ModalSimulateRecycleProps) {
  const [simulatedMaterial, setSimulatedMaterial] = useState("PLASTIC");
  const [simulatedWeight, setSimulatedWeight] = useState("");

  useEffect(() => {
    if (visible) {
      setSimulatedMaterial("PLASTIC");
      setSimulatedWeight("");
    }
  }, [visible]);

  const handleSimulate = () => {
    if (!simulatedWeight.trim()) {
      Alert.alert("Aviso", "Por favor, insira o peso.");
      return;
    }
    onSimulate(simulatedMaterial, simulatedWeight);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Simular Descarte Reciclável</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            <Text style={styles.simulationPromptText}>
              Escolha o material e o peso depositado para ganhar EcoCoins de simulação:
            </Text>

            {/* Material Choice */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Material Reciclável</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    simulatedMaterial === "PLASTIC" ? styles.typeOptionSelected : null,
                  ]}
                  onPress={() => setSimulatedMaterial("PLASTIC")}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      simulatedMaterial === "PLASTIC" ? styles.typeOptionTextSelected : null,
                    ]}
                  >
                    Plástico (10 EC/kg)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    simulatedMaterial === "METAL" ? styles.typeOptionSelected : null,
                  ]}
                  onPress={() => setSimulatedMaterial("METAL")}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      simulatedMaterial === "METAL" ? styles.typeOptionTextSelected : null,
                    ]}
                  >
                    Metal (25 EC/kg)
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.typeSelectorRow, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    simulatedMaterial === "PAPER" ? styles.typeOptionSelected : null,
                  ]}
                  onPress={() => setSimulatedMaterial("PAPER")}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      simulatedMaterial === "PAPER" ? styles.typeOptionTextSelected : null,
                    ]}
                  >
                    Papel/Papelão (5 EC/kg)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weight input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Peso Estimado (em Quilogramas / kg)</Text>
              <View style={styles.inputWrapper}>
                <Info size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={simulatedWeight}
                  onChangeText={setSimulatedWeight}
                  placeholder="Ex: 2.5"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalSubmitRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={onClose}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSimulate}
              >
                <Text style={styles.modalBtnSaveText}>Registrar Entrega</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerSpacing} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.slate900,
  },
  closeModalButton: {
    padding: 6,
  },
  closeModalText: {
    color: colors.slate600,
    fontWeight: "600",
    fontSize: 14,
  },
  modalForm: {
    paddingVertical: 16,
  },
  simulationPromptText: {
    fontSize: 13,
    color: colors.slate600,
    lineHeight: 18,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.slate700,
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: "row",
  },
  typeOption: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  typeOptionSelected: {
    borderColor: colors.lime500,
    backgroundColor: colors.lime100,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.slate600,
  },
  typeOptionTextSelected: {
    color: colors.lime800,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 10,
    backgroundColor: colors.slate50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  formInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: colors.slate900,
  },
  modalSubmitRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 20,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: colors.slate100,
    marginRight: 8,
  },
  modalBtnCancelText: {
    color: colors.slate600,
    fontWeight: "700",
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: colors.lime400,
    marginLeft: 8,
  },
  modalBtnSaveText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 14,
  },
  footerSpacing: {
    height: 50,
  },
});
