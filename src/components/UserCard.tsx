import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { Trash2, Edit2, Sparkles, FileText } from "lucide-react-native";
import { User } from "../types";
import { colors, fonts } from "../utils/theme";

interface UserCardProps {
  user: User;
  loggedInUserId: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onActivateWallet: (userId: number) => void;
  onEarn?: (walletId: number, userName: string) => void;
  onSpend?: (walletId: number, userName: string) => void;
}

export default function UserCard({
  user,
  loggedInUserId,
  onEdit,
  onDelete,
  onActivateWallet,
  onEarn,
  onSpend,
}: UserCardProps) {
  return (
    <View style={styles.userCard}>
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
          <FileText size={12} color={colors.slate600} style={styles.detailIcon} />
          <Text style={styles.detailText}>CPF: {user.cfp}</Text>
        </View>
      </View>

      <View style={styles.walletContainer}>
        {user.wallet ? (
          <View style={styles.activeWallet}>
            <View style={styles.walletLeft}>
              <Sparkles size={14} color={colors.lime500} style={styles.sparkleIcon} />
              <Text style={styles.walletLabel}>EcoCoins</Text>
            </View>
            <View style={styles.walletRightRow}>
              <Text style={styles.walletBalance}>
                {user.wallet.amount.toFixed(2)} EC
              </Text>
              {onEarn && onSpend && (
                <View style={styles.walletActions}>
                  <TouchableOpacity
                    style={[styles.miniBtn, styles.miniBtnEarn]}
                    onPress={() => onEarn(user.wallet!.id, user.name)}
                  >
                    <Text style={styles.miniBtnText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.miniBtn, styles.miniBtnSpend]}
                    onPress={() => onSpend(user.wallet!.id, user.name)}
                  >
                    <Text style={[styles.miniBtnText, styles.miniBtnSpendText]}>-</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.inactiveWallet}>
            <Text style={styles.walletPrompt}>Sem carteira ativada</Text>
            <TouchableOpacity
              style={styles.activateWalletBtn}
              onPress={() => onActivateWallet(user.id)}
            >
              <Text style={styles.activateWalletText}>Ativar Carteira</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(user)}
        >
          <Edit2 size={14} color={colors.slate600} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(user)}
          disabled={user.id === loggedInUserId}
        >
          <Trash2 size={14} color={colors.red500} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Excluir
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.slate100,
    ...Platform.select({
      ios: {
        shadowColor: colors.slate900,
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
    fontFamily: fonts.bold,
    color: colors.slate900,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.slate600,
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
    fontFamily: fonts.semiBold,
  },
  typeTagTextCustomer: {
    color: colors.lime800,
  },
  typeTagTextEmployee: {
    color: colors.blue800,
  },
  cardDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.slate50,
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
    fontFamily: fonts.regular,
    color: colors.slate600,
  },
  walletContainer: {
    backgroundColor: colors.slate50,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
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
    fontFamily: fonts.semiBold,
    color: colors.slate600,
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: fonts.bold,
    color: colors.green700,
  },
  walletRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletActions: {
    flexDirection: "row",
    marginLeft: 10,
  },
  miniBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  miniBtnEarn: {
    backgroundColor: colors.lime400,
  },
  miniBtnSpend: {
    backgroundColor: colors.red50,
    borderWidth: 1,
    borderColor: colors.red200,
  },
  miniBtnText: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: fonts.bold,
    color: colors.slate950,
  },
  miniBtnSpendText: {
    color: colors.red500,
  },
  inactiveWallet: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletPrompt: {
    fontSize: 11,
    color: colors.slate600,
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  activateWalletBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: colors.lime500,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  activateWalletText: {
    color: colors.lime500,
    fontSize: 10,
    fontFamily: fonts.semiBold,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
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
    backgroundColor: colors.slate50,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: fonts.semiBold,
    color: colors.slate600,
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: colors.red50,
  },
  deleteButtonText: {
    color: colors.red500,
  },
});


