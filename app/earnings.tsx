import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { ThemedAlert } from '../components/ThemedAlert';
import { api } from '../services/api';

type Timeframe = 'today' | 'week' | 'month';

interface TransactionItem {
  id: string;
  title: string;
  type: 'job' | 'bonus' | 'withdrawal' | 'tip';
  date: string;
  amount: number;
  status: 'credited' | 'processing' | 'withdrawn';
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'TXN-901',
    title: 'AC Installation • Rahul Kumar',
    type: 'job',
    date: 'Today, 11:30 AM',
    amount: 699,
    status: 'credited',
  },
  {
    id: 'TXN-902',
    title: 'Customer Tip • Rahul Kumar',
    type: 'tip',
    date: 'Today, 11:35 AM',
    amount: 100,
    status: 'credited',
  },
  {
    id: 'TXN-898',
    title: 'AC Service • Rakesh Kumar',
    type: 'job',
    date: 'Today, 03:15 PM',
    amount: 499,
    status: 'credited',
  },
  {
    id: 'TXN-895',
    title: 'AC Maintenance • Sanjeet Kumar',
    type: 'job',
    date: 'Today, 06:45 PM',
    amount: 399,
    status: 'credited',
  },
  {
    id: 'TXN-880',
    title: 'Weekly Performance Bonus',
    type: 'bonus',
    date: 'Yesterday, 08:00 PM',
    amount: 753,
    status: 'credited',
  },
];

export default function EarningsScreen() {
  const router = useRouter();

  const partner = api.getCurrentPartner() || api.getInitialPartner();
  const initEarn = api.getInitialEarnings();

  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [walletBalance, setWalletBalance] = useState<number>(initEarn.wallet_balance || partner?.wallet_balance || 2450);
  const [transactions, setTransactions] = useState<any[]>(initEarn.transactions || INITIAL_TRANSACTIONS);

  useEffect(() => {
    const fetchLiveEarnings = async () => {
      try {
        const res = await api.getEarnings();
        if (res) {
          if (res.wallet_balance) setWalletBalance(res.wallet_balance);
          if (res.transactions) setTransactions(res.transactions);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchLiveEarnings();
  }, []);

  // Themed Alert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'warning' | 'danger' | 'info' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showAlert = (
    type: 'success' | 'warning' | 'danger' | 'info' | 'confirm',
    title: string,
    message: string,
    onConfirm?: () => void,
    showCancel = false,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onCancel?: () => void
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      showCancel,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      },
    });
  };

  const earningsData = {
    today: {
      total: walletBalance,
      jobsCompleted: 9,
      jobEarnings: 1997,
      bonus: 353,
      tips: 100,
    },
    week: {
      total: 14820,
      jobsCompleted: 48,
      jobEarnings: 12450,
      bonus: 1800,
      tips: 570,
    },
    month: {
      total: 48650,
      jobsCompleted: 156,
      jobEarnings: 42100,
      bonus: 4800,
      tips: 1750,
    },
  };

  const current = earningsData[timeframe];

  const handleWithdraw = () => {
    if (walletBalance <= 0) {
      showAlert('warning', 'Zero Balance', 'Your current withdrawable wallet balance is ₹0.');
      return;
    }

    showAlert(
      'confirm',
      'Instant Bank Withdrawal',
      `Transfer available balance of ₹${walletBalance.toLocaleString('en-IN')} to:\n\n• HDFC Bank (•••• 4892)\n• IFSC: HDFC0001234\n• Account: Rohit Kumar\n• Mode: Instant IMPS (Zero fee)`,
      () => {
        const withdrawAmount = walletBalance;
        setWalletBalance(0);
        const newTxn: TransactionItem = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          title: 'Bank Withdrawal • HDFC (4892)',
          type: 'withdrawal',
          date: 'Just now',
          amount: withdrawAmount,
          status: 'withdrawn',
        };
        setTransactions((prev) => [newTxn, ...prev]);
        setTimeout(() => {
          showAlert(
            'success',
            'Payout Processed! 💸',
            `₹${withdrawAmount.toLocaleString('en-IN')} has been sent to your HDFC bank account via instant IMPS transfer.`
          );
        }, 300);
      },
      true,
      'Confirm Withdrawal',
      'Cancel'
    );
  };

  const handleTransactionPress = (txn: TransactionItem) => {
    showAlert(
      'info',
      `Transaction Details (#${txn.id})`,
      `${txn.title}\n\n• Date: ${txn.date}\n• Amount: ₹${txn.amount}\n• Status: ${txn.status.toUpperCase()}\n• Mode: SlotB Direct Settlement`
    );
  };

  const handleStatement = () => {
    showAlert(
      'success',
      'Monthly Statement Sent',
      'Your monthly GST and earnings statement for May 2025 has been emailed to your registered address.'
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Royal Blue Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>My Earnings</Text>
              <Text style={styles.headerSubtitle}>SlotB Partner Wallet & Payouts</Text>
            </View>

            <Pressable onPress={handleStatement} style={styles.statementBtn} hitSlop={8}>
              <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Wallet Balance Hero Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTopRow}>
            <View>
              <Text style={styles.walletLabel}>Available for Withdrawal</Text>
              <Text style={styles.walletAmount}>₹{walletBalance.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.payoutStatusBadge}>
              <View style={styles.payoutDot} />
              <Text style={styles.payoutStatusText}>Instant Payout</Text>
            </View>
          </View>

          {/* Linked Bank Row */}
          <View style={styles.bankRow}>
            <MaterialCommunityIcons name="bank" size={18} color="#0052FF" style={{ marginRight: 8 }} />
            <Text style={styles.bankText}>HDFC Bank (•••• 4892)</Text>
            <View style={styles.verifiedMiniTag}>
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" style={{ marginRight: 2 }} />
              <Text style={styles.verifiedMiniText}>Verified</Text>
            </View>
          </View>

          {/* Withdraw Button */}
          <Pressable
            onPress={handleWithdraw}
            style={({ pressed }) => [
              styles.withdrawBtn,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="cash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.withdrawBtnText}>Withdraw to Bank</Text>
          </Pressable>
        </View>

        {/* Timeframe Selector Pills */}
        <View style={styles.timeframeRow}>
          <Pressable
            onPress={() => setTimeframe('today')}
            style={[
              styles.timeframePill,
              timeframe === 'today' && styles.timeframePillActive,
            ]}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'today' && styles.timeframeTextActive,
              ]}
            >
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTimeframe('week')}
            style={[
              styles.timeframePill,
              timeframe === 'week' && styles.timeframePillActive,
            ]}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'week' && styles.timeframeTextActive,
              ]}
            >
              This Week
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTimeframe('month')}
            style={[
              styles.timeframePill,
              timeframe === 'month' && styles.timeframePillActive,
            ]}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'month' && styles.timeframeTextActive,
              ]}
            >
              This Month
            </Text>
          </Pressable>
        </View>

        {/* 2x2 Metric Breakdown Cards */}
        <View style={styles.grid}>
          {/* Gross Service Income */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="briefcase-outline" size={20} color="#0052FF" />
            </View>
            <Text style={styles.metricCardLabel}>Service Revenue</Text>
            <Text style={styles.metricCardValue}>₹{current.jobEarnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.metricCardSub}>{current.jobsCompleted} Jobs Completed</Text>
          </View>

          {/* Bonuses & Incentives */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="trophy-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.metricCardLabel}>Incentives</Text>
            <Text style={[styles.metricCardValue, { color: '#D97706' }]}>
              ₹{current.bonus.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricCardSub}>Milestone Rewards</Text>
          </View>

          {/* Customer Tips */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="heart-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.metricCardLabel}>Customer Tips</Text>
            <Text style={[styles.metricCardValue, { color: '#16A34A' }]}>
              ₹{current.tips.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricCardSub}>100% Retained</Text>
          </View>

          {/* Platform Commission */}
          <View style={styles.metricCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="gift-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.metricCardLabel}>Commission</Text>
            <Text style={[styles.metricCardValue, { color: '#7C3AED' }]}>0%</Text>
            <Text style={styles.metricCardSub}>Zero Fee Special</Text>
          </View>
        </View>

        {/* Daily Incentive Progress Card (Urban Company Style) */}
        <View style={styles.incentiveCard}>
          <View style={styles.incentiveHeader}>
            <Ionicons name="flame" size={22} color="#EA580C" style={{ marginRight: 8 }} />
            <Text style={styles.incentiveTitle}>Daily Milestone Bonus</Text>
          </View>
          <Text style={styles.incentiveDesc}>
            Complete 3 more jobs today to unlock a <Text style={{ fontWeight: '700', color: '#16A34A' }}>₹500 Bonus</Text>!
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarFill, { width: '75%' }]} />
          </View>
          <View style={styles.progressLabelsRow}>
            <Text style={styles.progressLabel}>9 of 12 Jobs Done</Text>
            <Text style={styles.progressLabel}>75%</Text>
          </View>
        </View>

        {/* Transaction History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historyHeading}>Recent Transactions</Text>

          {transactions.map((txn) => {
            const isWithdrawal = txn.type === 'withdrawal';
            return (
              <Pressable
                key={txn.id}
                onPress={() => handleTransactionPress(txn)}
                style={styles.txnCard}
              >
                <View
                  style={[
                    styles.txnIconCircle,
                    { backgroundColor: isWithdrawal ? '#FEF2F2' : '#F0FDF4' },
                  ]}
                >
                  <Ionicons
                    name={isWithdrawal ? 'arrow-up' : 'arrow-down'}
                    size={18}
                    color={isWithdrawal ? '#EF4444' : '#16A34A'}
                  />
                </View>

                <View style={styles.txnInfo}>
                  <Text style={styles.txnTitle}>{txn.title}</Text>
                  <Text style={styles.txnDate}>{txn.date}</Text>
                </View>

                <View style={styles.txnAmountBlock}>
                  <Text
                    style={[
                      styles.txnAmountText,
                      { color: isWithdrawal ? '#EF4444' : '#16A34A' },
                    ]}
                  >
                    {isWithdrawal ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.txnStatusText}>{txn.status}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Persistent Bottom Tab Bar with active Earnings tab */}
      <BottomTabBar activeTab="earnings" />

      <ThemedAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#005BEA',
    paddingBottom: 16,
  },
  headerSafe: {
    backgroundColor: '#005BEA',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  statementBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  walletLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  payoutStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  payoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  payoutStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  bankText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  verifiedMiniTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052FF',
    height: 46,
    borderRadius: 12,
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeframePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframePillActive: {
    backgroundColor: '#0052FF',
  },
  timeframeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricCardLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  metricCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricCardSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  incentiveCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  incentiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  incentiveTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
  },
  incentiveDesc: {
    fontSize: 12.5,
    color: '#431407',
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: '#FFEDD5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 4,
  },
  progressLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '600',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  txnIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
    marginRight: 8,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  txnDate: {
    fontSize: 11,
    color: '#64748B',
  },
  txnAmountBlock: {
    alignItems: 'flex-end',
  },
  txnAmountText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  txnStatusText: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
