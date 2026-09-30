import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GymBottomTabBar } from '../../components/GymBottomTabBar';
import { ThemedAlert } from '../../components/ThemedAlert';
import { api } from '../../services/api';

export default function GymDashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(() => api.gym.getInitialDashboard().data);
  const [reminderLoadingId, setReminderLoadingId] = useState<number | null>(null);

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

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await api.gym.getDashboard(isRefresh);
      if (res && res.success) {
        setDashboardData(res.data);
      } else if (res?.message && !dashboardData) {
        showAlert('warning', 'Notice', res.message);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSendReminder = async (memberId: number, memberName: string) => {
    setReminderLoadingId(memberId);
    try {
      const res = await api.gym.sendReminder(memberId);
      if (res && res.success) {
        showAlert('success', 'Reminder Recorded', `Payment reminder recorded for ${memberName}.`);
      } else {
        showAlert('warning', 'Notice', res?.message || 'Could not record reminder.');
      }
    } catch (e) {
      showAlert('danger', 'Error', 'Failed to send reminder.');
    } finally {
      setReminderLoadingId(null);
    }
  };

  const metrics = dashboardData?.metrics || {
    total_members: 0,
    active_members: 0,
    inactive_members: 0,
    present_today: 0,
    absent_today: 0,
    attendance_rate: 0,
    active_plans: 0,
    total_collected: 0,
    pending_dues: 0,
    due_members_count: 0,
  };

  const gym = dashboardData?.gym;
  const recentMembers = dashboardData?.recent_members || [];
  const dueMembers = dashboardData?.due_members || [];
  const recentPayments = dashboardData?.recent_payments || [];

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.avatarBox}>
              <Ionicons name="barbell" size={20} color="#0052FF" />
            </View>
            <View style={styles.headerTextCol}>
              <View style={styles.nameRow}>
                <Text style={styles.gymTitle} numberOfLines={1}>
                  {gym?.gym_name || 'SlotB Fitness'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.gymSubtitle} numberOfLines={1}>
                {gym?.address || 'Begusarai, Bihar'} • {gym?.opening_time || '06:00 AM'} - {gym?.closing_time || '10:00 PM'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/gym/profile' as any)}
            style={styles.settingsButton}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={22} color="#475569" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Gym Dashboard...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchDashboard(true)}
                colors={['#0052FF']}
              />
            }
          >
            {/* Hero Attendance & Activity Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroHeaderRow}>
                <View>
                  <Text style={styles.heroPretitle}>TODAY'S OVERVIEW</Text>
                  <Text style={styles.heroTitle}>Member Turnout</Text>
                </View>
                <View style={styles.turnoutPill}>
                  <Text style={styles.turnoutPillText}>{metrics.attendance_rate}% Active</Text>
                </View>
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{metrics.present_today}</Text>
                  <Text style={styles.heroStatLabel}>Checked In</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{metrics.absent_today}</Text>
                  <Text style={styles.heroStatLabel}>Not Arrived</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{metrics.active_members}</Text>
                  <Text style={styles.heroStatLabel}>Total Active</Text>
                </View>
              </View>

              {/* Progress Line */}
              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${Math.min(100, Math.max(10, metrics.attendance_rate))}%` },
                  ]}
                />
              </View>
            </View>

            {/* Core Metrics: 2x2 Clean Grid (Informative, High Legibility, No Button Clutter) */}
            <View style={styles.metricsGrid}>
              {/* Card 1: Total Members */}
              <View style={styles.metricCard}>
                <View style={styles.metricIconWrap}>
                  <Ionicons name="people" size={18} color="#0052FF" />
                </View>
                <Text style={styles.metricNumber}>{metrics.total_members}</Text>
                <Text style={styles.metricLabel}>Total Members</Text>
                <Text style={styles.metricHint}>{metrics.active_members} currently active</Text>
              </View>

              {/* Card 2: Revenue Collected */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="wallet" size={18} color="#16A34A" />
                </View>
                <Text style={[styles.metricNumber, { color: '#16A34A' }]}>
                  ₹{Number(metrics.total_collected).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.metricLabel}>Fees Collected</Text>
                <Text style={styles.metricHint}>This month's revenue</Text>
              </View>

              {/* Card 3: Pending Dues */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.metricNumber, { color: '#DC2626' }]}>
                  ₹{Number(metrics.pending_dues).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.metricLabel}>Pending Dues</Text>
                <Text style={styles.metricHint}>{metrics.due_members_count} renewals pending</Text>
              </View>

              {/* Card 4: Membership Plans */}
              <View style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#9333EA" />
                </View>
                <Text style={[styles.metricNumber, { color: '#9333EA' }]}>
                  {metrics.active_plans || 4}
                </Text>
                <Text style={styles.metricLabel}>Active Packages</Text>
                <Text style={styles.metricHint}>Monthly to Annual</Text>
              </View>
            </View>

            {/* Management Shortcuts: Only Essential Items NOT in Bottom Tab Bar */}
            <View style={styles.shortcutsRow}>
              <Pressable
                onPress={() => router.push('/gym/plans' as any)}
                style={({ pressed }) => [styles.shortcutCard, pressed && styles.shortcutPressed]}
              >
                <View style={[styles.shortcutIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="layers-outline" size={20} color="#0052FF" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Membership Plans</Text>
                  <Text style={styles.shortcutSub}>Configure fees & packages</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/timings' as any)}
                style={({ pressed }) => [styles.shortcutCard, pressed && styles.shortcutPressed]}
              >
                <View style={[styles.shortcutIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Batch Timings</Text>
                  <Text style={styles.shortcutSub}>Morning & evening batches</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Priority Section: Pending Fee Renewals (Only if dues exist) */}
            {dueMembers.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Pending Fee Renewals</Text>
                  </View>
                  <View style={styles.dueBadge}>
                    <Text style={styles.dueBadgeText}>{dueMembers.length} due</Text>
                  </View>
                </View>

                {dueMembers.slice(0, 3).map((item: any, idx: number) => (
                  <View key={`due-${item.payment_id || item.id || idx}`} style={styles.dueRow}>
                    <View style={styles.dueLeft}>
                      <Text style={styles.dueName}>{item.name}</Text>
                      <Text style={styles.duePlan}>{item.plan_name || 'Membership'} • Due: {item.due_date || 'Overdue'}</Text>
                    </View>
                    <View style={styles.dueRight}>
                      <Text style={styles.dueAmountText}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                      <Pressable
                        onPress={() => handleSendReminder(item.member_id, item.name)}
                        disabled={reminderLoadingId === item.member_id}
                        style={({ pressed }) => [
                          styles.remindBtn,
                          pressed && styles.remindBtnPressed,
                        ]}
                      >
                        {reminderLoadingId === item.member_id ? (
                          <ActivityIndicator size="small" color="#0052FF" />
                        ) : (
                          <Text style={styles.remindBtnText}>Remind</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Payments Section */}
            {recentPayments.length > 0 && (
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <Text style={styles.sectionTitle}>Recent Payments</Text>
                </View>
                {recentPayments.slice(0, 4).map((pay: any, idx: number) => (
                  <View key={`pay-${pay.id || pay.payment_id || idx}`} style={styles.paymentRow}>
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIconBox}>
                        <Ionicons name="arrow-down-circle" size={20} color="#16A34A" />
                      </View>
                      <View>
                        <Text style={styles.paymentMemberName}>{pay.member_name}</Text>
                        <Text style={styles.paymentDate}>
                          {pay.payment_date} • {pay.payment_method}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.paymentAmount}>+₹{Number(pay.amount).toLocaleString('en-IN')}</Text>
                      <Text style={styles.paymentPlan}>{pay.plan_name || 'Fee'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}

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

        {/* Gym Bottom Tab Bar */}
        <GymBottomTabBar activeTab="home" />
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gymTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  gymSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  /* Hero Card */
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroPretitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  turnoutPill: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  turnoutPillText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '700',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#0052FF',
    borderRadius: 3,
  },
  /* 2x2 Clean Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  metricHint: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  /* Management Shortcuts */
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  shortcutCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
        elevation: 1,
      },
    }),
  },
  shortcutPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  shortcutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shortcutTextCol: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  shortcutSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  dueBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dueLeft: {
    flex: 1,
    marginRight: 8,
  },
  dueName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  duePlan: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  dueRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dueAmountText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  remindBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  remindBtnPressed: {
    opacity: 0.7,
  },
  remindBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052FF',
  },
  /* Payments Rows */
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  paymentIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMemberName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentDate: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  paymentPlan: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
});
