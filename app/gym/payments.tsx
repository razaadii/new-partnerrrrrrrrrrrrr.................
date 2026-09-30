import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GymBottomTabBar } from '../../components/GymBottomTabBar';
import { ThemedAlert } from '../../components/ThemedAlert';
import { ThemedBottomSheet } from '../../components/ThemedBottomSheet';
import { api } from '../../services/api';

export default function GymPaymentsScreen() {
  const router = useRouter();

  const [payments, setPayments] = useState<any[]>(() => api.gym.getInitialPayments().data.payments);
  const [summary, setSummary] = useState(() => api.gym.getInitialPayments().data.summary);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderLoadingId, setReminderLoadingId] = useState<number | null>(null);

  // Record Payment Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [membersList, setMembersList] = useState<any[]>(() => api.gym.getInitialMembers({ status: 'active' }).data.members);
  const [plansList, setPlansList] = useState<any[]>(() => api.gym.getInitialPlans().data);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');

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
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'paid' | 'due'>('paid');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      // Instant local filter in 0ms
      const local = api.gym.getInitialPayments(activeFilter, searchQuery);
      if (local?.data?.payments) {
        setPayments(local.data.payments);
        if (local.data.summary) {
          setSummary(local.data.summary);
        }
      }

      // Background network sync
      const res = await api.gym.getPayments(activeFilter, searchQuery);
      if (res && res.success) {
        if (res.data?.payments) setPayments(res.data.payments);
        if (res.data?.summary) setSummary(res.data.summary);
      }
    } catch (e) {
      console.warn('Fetch payments error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const loadModalData = async () => {
    try {
      const [membersRes, plansRes] = await Promise.all([
        api.gym.getMembers({ status: 'active' }),
        api.gym.getPlans(),
      ]);

      if (membersRes?.success && Array.isArray(membersRes.data?.members)) {
        setMembersList(membersRes.data.members);
        if (membersRes.data.members.length > 0 && !selectedMemberId) {
          setSelectedMemberId(membersRes.data.members[0].id);
        }
      }

      if (plansRes?.success && Array.isArray(plansRes.data)) {
        setPlansList(plansRes.data);
      }
    } catch (e) {
      console.warn('Load modal dependencies error:', e);
    }
  };

  const handleOpenRecordModal = () => {
    setFormError('');
    setAmount('');
    setNotes('');
    setStatus('paid');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    // 30 days due date default
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    setDueDate(nextMonth);
    loadModalData();
    setModalVisible(true);
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlanId(plan.id);
    setAmount(String(plan.fee));
  };

  const handleSendReminder = async (memberId: number, memberName: string) => {
    setReminderLoadingId(memberId);
    try {
      const res = await api.gym.sendReminder(memberId);
      if (res && res.success) {
        showAlert(
          'success',
          'Reminder Sent',
          `Payment renewal reminder recorded successfully for ${memberName}.`
        );
      } else {
        showAlert('warning', 'Notice', res?.message || 'Could not record reminder.');
      }
    } catch (e) {
      showAlert('danger', 'Error', 'Failed to record reminder.');
    } finally {
      setReminderLoadingId(null);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedMemberId) {
      setFormError('Please select a member.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await api.gym.recordPayment({
        member_id: selectedMemberId,
        plan_id: selectedPlanId || undefined,
        amount: numAmount,
        payment_date: paymentDate,
        due_date: dueDate || undefined,
        status,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      });

      if (res && res.success) {
        setModalVisible(false);
        showAlert('success', 'Payment Recorded', 'Payment recorded successfully!');
        fetchPayments();
      } else {
        setFormError(res?.message || 'Failed to record payment.');
      }
    } catch (e) {
      setFormError('Failed to communicate with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPaymentItem = ({ item }: { item: any }) => {
    const isPaid = item.status === 'paid';
    const isDue = item.status === 'due' || item.status === 'overdue';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.memberName}>{item.member_name}</Text>
            <Text style={styles.memberMobile}>
              {item.plan_name || 'Membership'} • {item.member_mobile}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={[styles.amountText, isPaid ? styles.amountPaid : styles.amountDue]}>
              {isPaid ? '+' : ''}₹{Number(item.amount).toLocaleString('en-IN')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                isPaid ? styles.badgePaid : styles.badgeDue,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isPaid ? styles.badgeTextPaid : styles.badgeTextDue,
                ]}
              >
                {item.status === 'overdue' ? 'Overdue' : isPaid ? 'Paid' : 'Fee Due'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.metaText}>
            {isPaid ? `Paid: ${item.payment_date}` : `Due: ${item.due_date || item.payment_date}`} • {item.payment_method || 'UPI'}
          </Text>

          {isDue && (
            <Pressable
              onPress={() => handleSendReminder(item.member_id, item.member_name)}
              disabled={reminderLoadingId === item.member_id}
              style={({ pressed }) => [
                styles.reminderBtn,
                pressed && styles.reminderBtnPressed,
              ]}
              hitSlop={6}
            >
              {reminderLoadingId === item.member_id ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="notifications-outline" size={13} color="#DC2626" />
                  <Text style={styles.reminderBtnText}>Remind</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Payments & Dues</Text>
            <Text style={styles.headerSubtitle}>Fee Records & Renewal Manager</Text>
          </View>

          <Pressable
            onPress={handleOpenRecordModal}
            style={({ pressed }) => [styles.recordBtn, pressed && styles.recordBtnPressed]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.recordBtnText}>Record Fee</Text>
          </Pressable>
        </View>

        {/* 4 Metrics Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Collected */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Ionicons name="trending-up" size={16} color="#16A34A" />
            </View>
            <Text style={[styles.metricValue, { color: '#16A34A' }]}>
              ₹{Number(summary.total_collected).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricSub}>{summary.paid_count} Collections</Text>
          </View>

          {/* Pending Dues */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Pending Dues</Text>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
            </View>
            <Text style={[styles.metricValue, { color: '#DC2626' }]}>
              ₹{Number(summary.pending_dues).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.metricSub}>{summary.due_count} Members Due</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search payments by member or note..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'paid', 'due'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            const labels = { all: 'All Payments', paid: 'Paid Only', due: 'Pending Dues' };
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {labels[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Payments List */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Payment History...</Text>
          </View>
        ) : (
          <FlatList
            style={styles.flex1}
            data={payments}
            keyExtractor={(item, index) => String(item.id || item.payment_id || index)}
            renderItem={renderPaymentItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchPayments();
                }}
                colors={['#0052FF']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="wallet-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Payment Records Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Try searching with a different keyword.'
                    : 'Tap "Record Fee" above to log a new member payment.'}
                </Text>
              </View>
            }
          />
        )}

        {/* Record Payment Themed Bottom Sheet */}
        <ThemedBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Record Member Payment"
          subtitle="Log receipt for membership fee or mark renewal dues"
          icon="wallet-outline"
          iconColor="#0052FF"
          maxHeight="90%"
        >
          <ScrollView
            contentContainerStyle={styles.formScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.modalErrorText}>{formError}</Text>
              </View>
            ) : null}

            {/* Select Member */}
            <Text style={styles.inputLabel}>Select Member *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hSelector}>
              {membersList.map((m, idx) => (
                <Pressable
                  key={`mem-${m.id || idx}`}
                  onPress={() => setSelectedMemberId(m.id)}
                  style={[
                    styles.selectChip,
                    selectedMemberId === m.id && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      selectedMemberId === m.id && styles.selectChipTextActive,
                    ]}
                  >
                    {m.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Select Plan (Optional Auto-fill) */}
            <Text style={styles.inputLabel}>Membership Plan (Auto-fill Fee)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hSelector}>
              {plansList.map((p, idx) => (
                <Pressable
                  key={`plan-${p.id || idx}`}
                  onPress={() => handlePlanSelect(p)}
                  style={[
                    styles.selectChip,
                    selectedPlanId === p.id && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      selectedPlanId === p.id && styles.selectChipTextActive,
                    ]}
                  >
                    {p.name} (₹{p.fee})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Amount */}
            <Text style={styles.inputLabel}>Amount (₹) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 1500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#94A3B8"
            />

            {/* Status Toggle */}
            <Text style={styles.inputLabel}>Payment Status</Text>
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setStatus('paid')}
                style={[styles.toggleBtn, status === 'paid' && styles.toggleBtnPaid]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={status === 'paid' ? '#FFFFFF' : '#16A34A'}
                />
                <Text
                  style={[
                    styles.toggleText,
                    status === 'paid' && styles.toggleTextActive,
                  ]}
                >
                  Paid (Received)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setStatus('due')}
                style={[styles.toggleBtn, status === 'due' && styles.toggleBtnDue]}
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={status === 'due' ? '#FFFFFF' : '#DC2626'}
                />
                <Text
                  style={[
                    styles.toggleText,
                    status === 'due' && styles.toggleTextActive,
                  ]}
                >
                  Mark as Due
                </Text>
              </Pressable>
            </View>

            {/* Payment Method */}
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.methodRow}>
              {['UPI', 'Cash', 'Bank Transfer', 'Card'].map((pm) => (
                <Pressable
                  key={pm}
                  onPress={() => setPaymentMethod(pm)}
                  style={[
                    styles.methodChip,
                    paymentMethod === pm && styles.methodChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      paymentMethod === pm && styles.methodChipTextActive,
                    ]}
                  >
                    {pm}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Payment & Due Dates */}
            <View style={styles.dualInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Payment Date</Text>
                <TextInput
                  style={styles.modalInput}
                  value={paymentDate}
                  onChangeText={setPaymentDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Due / Next Renewal</Text>
                <TextInput
                  style={styles.modalInput}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.inputLabel}>Notes / Reference (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. PhonePe transaction #48291"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#94A3B8"
            />

            {/* Submit Button */}
            <Pressable
              onPress={handleRecordPayment}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                submitting && styles.submitButtonDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm & Record Payment</Text>
              )}
            </Pressable>
          </ScrollView>
        </ThemedBottomSheet>

        {/* Global Themed Alert Dialog */}
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

        {/* Bottom Tab Bar */}
        <GymBottomTabBar activeTab="payments" />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0052FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  recordBtnPressed: {
    backgroundColor: '#0046E0',
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPaid: {
    backgroundColor: '#DCFCE7',
  },
  avatarDue: {
    backgroundColor: '#FEE2E2',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberMobile: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  amountPaid: {
    color: '#16A34A',
  },
  amountDue: {
    color: '#DC2626',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 3,
  },
  badgePaid: {
    backgroundColor: '#DCFCE7',
  },
  badgeDue: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  badgeTextPaid: {
    color: '#15803D',
  },
  badgeTextDue: {
    color: '#B91C1C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    alignItems: 'flex-end',
  },
  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reminderBtnPressed: {
    backgroundColor: '#FEE2E2',
  },
  reminderBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13.5,
    color: '#0F172A',
  },
  hSelector: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  selectChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0052FF',
  },
  selectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  selectChipTextActive: {
    color: '#0052FF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleBtnPaid: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  toggleBtnDue: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  toggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodChipActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  methodChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  methodChipTextActive: {
    color: '#FFFFFF',
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#0052FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonPressed: {
    backgroundColor: '#0046E0',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
