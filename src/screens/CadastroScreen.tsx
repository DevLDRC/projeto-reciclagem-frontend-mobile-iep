import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Leaf, User as UserIcon, Lock, Mail, FileText } from "lucide-react-native";
import { TipoUser } from "../types";
import { colors } from "../utils/theme";

interface CadastroScreenProps {
  formName: string;
  setFormName: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formPassword: string;
  setFormPassword: (val: string) => void;
  formType: TipoUser;
  setFormType: (val: TipoUser) => void;
  formCfp: string;
  setFormCfp: (val: string) => void;
  onRegister: () => void;
  onNavigateToLogin: () => void;
  loading: boolean;
}

export default function CadastroScreen({
  formName,
  setFormName,
  formEmail,
  setFormEmail,
  formPassword,
  setFormPassword,
  formType,
  setFormType,
  formCfp,
  setFormCfp,
  onRegister,
  onNavigateToLogin,
  loading,
}: CadastroScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.authHeaderBlock}>
        <Leaf size={40} color={colors.lime500} style={styles.authIcon} />
        <Text style={styles.authLogoText}>EcoCiclo</Text>
        <Text style={styles.authSubtitle}>Cadastre-se para começar a pontuar!</Text>
      </View>

      <View style={styles.authCard}>
        <Text style={styles.authCardTitle}>Criar Minha Conta</Text>

        {/* Nome */}
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

        {/* Email */}
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

        {/* Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.inputWrapper}>
            <Lock size={16} color={colors.slate600} style={styles.inputIcon} />
            <TextInput
              style={styles.formInput}
              value={formPassword}
              onChangeText={setFormPassword}
              placeholder="Escolha uma senha"
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Role selection */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Tipo de Conta</Text>
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



        {/* CPF */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>CPF (Apenas números)</Text>
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

        <TouchableOpacity style={styles.authSubmitBtn} onPress={onRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.slate950} />
          ) : (
            <Text style={styles.authSubmitBtnText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.authSwitchRow}>
          <Text style={styles.authSwitchText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.authSwitchLink}>Entrar aqui</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    padding: 24,
    justifyContent: "center",
    minHeight: "85%",
  },
  authHeaderBlock: {
    alignItems: "center",
    marginBottom: 32,
  },
  authIcon: {
    marginBottom: 10,
  },
  authLogoText: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.slate900,
    letterSpacing: -1,
  },
  authSubtitle: {
    fontSize: 14,
    color: colors.slate600,
    marginTop: 4,
    fontWeight: "500",
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.slate200,
    ...Platform.select({
      ios: {
        shadowColor: colors.slate900,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  authCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.slate600,
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
  authSubmitBtn: {
    height: 52,
    backgroundColor: colors.lime400,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  authSubmitBtnText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 16,
  },
  authSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  authSwitchText: {
    fontSize: 13,
    color: colors.slate600,
  },
  authSwitchLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.lime500,
    marginLeft: 6,
  },
});
