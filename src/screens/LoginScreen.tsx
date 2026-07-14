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
import { Leaf, Mail, Lock } from "lucide-react-native";
import { User } from "../types";
import { colors } from "../utils/theme";

interface LoginScreenProps {
  loginEmail: string;
  setLoginEmail: (email: string) => void;
  loginPassword: string;
  setLoginPassword: (pass: string) => void;
  onLogin: () => void;
  onNavigateToRegister: () => void;
  users: User[];
  loading: boolean;
}

export default function LoginScreen({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  onLogin,
  onNavigateToRegister,
  users,
  loading,
}: LoginScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.authHeaderBlock}>
        <Leaf size={60} color={colors.lime500} style={styles.authIcon} />
        <Text style={styles.authLogoText}>
          Eco<Text style={styles.authLogoTextHighlight}>Ciclo</Text>
        </Text>
        <Text style={styles.authSubtitle}>Descarte inteligente. Retorno real.</Text>
      </View>

      <View style={styles.authCard}>
        <Text style={styles.authCardTitle}>Acessar Minha Conta</Text>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>E-mail</Text>
          <View style={styles.inputWrapper}>
            <Mail size={16} color={colors.slate600} style={styles.inputIcon} />
            <TextInput
              style={styles.formInput}
              value={loginEmail}
              onChangeText={setLoginEmail}
              placeholder="Ex: joao@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Senha</Text>
          <View style={styles.inputWrapper}>
            <Lock size={16} color={colors.slate600} style={styles.inputIcon} />
            <TextInput
              style={styles.formInput}
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="Insira sua senha"
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.authSubmitBtn} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.slate950} />
          ) : (
            <Text style={styles.authSubmitBtnText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.authSwitchRow}>
          <Text style={styles.authSwitchText}>Ainda não tem conta?</Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.authSwitchLink}>Cadastre-se aqui</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Testing Shortcuts */}
      <View style={styles.presetsPanel}>
        <Text style={styles.sectionTitle}>Atalhos de Teste Rápido</Text>
        <Text style={styles.settingsHelp}>
          Selecione uma conta cadastrada abaixo para preencher automaticamente:
        </Text>
        {users.length === 0 ? (
          <Text style={styles.noUsersPresetText}>
            Nenhum usuário no banco. Vá em "Cadastre-se aqui" para criar o primeiro!
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsList}>
            {users.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={styles.presetUserBadge}
                onPress={() => {
                  setLoginEmail(u.email);
                  setLoginPassword(u.password || "123456");
                }}
              >
                <Text style={styles.presetUserBadgeText} numberOfLines={1}>
                  {u.name.split(" ")[0]} ({u.type === "EMPLOYEE" ? "Func" : "Cli"})
                </Text>
                <Text style={styles.presetUserBadgeSub}>{u.email}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
  authLogoTextHighlight: {
    color: colors.lime500,
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
  presetsPanel: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 12,
  },
  settingsHelp: {
    fontSize: 11,
    color: colors.slate600,
    marginTop: 6,
    lineHeight: 15,
  },
  noUsersPresetText: {
    fontSize: 11,
    color: colors.slate600,
    fontStyle: "italic",
    marginTop: 8,
  },
  presetsList: {
    marginTop: 8,
    flexDirection: "row",
  },
  presetUserBadge: {
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate300,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 110,
  },
  presetUserBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.slate900,
  },
  presetUserBadgeSub: {
    fontSize: 9,
    color: colors.slate600,
    marginTop: 2,
  },
});
