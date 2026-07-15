import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Leaf,
  Wifi,
  WifiOff,
  LogOut,
  Coins,
  Sparkles,
  Plus,
  FileText,
  Calendar,
  Recycle,
  ShoppingBag,
  Gift,
} from "lucide-react-native";
import { User } from "../types";
import UserCard from "../components/UserCard";
import { convertToBrazilian } from "../utils/date";
import { colors } from "../utils/theme";

interface HomeScreenProps {
  loggedInUser: User;
  users: User[];
  connectionStatus: "disconnected" | "connected" | "checking";
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onTestConnection: () => void;
  onActivateWallet: (userId: number, isSelf: boolean) => void;
  onDeleteUser: (user: User) => void;
  onOpenManagerModal: (user: User | null) => void;
  onOpenSimulationModal: () => void;
  onOpenRedeemModal: () => void;
  onEarn?: (walletId: number, userName: string) => void;
  onSpend?: (walletId: number, userName: string) => void;
  onBuyProduct: (amount: number, productName: string) => void;
  getDisplayAmount: (user: User | null) => string;
}

const PRODUCTS = [
  {
    id: "p1",
    name: "Sacola Ecológica EcoCiclo",
    desc: "Sacola de algodão cru reforçado para suas compras diárias.",
    price: 50,
    icon: "bag",
  },
  {
    id: "p2",
    name: "Copo Retrátil de Silicone",
    desc: "Copo dobrável prático para evitar o uso de descartáveis.",
    price: 80,
    icon: "gift",
  },
  {
    id: "p3",
    name: "Garrafa Térmica Inox 500ml",
    desc: "Garrafa térmica de alta qualidade para bebidas quentes ou frias.",
    price: 150,
    icon: "sparkles",
  },
  {
    id: "p4",
    name: "Canudo Ecológico de Inox",
    desc: "Kit com 2 canudos de inox e 1 escovinha de limpeza.",
    price: 30,
    icon: "gift",
  },
];

export default function HomeScreen({
  loggedInUser,
  users,
  connectionStatus,
  refreshing,
  onRefresh,
  onLogout,
  onTestConnection,
  onActivateWallet,
  onDeleteUser,
  onOpenManagerModal,
  onOpenSimulationModal,
  onOpenRedeemModal,
  onEarn,
  onSpend,
  onBuyProduct,
  getDisplayAmount,
}: HomeScreenProps) {
  return (
    <View style={styles.homeContainer}>
      {/* Header containing user profile + EcoCoin Balance */}
      <View style={styles.homeHeader}>
        <View style={styles.homeHeaderTop}>
          <View style={styles.headerLogoContainer}>
            <Leaf size={20} color={colors.lime500} style={styles.headerIcon} />
            <Text style={styles.headerTitle}>
              Eco<Text style={styles.headerTitleHighlight}>Ciclo</Text>
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.connectionIndicator, styles[connectionStatus]]}
              onPress={onTestConnection}
            >
              {connectionStatus === "connected" ? (
                <Wifi size={14} color={colors.slate600} />
              ) : connectionStatus === "checking" ? (
                <ActivityIndicator size="small" color={colors.lime500} />
              ) : (
                <WifiOff size={14} color={colors.red500} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut size={18} color={colors.red500} />
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

        {/* EcoCoins Header Card */}
        <View style={styles.ecoCoinHeaderCard}>
          {loggedInUser.wallet ? (
            <View style={styles.ecoCoinContent}>
              <View style={styles.ecoCoinLabelBlock}>
                <Coins size={22} color={colors.lime400} style={styles.ecoCoinIcon} />
                <View>
                  <Text style={styles.ecoCoinLabelText}>Saldo EcoCoins</Text>
                  <Text style={styles.ecoCoinBalanceText}>
                    {getDisplayAmount(loggedInUser)} <Text style={styles.ecoCoinUnit}>EC</Text>
                  </Text>
                </View>
              </View>
              {loggedInUser.type === "CUSTOMER" && (
                <TouchableOpacity
                  style={styles.redeemBtn}
                  onPress={onOpenRedeemModal}
                >
                  <Text style={styles.redeemBtnText}>Resgatar</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.ecoCoinInactiveBlock}>
              <Text style={styles.ecoCoinPromptText}>Você ainda não ativou sua carteira de EcoCoins.</Text>
              <TouchableOpacity
                style={styles.activateEcoCoinBtn}
                onPress={() => onActivateWallet(loggedInUser.id, true)}
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
            colors={[colors.lime500]}
          />
        }
      >
        {/* CUSTOMER PORTAL */}
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

            {/* Simulation Card */}
            <View style={styles.simulationIntroCard}>
              <Sparkles size={28} color={colors.lime500} style={styles.sparkIcon} />
              <Text style={styles.simulationTitle}>Ganhe EcoCoins Simulações</Text>
              <Text style={styles.simulationText}>
                Como o backend inicia com saldo zero, criamos este painel interativo para você depositar materiais e simular o recebimento de **EcoCoins** na hora!
              </Text>
              <TouchableOpacity
                style={styles.simulationBtn}
                onPress={onOpenSimulationModal}
              >
                <Text style={styles.simulationBtnText}>Simular Entrega de Recicláveis</Text>
              </TouchableOpacity>
            </View>

            {/* Eco Store Section */}
            <View style={styles.storeContainer}>
              <View style={styles.storeHeader}>
                <ShoppingBag size={20} color={colors.slate900} />
                <Text style={styles.storeTitle}>Loja de Recompensas Ecológicas</Text>
              </View>
              <Text style={styles.storeSubtitle}>
                Troque suas EcoCoins por produtos sustentáveis da nossa cooperativa!
              </Text>

              {/* Products Grid/List */}
              <View style={styles.productsList}>
                {PRODUCTS.map((product) => {
                  const hasBalance = loggedInUser.wallet 
                    ? loggedInUser.wallet.amount >= product.price 
                    : false;

                  return (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productIconWrapper}>
                        {product.icon === "bag" ? (
                          <ShoppingBag size={22} color={colors.lime500} />
                        ) : product.icon === "gift" ? (
                          <Gift size={22} color={colors.lime500} />
                        ) : (
                          <Sparkles size={22} color={colors.lime500} />
                        )}
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productDesc}>{product.desc}</Text>
                        <View style={styles.productFooter}>
                          <Text style={styles.productPrice}>{product.price} EC</Text>
                          <TouchableOpacity
                            style={[
                              styles.buyBtn,
                              !hasBalance && styles.buyBtnDisabled
                            ]}
                            disabled={!hasBalance}
                            onPress={() => onBuyProduct(product.price, product.name)}
                          >
                            <Text style={styles.buyBtnText}>Comprar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Personal Info details */}
            <View style={styles.profileDetailsCard}>
              <Text style={styles.profileCardTitle}>Meus Dados Cadastrados</Text>
              <View style={styles.profileDetailRow}>
                <FileText size={14} color={colors.slate600} style={styles.profileDetailIcon} />
                <Text style={styles.profileDetailText}>CPF: {loggedInUser.cfp}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Calendar size={14} color={colors.slate600} style={styles.profileDetailIcon} />
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
          // EMPLOYEE PORTAL (Manager Dashboard)
          <View style={styles.portalContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dashboard de Gestão de Integrantes</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => onOpenManagerModal(null)}>
                <Plus size={16} color={colors.slate950} />
                <Text style={styles.addBtnText}>Novo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.managerIntroText}>
              Como Funcionário da Cooperativa, você pode cadastrar e editar dados de clientes e outros funcionários, além de ativar a carteira de EcoCoins dos usuários.
            </Text>

            {users.length === 0 ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.lime500} />
                <Text style={styles.loadingText}>Atualizando lista...</Text>
              </View>
            ) : (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  loggedInUserId={loggedInUser.id}
                  onEdit={onOpenManagerModal}
                  onDelete={onDeleteUser}
                  onActivateWallet={(uid) => onActivateWallet(uid, false)}
                  onEarn={onEarn}
                  onSpend={onSpend}
                />
              ))
            )}
          </View>
        )}
        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
  },
  homeHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.slate950,
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
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  headerTitleHighlight: {
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
  connected: {
    backgroundColor: colors.green150,
  },
  disconnected: {
    backgroundColor: colors.red50,
  },
  checking: {
    backgroundColor: colors.yellow50,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.red50,
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
    color: colors.slate900,
    letterSpacing: -0.5,
  },
  welcomeSubText: {
    fontSize: 12,
    color: colors.slate600,
    marginTop: 2,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  typeTagCustomer: {
    backgroundColor: colors.lime100,
  },
  typeTagEmployee: {
    backgroundColor: colors.blue100,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  typeTagTextCustomer: {
    color: colors.lime800,
  },
  typeTagTextEmployee: {
    color: colors.blue800,
  },
  ecoCoinHeaderCard: {
    backgroundColor: colors.slate900,
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.slate950,
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
    color: colors.slate200,
  },
  ecoCoinBalanceText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.lime400,
  },
  ecoCoinUnit: {
    fontSize: 13,
    color: colors.slate200,
    fontWeight: "600",
  },
  ecoCoinInactiveBlock: {
    alignItems: "center",
    paddingVertical: 4,
  },
  ecoCoinPromptText: {
    fontSize: 12,
    color: colors.slate300,
    marginBottom: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  activateEcoCoinBtn: {
    backgroundColor: colors.lime400,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activateEcoCoinBtnText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 13,
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lime400,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: colors.slate950,
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 16,
    borderRadius: 16,
    marginRight: 8,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate600,
    fontWeight: "500",
  },
  simulationIntroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 16,
    alignItems: "center",
  },
  sparkIcon: {
    marginBottom: 8,
  },
  simulationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 6,
  },
  simulationText: {
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 16,
  },
  simulationBtn: {
    backgroundColor: colors.lime400,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  simulationBtnText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 13,
  },
  profileDetailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.slate100,
  },
  profileCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.slate900,
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
    color: colors.slate700,
  },
  profileTipText: {
    fontSize: 11,
    color: colors.slate600,
    lineHeight: 15,
    marginTop: 12,
    fontStyle: "italic",
  },
  managerIntroText: {
    fontSize: 13,
    color: colors.slate600,
    lineHeight: 18,
    marginBottom: 16,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: colors.slate600,
    fontSize: 12,
  },
  redeemBtn: {
    backgroundColor: colors.lime400,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  redeemBtnText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 13,
  },
  footerSpacing: {
    height: 50,
  },
  storeContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 16,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  storeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.slate900,
    marginLeft: 8,
  },
  storeSubtitle: {
    fontSize: 11,
    color: colors.slate600,
    marginBottom: 14,
    lineHeight: 16,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: colors.slate50,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate100,
    alignItems: "center",
  },
  productIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.lime100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.slate900,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 11,
    color: colors.slate600,
    marginBottom: 8,
    lineHeight: 14,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.lime800,
  },
  buyBtn: {
    backgroundColor: colors.lime400,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyBtnDisabled: {
    backgroundColor: colors.slate200,
    opacity: 0.7,
  },
  buyBtnText: {
    color: colors.slate950,
    fontWeight: "800",
    fontSize: 11,
  },
});
