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
import { api } from '../../services/api';

export default function GymDashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [reminderLoadingId, setReminderLoadingId] = useState<number | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await api.gym.getDashboard(isRefresh);
      if (res && res.success) {
        setDashboardData(res.data);
      } else if (res?.message && !dashboardData) {
        Alert.alert('Notice', res.message);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dashboardData]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSendReminder = async (memberId: number, memberName: string) => {
    setReminderLoadingId(memberId);
    try {
      const res = await api.gym.sendReminder(memberId);
      if (res && res.success) {
        Alert.alert('Reminder Sent', `Payment reminder recorded for ${memberName}.`);
      } else {
        Alert.alert('Error', res?.message || 'Could not record reminder.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send reminder.');
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
            {/* Quick Actions Carousel */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <Pressable
                onPress={() => router.push('/gym/members' as any)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="person-add" size={20} color="#0052FF" />
                </View>
                <Text style={styles.actionLabel}>Add Member</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/attendance' as any)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#16A34A" />
                </View>
                <Text style={styles.actionLabel}>Attendance</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/payments' as any)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="cash" size={20} color="#D97706" />
                </View>
                <Text style={styles.actionLabel}>Record Fee</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/plans' as any)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="layers" size={20} color="#9333EA" />
                </View>
                <Text style={styles.actionLabel}>Plans</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/timings' as any)}
                style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              >
                <View style={[styles.actionIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="time" size={20} color="#0284C7" />
                </View>
                <Text style={styles.actionLabel}>Timings</Text>
              </Pressable>
            </ScrollView>

            {/* 5 KPI Metric Cards Grid */}
            <View style={styles.metricsGrid}>
              {/* Card 1: Total Members */}
              <Pressable
                onPress={() => router.push('/gym/members' as any)}
                style={styles.metricCard}
              >
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Total Members</Text>
                  <Ionicons name="people-outline" size={18} color="#0052FF" />
                </View>
                <Text style={styles.metricValue}>{metrics.total_members}</Text>
                <View style={styles.metricFooterPill}>
                  <Text style={styles.pillText}>{metrics.active_members} Active Members</Text>
                </View>
              </Pressable>

              {/* Card 2: Today's Attendance */}
              <Pressable
                onPress={() => router.push('/gym/attendance' as any)}
                style={styles.metricCard}
              >
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Today's Check-in</Text>
                  <Ionicons name="calendar-outline" size={18} color="#16A34A" />
                </View>
                <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                  {metrics.present_today}
                </Text>
                <View style={[styles.metricFooterPill, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={[styles.pillText, { color: '#166534' }]}>
                    {metrics.attendance_rate}% Turnout
                  </Text>
                </View>
              </Pressable>

              {/* Card 3: Payments Collected */}
              <Pressable
                onPress={() => router.push('/gym/payments' as any)}
                style={styles.metricCard}
              >
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Revenue Collected</Text>
                  <Ionicons name="trending-up" size={18} color="#0052FF" />
                </View>
                <Text style={styles.metricValue}>
                  ₹{Number(metrics.total_collected).toLocaleString('en-IN')}
                </Text>
                <View style={styles.metricFooterPill}>
                  <Text style={styles.pillText}>Recorded in Bank/Cash</Text>
                </View>
              </Pressable>

              {/* Card 4: Pending Dues */}
              <Pressable
                onPress={() => router.push('/gym/payments' as any)}
                style={styles.metricCard}
              >
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>Pending Dues</Text>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.metricValue, { color: '#DC2626' }]}>
                  ₹{Number(metrics.pending_dues).toLocaleString('en-IN')}
                </Text>
                <View style={[styles.metricFooterPill, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.pillText, { color: '#991B1B' }]}>
                    {metrics.due_members_count} Members Due
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Attendance Summary Banner */}
            <View style={styles.attendanceBanner}>
              <View style={styles.bannerHeader}>
                <View>
                  <Text style={styles.bannerTitle}>Today's Attendance Status</Text>
                  <Text style={styles.bannerSubtitle}>
                    {metrics.present_today} Present • {metrics.absent_today} Yet to check in
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/gym/attendance' as any)}
                  style={styles.viewAllBtn}
                >
                  <Text style={styles.viewAllText}>Mark Now</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0052FF" />
                </Pressable>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(8, metrics.attendance_rate))}%` },
                  ]}
                />
              </View>
            </View>

            {/* Due Members Section with Send Reminder */}
            {dueMembers.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderLeft}>
                    <Text style={styles.sectionTitle}>Fee Due Reminders</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{dueMembers.length}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => router.push('/gym/payments' as any)}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </Pressable>
                </View>

                {dueMembers.map((item: any) => (
                  <View key={`due-${item.payment_id}`} style={styles.dueCard}>
                    <View style={styles.dueInfo}>
                      <Text style={styles.dueMemberName}>{item.name}</Text>
                      <Text style={styles.duePlanText}>
                        {item.plan_name || 'Membership'} • Due: {item.due_date || 'Immediate'}
                      </Text>
                      <Text style={styles.dueAmount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleSendReminder(item.member_id, item.name)}
                      disabled={reminderLoadingId === item.member_id}
                      style={({ pressed }) => [
                        styles.reminderButton,
                        pressed && styles.reminderButtonPressed,
                      ]}
                    >
                      {reminderLoadingId === item.member_id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="notifications-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.reminderButtonText}>Send Reminder</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Members Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recently Joined Members</Text>
                <Pressable onPress={() => router.push('/gym/members' as any)}>
                  <Text style={styles.seeAllText}>View All ({metrics.total_members})</Text>
                </Pressable>
              </View>

              {recentMembers.map((member: any) => (
                <Pressable
                  key={`member-${member.id}`}
                  onPress={() => router.push(`/gym/member-detail?id=${member.id}` as any)}
                  style={({ pressed }) => [styles.memberItem, pressed && styles.itemPressed]}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.avatarInitial}>{member.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPhone}>{member.mobile} • Joined {member.joining_date}</Text>
                  </View>
                  <View style={styles.memberBadgeCol}>
                    <View
                      style={[
                        styles.statusPill,
                        member.status === 'active' ? styles.statusActive : styles.statusInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          member.status === 'active' ? styles.statusActiveText : styles.statusInactiveText,
                        ]}
                      >
                        {member.status}
                      </Text>
                    </View>
                    <Text style={styles.planNameText}>{member.plan_name || 'Standard'}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Recent Payments Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Payments</Text>
                <Pressable onPress={() => router.push('/gym/payments' as any)}>
                  <Text style={styles.seeAllText}>All Payments</Text>
                </Pressable>
              </View>

              {recentPayments.map((pay: any) => (
                <View key={`pay-${pay.id}`} style={styles.paymentItem}>
                  <View style={styles.paymentLeft}>
                    <View style={styles.paymentIconCircle}>
                      <Ionicons name="card-outline" size={16} color="#0052FF" />
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
          </ScrollView>
        )}

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
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  quickActionsScroll: {
    gap: 12,
    paddingBottom: 6,
  },
  actionButton: {
    alignItems: 'center',
    width: 78,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
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
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  metricFooterPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0052FF',
  },
  attendanceBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052FF',
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  sectionContainer: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  dueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueInfo: {
    flex: 1,
    marginRight: 10,
  },
  dueMemberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  duePlanText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reminderButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  reminderButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  memberItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemPressed: {
    backgroundColor: '#F8FAFC',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052FF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberPhone: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  memberBadgeCol: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusActiveText: {
    color: '#166534',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  planNameText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  paymentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMemberName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  paymentPlan: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
});
