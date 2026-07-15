import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Coins } from "lucide-react-native";
import { colors } from "../utils/theme";

interface ModalAmountTransactionProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (amount: string) => void;
  loading: boolean;
}

export default function ModalAmountTransaction({
  visible,
  onClose,
  title,
  description,
  submitLabel,
  onSubmit,
  loading,
}: ModalAmountTransactionProps) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (visible) {
      setAmount("");
    }
  }, [visible]);

  const handleConfirm = () => {
    const cleanedAmount = amount.trim().replace(",", ".");
    const amountNum = parseFloat(cleanedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Valor inválido", "Por favor, insira um valor positivo.");
      return;
    }
    onSubmit(cleanedAmount);
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
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton} disabled={loading}>
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            <Text style={styles.promptText}>{description}</Text>

            {/* Amount input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Valor da Transação (EC)</Text>
              <View style={styles.inputWrapper}>
                <Coins size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Ex: 50.00"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.modalSubmitRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.slate950} />
                ) : (
                  <Text style={styles.modalBtnSaveText}>{submitLabel}</Text>
                )}
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
  promptText: {
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
