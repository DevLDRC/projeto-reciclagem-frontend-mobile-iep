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
import { User as UserIcon, Lock, Mail, FileText } from "lucide-react-native";
import { User, TipoUser } from "../types";
import { colors } from "../utils/theme";

interface ModalUserFormProps {
  visible: boolean;
  onClose: () => void;
  editingUser: User | null;
  onSave: (userData: {
    name: string;
    email: string;
    password?: string;
    type: TipoUser;
    cfp: string;
  }) => void;
  loading: boolean;
}

export default function ModalUserForm({
  visible,
  onClose,
  editingUser,
  onSave,
  loading,
}: ModalUserFormProps) {
  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formType, setFormType] = useState<TipoUser>("CUSTOMER");
  const [formCfp, setFormCfp] = useState(""); // CPF

  useEffect(() => {
    if (visible) {
      if (editingUser) {
        setFormName(editingUser.name);
        setFormEmail(editingUser.email);
        setFormPassword("******"); // placeholder for existing password
        setFormType(editingUser.type);
        setFormCfp(editingUser.cfp);
      } else {
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormType("CUSTOMER");
        setFormCfp("");
      }
    }
  }, [visible, editingUser]);


  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim() || !formCfp.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    if (!formEmail.includes("@")) {
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido.");
      return;
    }

    onSave({
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword === "******" && editingUser ? undefined : formPassword,
      type: formType,
      cfp: formCfp.replace(/\D/g, ""),
    });
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
            <Text style={styles.modalTitle}>
              {editingUser ? "Editar Integrante" : "Novo Integrante"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nome Completo</Text>
              <View style={styles.inputWrapper}>
                <UserIcon size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Ex: João da Silva"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="Ex: joao@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={formPassword}
                  onChangeText={setFormPassword}
                  placeholder={editingUser ? "Preencha para alterar" : "Senha de acesso"}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Integrante</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formType === "CUSTOMER" ? styles.typeOptionSelected : null,
                  ]}
                  onPress={() => setFormType("CUSTOMER")}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formType === "CUSTOMER" ? styles.typeOptionTextSelected : null,
                    ]}
                  >
                    Cliente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    formType === "EMPLOYEE" ? styles.typeOptionSelected : null,
                  ]}
                  onPress={() => setFormType("EMPLOYEE")}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formType === "EMPLOYEE" ? styles.typeOptionTextSelected : null,
                    ]}
                  >
                    Funcionário
                  </Text>
                </TouchableOpacity>
              </View>
            </View>



            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>CPF (Somente números)</Text>
              <View style={styles.inputWrapper}>
                <FileText size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={formCfp}
                  onChangeText={setFormCfp}
                  placeholder="Ex: 12345678901"
                  keyboardType="numeric"
                  maxLength={11}
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
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.slate950} />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Salvar</Text>
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
  inputWrapperError: {
    borderColor: colors.red500,
  },
  errorText: {
    color: colors.red500,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 4,
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
