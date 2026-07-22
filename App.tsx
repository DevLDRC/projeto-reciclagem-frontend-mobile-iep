import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  ChakraPetch_400Regular,
  ChakraPetch_500Medium,
  ChakraPetch_600SemiBold,
  ChakraPetch_700Bold,
} from "@expo-google-fonts/chakra-petch";
import { Leaf, Settings, Wifi, WifiOff } from "lucide-react-native";

// Import types, components and screens
import { User, Screen, TipoUser } from "./src/types";
import {
  apiGetUsers,
  apiGetUser,
  apiLogin,
  apiRegister,
  apiCreateWallet,
  apiDeleteUser,
  apiUpdateUser,
  apiTransaction,
  apiGetWalletBalance,
  apiGetWallet,
} from "./src/http/api";
import { convertToISO } from "./src/utils/date";
import { colors, fonts } from "./src/utils/theme";
import AlertBanner from "./src/components/AlertBanner";
import SettingsPanel from "./src/components/SettingsPanel";
import ModalUserForm from "./src/components/ModalUserForm";
import ModalSimulateRecycle from "./src/components/ModalSimulateRecycle";
import ModalAmountTransaction from "./src/components/ModalAmountTransaction";
import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import HomeScreen from "./src/screens/HomeScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    ChakraPetch_400Regular,
    ChakraPetch_500Medium,
    ChakraPetch_600SemiBold,
    ChakraPetch_700Bold,
  });

  // Navigation & User State
  const [currentScreen, setCurrentScreen] = useState<Screen>("LOGIN");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // API URL State
  const [backendUrl, setBackendUrl] = useState("");
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

  // Cadastro Form State (for new registrations on the CadastroScreen)
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formType, setFormType] = useState<TipoUser>("CUSTOMER");
  const [formCfp, setFormCfp] = useState(""); // CPF

  // Manager Panel Modal State (for Employee to Add/Edit users)
  const [managerModalVisible, setManagerModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Client Simulation State
  const [simulationModalVisible, setSimulationModalVisible] = useState(false);

  // Transaction Modal State
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionModalTitle, setTransactionModalTitle] = useState("");
  const [transactionModalDesc, setTransactionModalDesc] = useState("");
  const [transactionModalSubmitLabel, setTransactionModalSubmitLabel] = useState("");
  const [transactionType, setTransactionType] = useState<"EARN" | "SPEND" | "REDEEM">("EARN");
  const [transactionTargetWalletId, setTransactionTargetWalletId] = useState<number | null>(null);
  const [transactionLoading, setTransactionLoading] = useState(false);

  // Visual alert helper
  const triggerAlert = (text: string, type: "success" | "error" | "warning" = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  // Fetch all users to sync local view & validate logins
  const fetchUsers = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setConnectionStatus("checking");
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await apiGetUsers(backendUrl, token, controller.signal);
      clearTimeout(id);

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setConnectionStatus("connected");

        // Refresh logged in user details (like wallet amount)
        if (loggedInUser) {
          const updatedSelf = data.find((u: User) => u.id === loggedInUser.id);
          if (updatedSelf) {
            setLoggedInUser(updatedSelf);
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        setConnectionStatus("connected");
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
    if (loggedInUser && token) {
      try {
        const response = await apiGetUser(backendUrl, loggedInUser.id, token);
        if (response.ok) {
          const freshUser = await response.json();
          setLoggedInUser(freshUser);
        }
      } catch (e) {
        // ignore
      }
    }
    setRefreshing(false);
  }, [backendUrl, loggedInUser]);


  // Perform Login Action (using AuthController JWT)
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      triggerAlert("Por favor, preencha todos os campos de login.", "warning");
      return;
    }

    setLoading(true);
    setConnectionStatus("checking");

    try {
      const response = await apiLogin(backendUrl, loginEmail, loginPassword);

      if (response.ok) {

        console.log("response")

        const data = await response.json();
        const jwtToken = data.token;
        console.log(jwtToken)
        setToken(jwtToken);
        setConnectionStatus("connected");

        console.log("usersResponse")

        // Load logged in user details using the newly acquired token
        const usersResponse = await apiGetUsers(backendUrl, jwtToken);

        if (usersResponse.ok) {
          const usersList: User[] = await usersResponse.json();
          console.log("Integrantes carregados:");
          console.log(JSON.stringify(usersList, null, 2));
          setUsers(usersList);
          const userFound = usersList.find(
            (u) => u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
          );

          if (userFound) {
            setLoggedInUser(userFound);
            setLoginPassword(""); // clear password input
            triggerAlert(`Olá, ${userFound.name}! Login realizado com sucesso.`, "success");
            setCurrentScreen("HOME");
          } else {
            triggerAlert("Perfil de usuário não encontrado.", "error");
          }
        } else {
          triggerAlert("Erro ao obter dados do perfil do usuário.", "error");
        }
      } else {
        triggerAlert("E-mail ou senha incorretos.", "error");
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      triggerAlert("Não foi possível conectar ao servidor backend para autenticar.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Register New User (Self Cadastro via AuthController)
  const handleRegister = async () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim() || !formCfp.trim()) {
      triggerAlert("Preencha todos os campos obrigatórios.", "warning");
      return;
    }

    if (!formEmail.includes("@")) {
      triggerAlert("Por favor, insira um e-mail válido.", "warning");
      return;
    }

    const registerData = {
      name: formName.trim(),
      email: formEmail.trim(),
      tipoUsuario: formType,
      cpf: formCfp.replace(/\D/g, ""),
      password: formPassword,
    };

    setLoading(true);
    try {
      const response = await apiRegister(backendUrl, registerData);

      if (response.ok) {
        triggerAlert("Conta criada! Preencha a senha para entrar.", "success");
        setLoginEmail(formEmail.trim()); // pre-fill login screen email
        setCurrentScreen("LOGIN");

        // Reset cadastro form
        setFormName("");
        setFormEmail("");
        setFormPassword("");
        setFormType("CUSTOMER");
        setFormCfp("");
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
    setToken(null);
    setCurrentScreen("LOGIN");
    triggerAlert("Sessão encerrada com sucesso.", "success");
  };

  // Create Wallet for Logged In User or Managed User
  const handleCreateWallet = async (userId: number, isSelf = false) => {
    setLoading(true);
    try {
      const response = await apiCreateWallet(backendUrl, userId, token);

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
              const response = await apiDeleteUser(backendUrl, user.id, token);
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
    setEditingUser(user);
    setManagerModalVisible(true);
  };

  // Save changes by Employee (Add or Edit User)
  const handleManagerSaveUser = async (userData: {
    name: string;
    email: string;
    password?: string;
    type: TipoUser;
    cfp: string;
  }) => {
    setLoading(true);
    try {
      let response;
      if (editingUser) {
        response = await apiUpdateUser(backendUrl, editingUser.id, userData, token);
      } else {
        // Register using the /auth/register endpoint so password is BCrypted
        response = await apiRegister(backendUrl, {
          name: userData.name,
          email: userData.email,
          tipoUsuario: userData.type,
          cpf: userData.cfp,
          password: userData.password || "123456"
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

  // Simulated Recycling Deposit for Customers (persisting to backend database)
  const handleSimulateDeposit = async (simulatedMaterial: string, simulatedWeight: string) => {
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

    setLoading(true);
    try {
      const response = await apiTransaction(
        backendUrl,
        loggedInUser.wallet.id,
        "earn",
        roundedReward.toString(),
        token
      );

      if (response.ok) {
        setSimulationModalVisible(false);
        triggerAlert(
          `Sucesso! Entrega de ${weightNum}kg de ${materialName} registrada. +${roundedReward} EcoCoins depositados na sua carteira!`,
          "success"
        );
        await fetchUsers(true);
      } else {
        const err = await response.text();
        triggerAlert(`Erro ao creditar EcoCoins: ${err || "Operação falhou"}`, "error");
      }
    } catch (error) {
      triggerAlert("Falha ao comunicar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open transaction modals
  const openRedeemModal = () => {
    if (!loggedInUser?.wallet) {
      triggerAlert("Você precisa de uma carteira ativa para resgatar recompensas.", "warning");
      return;
    }
    setTransactionModalTitle("Resgatar Recompensas");
    setTransactionModalDesc("Insira a quantidade de EcoCoins (EC) que deseja resgatar em prêmios fictícios:");
    setTransactionModalSubmitLabel("Resgatar");
    setTransactionType("REDEEM");
    setTransactionTargetWalletId(loggedInUser.wallet.id);
    setTransactionModalVisible(true);
  };

  const openEarnModal = (walletId: number, userName: string) => {
    setTransactionModalTitle("Creditar EcoCoins");
    setTransactionModalDesc(`Insira a quantidade de EcoCoins (EC) para creditar na carteira de ${userName}:`);
    setTransactionModalSubmitLabel("Creditar");
    setTransactionType("EARN");
    setTransactionTargetWalletId(walletId);
    setTransactionModalVisible(true);
  };

  const openSpendModal = (walletId: number, userName: string) => {
    setTransactionModalTitle("Debitar EcoCoins");
    setTransactionModalDesc(`Insira a quantidade de EcoCoins (EC) para debitar da carteira de ${userName}:`);
    setTransactionModalSubmitLabel("Debitar");
    setTransactionType("SPEND");
    setTransactionTargetWalletId(walletId);
    setTransactionModalVisible(true);
  };

  // Handle Credit / Debit / Redeem actions from Modals
  const handleTransactionSubmit = async (amount: string) => {
    if (transactionTargetWalletId === null) return;

    setTransactionLoading(true);
    try {
      const endpoint = transactionType === "EARN" ? "earn" : "spend";
      const response = await apiTransaction(
        backendUrl,
        transactionTargetWalletId,
        endpoint,
        amount,
        token
      );

      if (response.ok) {
        triggerAlert(
          transactionType === "EARN"
            ? `Crédito de ${amount} EC realizado com sucesso!`
            : transactionType === "REDEEM"
              ? `Resgate de ${amount} EC concluído com sucesso!`
              : `Débito de ${amount} EC realizado com sucesso!`,
          "success"
        );
        setTransactionModalVisible(false);
        await fetchUsers(true);

        // Also fetch the specific wallet balance to double check sync
        try {
          const balanceRes = await apiGetWalletBalance(backendUrl, transactionTargetWalletId, token);
          const walletRes = await apiGetWallet(backendUrl, transactionTargetWalletId, token);
          if (balanceRes.ok && walletRes.ok) {
            const balanceData = await balanceRes.json();
            const walletData = await walletRes.json();
            console.log("Sincronização confirmada para a carteira de:", walletData.nomeUser);
            if (loggedInUser && loggedInUser.wallet && loggedInUser.wallet.id === transactionTargetWalletId) {
              setLoggedInUser(prev => {
                if (!prev || !prev.wallet) return prev;
                return {
                  ...prev,
                  wallet: {
                    ...prev.wallet,
                    amount: parseFloat(balanceData.amount)
                  }
                };
              });
            }
          }
        } catch (e) {
          // ignore
        }
      } else {
        const errorText = await response.text();
        triggerAlert(`Erro: ${errorText || "Operação inválida/saldo insuficiente."}`, "error");
      }
    } catch (error) {
      triggerAlert("Falha ao comunicar com o servidor.", "error");
    } finally {
      setTransactionLoading(false);
    }
  };

  // Product purchase feature (debits real backend wallet via /spend)
  const handleBuyProduct = async (amount: number, productName: string) => {
    if (!loggedInUser?.wallet) {
      triggerAlert("Você precisa de uma carteira ativa para fazer compras.", "warning");
      return;
    }

    if (loggedInUser.wallet.amount < amount) {
      triggerAlert("Saldo de EcoCoins insuficiente para adquirir este produto.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await apiTransaction(
        backendUrl,
        loggedInUser.wallet.id,
        "spend",
        amount.toString(),
        token
      );

      if (response.ok) {
        triggerAlert(`Parabéns! Você adquiriu '${productName}' por ${amount} EcoCoins!`, "success");
        await fetchUsers(true);
      } else {
        const err = await response.text();
        triggerAlert(`Erro ao realizar compra: ${err || "Saldo insuficiente."}`, "error");
      }
    } catch (e) {
      triggerAlert("Falha ao comunicar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Total EcoCoins display amount
  const getDisplayAmount = (user: User | null) => {
    if (!user || !user.wallet) return "0.00";
    return user.wallet.amount.toFixed(2);
  };

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.slate50 }}>
        <ActivityIndicator size="large" color={colors.lime500} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.slate50} />

        {/* Header bar only visible on Login & Cadastro screens (Home has its own header) */}
        {currentScreen !== "HOME" && (
          <View style={styles.header}>
            <View style={styles.headerLogoContainer}>
              <Leaf size={24} color={colors.lime500} style={styles.headerIcon} />
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
                  <Wifi size={16} color={colors.slate600} />
                ) : connectionStatus === "checking" ? (
                  <ActivityIndicator size="small" color={colors.lime500} />
                ) : (
                  <WifiOff size={16} color={colors.red500} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => setShowSettings(!showSettings)}
              >
                <Settings size={20} color={colors.slate600} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Global alert message banner */}
        <AlertBanner message={alertMessage} />

        {/* Settings configuration Panel */}
        {showSettings && currentScreen !== "HOME" && (
          <SettingsPanel
            backendUrl={backendUrl}
            setBackendUrl={setBackendUrl}
            onTestConnection={() => fetchUsers(false)}
          />
        )}

        {/* Screen Router */}
        {currentScreen === "LOGIN" && (
          <LoginScreen
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentScreen("CADASTRO")}
            loading={loading}
          />
        )}

        {currentScreen === "CADASTRO" && (
          <CadastroScreen
            formName={formName}
            setFormName={setFormName}
            formEmail={formEmail}
            setFormEmail={setFormEmail}
            formPassword={formPassword}
            setFormPassword={setFormPassword}
            formType={formType}
            setFormType={setFormType}
            formCfp={formCfp}
            setFormCfp={setFormCfp}
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentScreen("LOGIN")}
            loading={loading}
          />
        )}

        {currentScreen === "HOME" && loggedInUser && (
          <HomeScreen
            loggedInUser={loggedInUser}
            users={users}
            connectionStatus={connectionStatus}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onLogout={handleLogout}
            onTestConnection={() => fetchUsers(false)}
            onActivateWallet={handleCreateWallet}
            onDeleteUser={handleDeleteUser}
            onOpenManagerModal={openManagerModal}
            onOpenSimulationModal={() => setSimulationModalVisible(true)}
            onOpenRedeemModal={openRedeemModal}
            onEarn={openEarnModal}
            onSpend={openSpendModal}
            onBuyProduct={handleBuyProduct}
            getDisplayAmount={getDisplayAmount}
          />
        )}

        {/* MODAL: Employee Management (Add/Edit Integrantes) */}
        <ModalUserForm
          visible={managerModalVisible}
          onClose={() => setManagerModalVisible(false)}
          editingUser={editingUser}
          onSave={handleManagerSaveUser}
          loading={loading}
        />

        {/* MODAL: Customer Recycling Simulation */}
        <ModalSimulateRecycle
          visible={simulationModalVisible}
          onClose={() => setSimulationModalVisible(false)}
          onSimulate={handleSimulateDeposit}
        />

        {/* MODAL: Transaction Amount Input (Earn/Spend/Redeem) */}
        <ModalAmountTransaction
          visible={transactionModalVisible}
          onClose={() => setTransactionModalVisible(false)}
          title={transactionModalTitle}
          description={transactionModalDesc}
          submitLabel={transactionModalSubmitLabel}
          onSubmit={handleTransactionSubmit}
          loading={transactionLoading}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
  },
  header: {
    height: 70,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.slate950,
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
    fontFamily: fonts.bold,
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  headerTitleHighlight: {
    fontFamily: fonts.bold,
    color: colors.lime500,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  connected: {
    backgroundColor: colors.green150,
  },
  disconnected: {
    backgroundColor: colors.red50,
  },
  checking: {
    backgroundColor: colors.yellow50,
  },
});
