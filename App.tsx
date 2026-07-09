import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Leaf,
  Recycle,
  Trash2,
  Edit2,
  Wifi,
  WifiOff,
  RefreshCw,
  Calendar,
  Mail,
  FileText,
  CheckCircle2,
  Plus,
  Lock,
  User as UserIcon,
  Sparkles,
  Settings,
  AlertTriangle,
  LogOut,
  Coins,
  Info,
} from "lucide-react-native";

// Types matching Backend DTOs & Models
type TipoUser = "CUSTOMER" | "EMPLOYEE";
type Screen = "LOGIN" | "CADASTRO" | "HOME";

interface Wallet {
  id: number;
  amount: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  active: boolean;
  type: TipoUser;
  dateNasc: string; // ISO string
  cfp: string;
  wallet?: Wallet | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function App() {
  // Navigation & User State
  const [currentScreen, setCurrentScreen] = useState<Screen>("LOGIN");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  
  // API URL State
  const [backendUrl, setBackendUrl] = useState("http://10.0.2.2:8080");
  const [showSettings, setShowSettings] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connected" | "checking">("disconnected");
  
  // Custom Alert Banner State
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" | "warning" } | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Cadastro/Edit Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formType, setFormType] = useState<TipoUser>("CUSTOMER");
  const [formDateNasc, setFormDateNasc] = useState(""); // DD/MM/AAAA
  const [formCfp, setFormCfp] = useState(""); // CPF
  const [dateError, setDateError] = useState<string | null>(null);
  
  // Manager Panel Form Modal (for Employees editing other users)
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Client Simulation State (Local-only EcoCoins simulator)
  const [localEcoCoinBonus, setLocalEcoCoinBonus] = useState(0);
  const [simulationModalVisible, setSimulationModalVisible] = useState(false);
  const [simulatedMaterial, setSimulatedMaterial] = useState("PLASTIC");
  const [simulatedWeight, setSimulatedWeight] = useState("");

  // Visual alert helper
  const triggerAlert = (text: string, type: "success" | "error" | "warning" = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  // Helper date conversions
  const convertToISO = (dateStr: string): string => {
    const parts = dateStr.trim().split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}T00:00:00-03:00`;
    }
    return dateStr;
  };

  const convertToBrazilian = (isoStr: string): string => {
    if (!isoStr) return "";
    try {
      const datePart = isoStr.split("T")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) {
      // fallback
    }
    return isoStr;
  };

  // Fetch all users to sync local view & validate logins
  const fetchUsers = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setConnectionStatus("checking");
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${backendUrl.trim()}/users`, {
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setConnectionStatus("connected");
        
        // Refresh logged in user if they are already in state
        if (loggedInUser) {
          const updatedSelf = data.find((u: User) => u.id === loggedInUser.id);
          if (updatedSelf) {
            setLoggedInUser(updatedSelf);
          }
        }
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      if (!quiet) {
        triggerAlert("Sem conexão com o backend. Verifique a URL nas configurações.", "error");
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  // Run initial fetch on mount/backend url change
  useEffect(() => {
    fetchUsers(true);
  }, [backendUrl]);

  // Refresh data trigger
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers(true);
    setRefreshing(false);
  }, [backendUrl, loggedInUser]);

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

  // Perform Login Action
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      triggerAlert("Por favor, preencha todos os campos de login.", "warning");
      return;
    }

    setLoading(true);
    setConnectionStatus("checking");

    try {
      // Fetch users list to validate login
      const response = await fetch(`${backendUrl}/users`);
      if (response.ok) {
        const usersList: User[] = await response.json();
        setUsers(usersList);
        setConnectionStatus("connected");

        // Simple auth matching email & password
        const userFound = usersList.find(
          (u) => 
            u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim() && 
            u.password === loginPassword
        );

        if (userFound) {
          setLoggedInUser(userFound);
          setLocalEcoCoinBonus(0); // reset simulated bonus
          setLoginPassword(""); // clear password input
          triggerAlert(`Olá, ${userFound.name}! Login realizado com sucesso.`, "success");
          setCurrentScreen("HOME");
        } else {
          triggerAlert("E-mail ou senha incorretos.", "error");
        }
      } else {
        throw new Error("Erro de conexão");
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      triggerAlert("Não foi possível conectar ao servidor backend para autenticar.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Register New User
  const handleRegister = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim() || !formDateNasc.trim() || !formCfp.trim()) {
      triggerAlert("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    if (!formEmail.includes("@")) {
      triggerAlert("Por favor, insira um e-mail válido.", "warning");
      return;
    }

    const dateCleaned = formDateNasc.replace(/\D/g, "");
    if (dateCleaned.length !== 8) {
      setDateError("Digite a data completa (DD/MM/AAAA)");
      triggerAlert("Data de nascimento incompleta.", "warning");
      return;
    }

    if (dateError) {
      triggerAlert("Corrija os erros na data de nascimento.", "warning");
      return;
    }

    const userData = {
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword,
      type: formType,
      dateNasc: convertToISO(formDateNasc),
      cfp: formCfp.replace(/\D/g, ""),
    };

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        triggerAlert("Conta criada! Preencha a senha para entrar.", "success");
        setLoginEmail(formEmail.trim()); // pre-fill login screen email
        setCurrentScreen("LOGIN");
        
        // Reset cadastro form
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormType("CUSTOMER");
        setFormDateNasc("");
        setFormCfp("");
        setDateError(null);
      } else {
        const errorText = await response.text();
        triggerAlert(`Erro no cadastro: ${errorText || "Operação falhou"}`, "error");
      }
    } catch (error) {
      triggerAlert("Falha na comunicação com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logout Action
  const handleLogout = () => {
    setLoggedInUser(null);
    setLocalEcoCoinBonus(0);
    setCurrentScreen("LOGIN");
    triggerAlert("Sessão encerrada com sucesso.", "success");
  };

  // Create Wallet for Logged In User or Managed User
  const handleCreateWallet = async (userId: number, isSelf = false) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/wallet/user/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        triggerAlert(
          isSelf 
            ? "Sua carteira de EcoCoins foi ativada!" 
            : "Carteira ativada com sucesso para o integrante!",
          "success"
        );
        
        // Reload details to get wallet object
        await fetchUsers(true);
      } else {
        const errorText = await response.text();
        triggerAlert(`Erro: ${errorText || "Não foi possível ativar carteira."}`, "error");
      }
    } catch (error) {
      triggerAlert("Falha ao comunicar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete User (Employee Only)
  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Excluir Integrante",
      `Deseja realmente remover o usuário ${user.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${backendUrl}/users/${user.id}`, {
                method: "DELETE",
              });
              if (response.status === 204 || response.ok) {
                triggerAlert("Integrante excluído com sucesso!", "success");
                fetchUsers(true);
              } else {
                triggerAlert("Erro ao excluir integrante do banco.", "error");
              }
            } catch (error) {
              triggerAlert("Falha de rede ao tentar excluir.", "error");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Open Modal for Employee to Edit or Add a User
  const openManagerModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormName(user.name);
      setFormEmail(user.email);
      setFormPassword(user.password || "******");
      setFormType(user.type);
      setFormDateNasc(convertToBrazilian(user.dateNasc));
      setFormCfp(user.cfp);
    } else {
      setEditingUser(null);
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormType("CUSTOMER");
      setFormDateNasc("");
      setFormCfp("");
    }
    setDateError(null);
    setManagerModalVisible(true);
  };

  // Save changes by Employee (Add or Edit User)
  const handleManagerSaveUser = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim() || !formDateNasc.trim() || !formCfp.trim()) {
      triggerAlert("Todos os campos são obrigatórios.", "warning");
      return;
    }

    const dateCleaned = formDateNasc.replace(/\D/g, "");
    if (dateCleaned.length !== 8) {
      setDateError("Digite a data completa (DD/MM/AAAA)");
      triggerAlert("Data de nascimento incompleta.", "warning");
      return;
    }

    if (dateError) {
      triggerAlert("Corrija a data de nascimento.", "warning");
      return;
    }

    const userData = {
      name: formName.trim(),
      email: formEmail.trim(),
      password: formPassword === "******" && editingUser ? editingUser.password : formPassword,
      type: formType,
      dateNasc: convertToISO(formDateNasc),
      cfp: formCfp.replace(/\D/g, ""),
    };

    setLoading(true);
    try {
      let response;
      if (editingUser) {
        response = await fetch(`${backendUrl}/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } else {
        response = await fetch(`${backendUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      }

      if (response.ok) {
        triggerAlert(
          editingUser ? "Integrante atualizado com sucesso!" : "Novo integrante cadastrado!",
          "success"
        );
        setManagerModalVisible(false);
        fetchUsers(true);
      } else {
        const errorText = await response.text();
        triggerAlert(`Erro: ${errorText || "Operação falhou."}`, "error");
      }
    } catch (error) {
      triggerAlert("Falha na comunicação com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Simulated Recycling Deposit for Customers
  const handleSimulateDeposit = () => {
    const weightNum = parseFloat(simulatedWeight.trim().replace(",", "."));
    if (isNaN(weightNum) || weightNum <= 0) {
      triggerAlert("Por favor, insira um peso válido.", "warning");
      return;
    }

    if (!loggedInUser?.wallet) {
      triggerAlert("Você precisa ativar sua carteira antes de simular descartes!", "warning");
      setSimulationModalVisible(false);
      return;
    }

    // Multiply EcoCoins based on material type
    let coinReward = 0;
    let materialName = "";
    if (simulatedMaterial === "PLASTIC") {
      coinReward = weightNum * 10;
      materialName = "Plástico";
    } else if (simulatedMaterial === "METAL") {
      coinReward = weightNum * 25;
      materialName = "Latas/Metal";
    } else {
      coinReward = weightNum * 5;
      materialName = "Papel/Papelão";
    }

    const roundedReward = Math.round(coinReward);
    setLocalEcoCoinBonus(prev => prev + roundedReward);
    setSimulationModalVisible(false);
    setSimulatedWeight("");
    triggerAlert(`Sucesso! Entrega de ${weightNum}kg de ${materialName} simulada. +${roundedReward} EcoCoins creditadas na sessão!`, "success");
  };

  // Total EcoCoins display amount (incorporating local simulated session gains)
  const getDisplayAmount = (user: User | null) => {
    if (!user || !user.wallet) return "0.00";
    return (user.wallet.amount + localEcoCoinBonus).toFixed(2);
  };

  // Render 1: LOGIN SCREEN
  const renderLoginScreen = () => {
    return (
      <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeaderBlock}>
          <Leaf size={60} color="#84cc16" style={styles.authIcon} />
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
              <Mail size={16} color="#64748b" style={styles.inputIcon} />
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
              <Lock size={16} color="#64748b" style={styles.inputIcon} />
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

          <TouchableOpacity style={styles.authSubmitBtn} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.authSubmitBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchText}>Ainda não tem conta?</Text>
            <TouchableOpacity onPress={() => setCurrentScreen("CADASTRO")}>
              <Text style={styles.authSwitchLink}>Cadastre-se aqui</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Testing Shortcuts (Very helpful since database might be empty or pre-loaded) */}
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
  };

  // Render 2: CADASTRO SCREEN
  const renderCadastroScreen = () => {
    return (
      <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeaderBlock}>
          <Leaf size={40} color="#84cc16" style={styles.authIcon} />
          <Text style={styles.authLogoText}>EcoCiclo</Text>
          <Text style={styles.authSubtitle}>Cadastre-se para começar a pontuar!</Text>
        </View>

        <View style={styles.authCard}>
          <Text style={styles.authCardTitle}>Criar Minha Conta</Text>

          {/* Nome */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nome Completo</Text>
            <View style={styles.inputWrapper}>
              <UserIcon size={16} color="#64748b" style={styles.inputIcon} />
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
              <Mail size={16} color="#64748b" style={styles.inputIcon} />
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
              <Lock size={16} color="#64748b" style={styles.inputIcon} />
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

          {/* Birth date */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Data de Nascimento (DD/MM/AAAA)</Text>
            <View style={[styles.inputWrapper, dateError ? styles.inputWrapperError : null]}>
              <Calendar size={16} color="#64748b" style={styles.inputIcon} />
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

          {/* CPF */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>CPF (Apenas números)</Text>
            <View style={styles.inputWrapper}>
              <FileText size={16} color="#64748b" style={styles.inputIcon} />
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

          <TouchableOpacity style={styles.authSubmitBtn} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.authSubmitBtnText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.authSwitchRow}>
            <Text style={styles.authSwitchText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => setCurrentScreen("LOGIN")}>
              <Text style={styles.authSwitchLink}>Entrar aqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Render 3: HOME SCREEN
  const renderHomeScreen = () => {
    if (!loggedInUser) return null;

    return (
      <View style={styles.homeContainer}>
        {/* Header containing user profile + EcoCoin Balance */}
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderTop}>
            <View style={styles.headerLogoContainer}>
              <Leaf size={20} color="#84cc16" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>
                Eco<Text style={styles.headerTitleHighlight}>Ciclo</Text>
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.connectionIndicator, styles[connectionStatus]]}
                onPress={() => fetchUsers(false)}
              >
                {connectionStatus === "connected" ? (
                  <Wifi size={14} color="#475569" />
                ) : connectionStatus === "checking" ? (
                  <ActivityIndicator size="small" color="#84cc16" />
                ) : (
                  <WifiOff size={14} color="#ef4444" />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Welcome and Role Badge */}
          <View style={styles.homeHeaderWelcomeRow}>
            <View>
              <Text style={styles.welcomeUserText}>Olá, {loggedInUser.name}</Text>
              <Text style={styles.welcomeSubText}>{loggedInUser.email}</Text>
            </View>
            <View style={[
              styles.typeTag,
              loggedInUser.type === "EMPLOYEE" ? styles.typeTagEmployee : styles.typeTagCustomer
            ]}>
              <Text style={[
                styles.typeTagText,
                loggedInUser.type === "EMPLOYEE" ? styles.typeTagTextEmployee : styles.typeTagTextCustomer
              ]}>
                {loggedInUser.type === "EMPLOYEE" ? "Funcionário" : "Cliente"}
              </Text>
            </View>
          </View>

          {/* EcoCoins Header Block */}
          <View style={styles.ecoCoinHeaderCard}>
            {loggedInUser.wallet ? (
              <View style={styles.ecoCoinContent}>
                <View style={styles.ecoCoinLabelBlock}>
                  <Coins size={22} color="#a3e635" style={styles.ecoCoinIcon} />
                  <Text style={styles.ecoCoinLabelText}>Saldo EcoCoins</Text>
                </View>
                <Text style={styles.ecoCoinBalanceText}>
                  {getDisplayAmount(loggedInUser)} <Text style={styles.ecoCoinUnit}>EC</Text>
                </Text>
              </View>
            ) : (
              <View style={styles.ecoCoinInactiveBlock}>
                <Text style={styles.ecoCoinPromptText}>Você ainda não ativou sua carteira de EcoCoins.</Text>
                <TouchableOpacity
                  style={styles.activateEcoCoinBtn}
                  onPress={() => handleCreateWallet(loggedInUser.id, true)}
                >
                  <Text style={styles.activateEcoCoinBtnText}>Ativar Carteira</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Home Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#84cc16"]}
            />
          }
        >
          {/* VISUAL 3.1: CUSTOMER VIEW */}
          {loggedInUser.type === "CUSTOMER" ? (
            <View style={styles.portalContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meu Portal de Reciclagem</Text>
              </View>

              {/* simulated statistics */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Descartes</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>24.5 kg</Text>
                  <Text style={styles.statLabel}>Total Coletado</Text>
                </View>
              </View>

              {/* Simulation Call Card */}
              <View style={styles.simulationIntroCard}>
                <Sparkles size={28} color="#84cc16" style={styles.sparkIcon} />
                <Text style={styles.simulationTitle}>Ganhe EcoCoins Simulações</Text>
                <Text style={styles.simulationText}>
                  Como o backend inicia com saldo zero, criamos este painel interativo para você depositar materiais e simular o recebimento de **EcoCoins** na hora!
                </Text>
                <TouchableOpacity
                  style={styles.simulationBtn}
                  onPress={() => setSimulationModalVisible(true)}
                >
                  <Text style={styles.simulationBtnText}>Simular Entrega de Recicláveis</Text>
                </TouchableOpacity>
              </View>

              {/* Personal Information details */}
              <View style={styles.profileDetailsCard}>
                <Text style={styles.profileCardTitle}>Meus Dados Cadastrados</Text>
                <View style={styles.profileDetailRow}>
                  <FileText size={14} color="#64748b" style={styles.profileDetailIcon} />
                  <Text style={styles.profileDetailText}>CPF: {loggedInUser.cfp}</Text>
                </View>
                <View style={styles.profileDetailRow}>
                  <Calendar size={14} color="#64748b" style={styles.profileDetailIcon} />
                  <Text style={styles.profileDetailText}>
                    Nascimento: {convertToBrazilian(loggedInUser.dateNasc)}
                  </Text>
                </View>
                <Text style={styles.profileTipText}>
                  * Dica: Se quiser gerenciar outros usuários ou excluir cadastros, crie uma conta ou acesse como "Funcionário".
                </Text>
              </View>
            </View>
          ) : (
            // VISUAL 3.2: EMPLOYEE VIEW (Manager Dashboard)
            <View style={styles.portalContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dashboard de Gestão de Integrantes</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => openManagerModal(null)}>
                  <Plus size={16} color="#020617" />
                  <Text style={styles.addBtnText}>Novo</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.managerIntroText}>
                Como Funcionário da Cooperativa, você pode cadastrar e editar dados de clientes e outros funcionários, além de ativar a carteira de EcoCoins dos usuários.
              </Text>

              {users.length === 0 ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#84cc16" />
                  <Text style={styles.loadingText}>Atualizando lista...</Text>
                </View>
              ) : (
                users.map((user) => (
                  <View key={user.id} style={styles.userCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.userMainInfo}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                      
                      <View style={[
                        styles.typeTag,
                        user.type === "EMPLOYEE" ? styles.typeTagEmployee : styles.typeTagCustomer
                      ]}>
                        <Text style={[
                          styles.typeTagText,
                          user.type === "EMPLOYEE" ? styles.typeTagTextEmployee : styles.typeTagTextCustomer
                        ]}>
                          {user.type === "EMPLOYEE" ? "Funcionário" : "Cliente"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <FileText size={12} color="#64748b" style={styles.detailIcon} />
                        <Text style={styles.detailText}>CPF: {user.cfp}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Calendar size={12} color="#64748b" style={styles.detailIcon} />
                        <Text style={styles.detailText}>
                          Nascimento: {convertToBrazilian(user.dateNasc)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.walletContainer}>
                      {user.wallet ? (
                        <View style={styles.activeWallet}>
                          <View style={styles.walletLeft}>
                            <Sparkles size={14} color="#84cc16" style={styles.sparkleIcon} />
                            <Text style={styles.walletLabel}>EcoCoins</Text>
                          </View>
                          {/* Note: Managed users display their base backend amount */}
                          <Text style={styles.walletBalance}>
                            {user.wallet.amount.toFixed(2)} EC
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.inactiveWallet}>
                          <Text style={styles.walletPrompt}>Sem carteira ativada</Text>
                          <TouchableOpacity
                            style={styles.activateWalletBtn}
                            onPress={() => handleCreateWallet(user.id, false)}
                          >
                            <Text style={styles.activateWalletText}>Ativar Carteira</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* Employee Actions on other Users */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openManagerModal(user)}
                      >
                        <Edit2 size={14} color="#475569" />
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteUser(user)}
                        disabled={user.id === loggedInUser.id} // prevent self deletion
                      >
                        <Trash2 size={14} color="#ef4444" />
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                          Excluir
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          <View style={styles.footerSpacing} />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header bar only visible on Login & Cadastro screens (Home has its own customized header) */}
      {currentScreen !== "HOME" && (
        <View style={styles.header}>
          <View style={styles.headerLogoContainer}>
            <Leaf size={24} color="#84cc16" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>
              Eco<Text style={styles.headerTitleHighlight}>Ciclo</Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.connectionIndicator, styles[connectionStatus]]}
              onPress={() => fetchUsers(false)}
            >
              {connectionStatus === "connected" ? (
                <Wifi size={16} color="#475569" />
              ) : connectionStatus === "checking" ? (
                <ActivityIndicator size="small" color="#84cc16" />
              ) : (
                <WifiOff size={16} color="#ef4444" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Global alert message banner */}
      {alertMessage && (
        <View style={[styles.alertBanner, styles[`alert_${alertMessage.type}`]]}>
          {alertMessage.type === "success" && <CheckCircle2 size={16} color="#15803d" />}
          {alertMessage.type === "error" && <AlertTriangle size={16} color="#b91c1c" />}
          {alertMessage.type === "warning" && <AlertTriangle size={16} color="#a16207" />}
          <Text style={[styles.alertText, styles[`alertText_${alertMessage.type}`]]}>
            {alertMessage.text}
          </Text>
        </View>
      )}

      {/* Settings configuration Panel */}
      {showSettings && currentScreen !== "HOME" && (
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
            <TouchableOpacity style={styles.testBtn} onPress={() => fetchUsers(false)}>
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
      )}

      {/* Screen Router */}
      {currentScreen === "LOGIN" && renderLoginScreen()}
      {currentScreen === "CADASTRO" && renderCadastroScreen()}
      {currentScreen === "HOME" && renderHomeScreen()}

      {/* MODAL: Employee Management (Add/Edit Integrantes) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={managerModalVisible}
        onRequestClose={() => setManagerModalVisible(false)}
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
              <TouchableOpacity
                onPress={() => setManagerModalVisible(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nome Completo</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color="#64748b" style={styles.inputIcon} />
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
                  <Mail size={16} color="#64748b" style={styles.inputIcon} />
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
                  <Lock size={16} color="#64748b" style={styles.inputIcon} />
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
                  <Calendar size={16} color="#64748b" style={styles.inputIcon} />
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
                  <FileText size={16} color="#64748b" style={styles.inputIcon} />
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
                  onPress={() => setManagerModalVisible(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={handleManagerSaveUser}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#020617" />
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

      {/* MODAL: Customer Recycling Simulation (Entrega de Resíduos) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={simulationModalVisible}
        onRequestClose={() => setSimulationModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Simular Descarte Reciclável</Text>
              <TouchableOpacity
                onPress={() => setSimulationModalVisible(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalText}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
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
                  <Info size={16} color="#64748b" style={styles.inputIcon} />
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
                  onPress={() => setSimulationModalVisible(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={handleSimulateDeposit}
                >
                  <Text style={styles.modalBtnSaveText}>Registrar Entrega</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerSpacing} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// Styling system incorporating EcoCiclo Slate and Lime palette
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // slate-50
  },
  
  // Header login & register
  header: {
    height: 70,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerTitleHighlight: {
    color: "#84cc16",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Connection states
  connected: {
    backgroundColor: "#f0fdf4",
  },
  disconnected: {
    backgroundColor: "#fef2f2",
  },
  checking: {
    backgroundColor: "#fef8e7",
  },

  // Auth Layout (Login & Cadastro Screen)
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
    color: "#0f172a",
    letterSpacing: -1,
  },
  authLogoTextHighlight: {
    color: "#84cc16",
  },
  authSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  authCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
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
    color: "#0f172a",
    marginBottom: 20,
  },
  authSubmitBtn: {
    height: 52,
    backgroundColor: "#a3e635", // lime-400
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#a3e635",
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
    color: "#020617",
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
    color: "#64748b",
  },
  authSwitchLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#84cc16",
    marginLeft: 6,
  },

  // Alert Banner
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
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  alert_error: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  alert_warning: {
    backgroundColor: "#fef9c3",
    borderColor: "#fef08a",
  },
  alertText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  alertText_success: {
    color: "#15803d",
  },
  alertText_error: {
    color: "#b91c1c",
  },
  alertText_warning: {
    color: "#a16207",
  },

  // Connection Settings Panel
  settingsPanel: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  presetsPanel: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
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
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  testBtn: {
    marginLeft: 8,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: "#a3e635",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  testBtnText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 14,
  },
  presetsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  presetBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 8,
  },
  presetText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  settingsHelp: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 6,
    lineHeight: 15,
  },
  noUsersPresetText: {
    fontSize: 11,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 8,
  },
  presetsList: {
    marginTop: 8,
    flexDirection: "row",
  },
  presetUserBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
    minWidth: 110,
  },
  presetUserBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  presetUserBadgeSub: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },

  // HOME SCREEN GENERAL LAYOUT
  homeContainer: {
    flex: 1,
  },
  homeHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  homeHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  homeHeaderWelcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  welcomeUserText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  welcomeSubText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  // EcoCoins Wallet Card (Header Destaque)
  ecoCoinHeaderCard: {
    backgroundColor: "#0f172a", // slate-900 (Header Dark para contrastar e parecer premium)
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#020617",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  ecoCoinContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ecoCoinLabelBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  ecoCoinIcon: {
    marginRight: 10,
  },
  ecoCoinLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e2e8f0", // slate-200
  },
  ecoCoinBalanceText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#a3e635", // lime-400
  },
  ecoCoinUnit: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "600",
  },
  ecoCoinInactiveBlock: {
    alignItems: "center",
    paddingVertical: 4,
  },
  ecoCoinPromptText: {
    fontSize: 12,
    color: "#cbd5e1",
    marginBottom: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  activateEcoCoinBtn: {
    backgroundColor: "#a3e635",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activateEcoCoinBtnText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 13,
  },

  // Portal Body Panels
  scrollArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  portalContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a3e635",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#020617",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },

  // Client simulated statistics cards
  statsGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },

  // Client Simulation Card
  simulationIntroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    alignItems: "center",
  },
  sparkIcon: {
    marginBottom: 8,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  simulationText: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  simulationBtn: {
    backgroundColor: "#a3e635",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  simulationBtnText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 13,
  },
  simulationPromptText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },

  // Profile Details inside Client portal
  profileDetailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  profileCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  profileDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profileDetailIcon: {
    marginRight: 8,
  },
  profileDetailText: {
    fontSize: 13,
    color: "#475569",
  },
  profileTipText: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
    marginTop: 12,
    fontStyle: "italic",
  },

  // Manager Panel (Employee Mode) general intro
  managerIntroText: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },

  // General Components (FAB, Form layouts etc)
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  formInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#0f172a",
  },
  typeSelectorRow: {
    flexDirection: "row",
  },
  typeOption: {
    flex: 1,
    height: 46,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  typeOptionSelected: {
    borderColor: "#84cc16",
    backgroundColor: "#ecfccb",
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  typeOptionTextSelected: {
    color: "#3f6212",
    fontWeight: "700",
  },
  inputWrapperError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 4,
  },

  // Manager Mode: User Cards
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userMainInfo: {
    flex: 1,
    paddingRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "#64748b",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  typeTagCustomer: {
    backgroundColor: "#ecfccb",
  },
  typeTagEmployee: {
    backgroundColor: "#e0f2fe",
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  typeTagTextCustomer: {
    color: "#3f6212",
  },
  typeTagTextEmployee: {
    color: "#075985",
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#64748b",
  },
  walletContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeWallet: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sparkleIcon: {
    marginRight: 6,
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803d",
  },
  inactiveWallet: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletPrompt: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  activateWalletBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#84cc16",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  activateWalletText: {
    color: "#84cc16",
    fontSize: 10,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: "#f8fafc",
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
  },
  deleteButtonText: {
    color: "#ef4444",
  },

  // Modals overlays
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
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  closeModalButton: {
    padding: 6,
  },
  closeModalText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
  },
  modalForm: {
    paddingVertical: 16,
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
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  modalBtnCancelText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: "#a3e635",
    marginLeft: 8,
  },
  modalBtnSaveText: {
    color: "#020617",
    fontWeight: "800",
    fontSize: 14,
  },

  // Helper classes
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 12,
  },
  footerSpacing: {
    height: 50,
  },
});
