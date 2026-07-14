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
import { User as UserIcon, Lock, Mail, Calendar, FileText } from "lucide-react-native";
import { User, TipoUser } from "../types";
import { convertToISO, convertToBrazilian } from "../utils/date";
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
    dateNasc: string;
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
  const [formDateNasc, setFormDateNasc] = useState(""); // DD/MM/AAAA
  const [formCfp, setFormCfp] = useState(""); // CPF
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (editingUser) {
        setFormName(editingUser.name);
        setFormEmail(editingUser.email);
        setFormPassword("******"); // placeholder for existing password
        setFormType(editingUser.type);
        setFormDateNasc(convertToBrazilian(editingUser.dateNasc));
        setFormCfp(editingUser.cfp);
      } else {
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormType("CUSTOMER");
        setFormDateNasc("");
        setFormCfp("");
      }
      setDateError(null);
    }
  }, [visible, editingUser]);

  // Date input formatter
  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    
    setFormDateNasc(formatted);

    if (cleaned.length === 0) {
      setDateError(null);
      return;
    }

    if (cleaned.length >= 2) {
      const day = parseInt(cleaned.slice(0, 2), 10);
      if (day < 1 || day > 31) {
        setDateError("Dia inválido (deve ser entre 01 e 31)");
        return;
      }
    }

    if (cleaned.length >= 4) {
      const month = parseInt(cleaned.slice(2, 4), 10);
      if (month < 1 || month > 12) {
        setDateError("Mês inválido (deve ser entre 01 e 12)");
        return;
      }
    }

    if (cleaned.length === 8) {
      const day = parseInt(cleaned.slice(0, 2), 10);
      const month = parseInt(cleaned.slice(2, 4), 10);
      const year = parseInt(cleaned.slice(4, 8), 10);
      
      const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        monthLengths[1] = 29;
      }

      if (day > monthLengths[month - 1]) {
        setDateError(`Mês ${month} tem no máximo ${monthLengths[month - 1]} dias`);
        return;
      }

      const currentYear = new Date().getFullYear();
      if (year < currentYear - 120) {
        setDateError("Ano de nascimento muito antigo");
        return;
      }
      if (year > currentYear) {
        setDateError("O ano não pode ser no futuro");
        return;
      }
    }

    setDateError(null);
  };

  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim() || !formDateNasc.trim() || !formCfp.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    if (!formEmail.includes("@")) {
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido.");
      return;
    }

    const dateCleaned = formDateNasc.replace(/\D/g, "");
    if (dateCleaned.length !== 8) {
      setDateError("Digite a data completa (DD/MM/AAAA)");
      Alert.alert("Data incompleta", "Preencha a data de nascimento completa.");
      return;
    }

    if (dateError) {
      Alert.alert("Data inválida", "Corrija os erros na data de nascimento.");
      return;
    }

    onSave({
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword === "******" && editingUser ? undefined : formPassword,
      type: formType,
      dateNasc: convertToISO(formDateNasc),
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
              <Text style={styles.formLabel}>Data de Nascimento (DD/MM/AAAA)</Text>
              <View style={[styles.inputWrapper, dateError ? styles.inputWrapperError : null]}>
                <Calendar size={16} color={colors.slate600} style={styles.inputIcon} />
                <TextInput
                  style={styles.formInput}
                  value={formDateNasc}
                  onChangeText={handleDateChange}
                  placeholder="Ex: 20/05/2000"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
              {dateError && <Text style={styles.errorText}>{dateError}</Text>}
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
