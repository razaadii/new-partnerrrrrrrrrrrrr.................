import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../services/api';

export default function GymMemberDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const memberId = Number(params.id || 1);

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'attendance'>('payments');
  const [reminderSending, setReminderSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.gym.getMember(memberId);
      if (res && res.success) {
        setMember(res.data);
      } else {
        Alert.alert('Error', res?.message || 'Failed to load member profile.');
      }
    } catch (e) {
      console.warn('Fetch member detail error:', e);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const handleSendReminder = async () => {
    setReminderSending(true);
    try {
      const res = await api.gym.sendReminder(memberId);
      if (res && res.success) {
        Alert.alert('Reminder Recorded', `Fee reminder sent to ${member.name}.`);
      } else {
        Alert.alert('Notice', res?.message || 'Could not record reminder.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send reminder.');
    } finally {
      setReminderSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!member) return;
    const newStatus = member.status === 'active' ? 'inactive' : 'active';

    Alert.alert(
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} Member`,
      `Are you sure you want to mark ${member.name} as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: newStatus === 'inactive' ? 'destructive' : 'default',
          onPress: async () => {
            setStatusUpdating(true);
            try {
              const res = await api.gym.updateMember(memberId, { status: newStatus });
              if (res && res.success) {
                setMember((prev: any) => ({ ...prev, status: newStatus }));
                Alert.alert('Updated', `Member status changed to ${newStatus}.`);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to update member status.');
            } finally {
              setStatusUpdating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0052FF" />
        <Text style={styles.loadingText}>Loading Member Profile...</Text>
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Member Not Found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const payments = member.payments || [];
  const attendance = member.attendance || [];
  const attSummary = member.attendance_summary || { total_logged: 0, present_days: 0, absent_days: 0 };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBackBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Member Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarInitial}>{member.name.charAt(0).toUpperCase()}</Text>
            </View>

            <Text style={styles.memberName}>{member.name}</Text>
            <View
              style={[
                styles.statusBadge,
                member.status === 'active' ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  member.status === 'active' ? styles.statusActiveText : styles.statusInactiveText,
                ]}
              >
                {member.status === 'active' ? '● Active Member' : '○ Inactive'}
              </Text>
            </View>

            {/* Contact Details */}
            <View style={styles.contactDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#0052FF" />
                <Text style={styles.detailLabel}>Mobile:</Text>
                <Text style={styles.detailValue}>{member.mobile}</Text>
              </View>

              {member.email ? (
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color="#0052FF" />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{member.email}</Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#0052FF" />
                <Text style={styles.detailLabel}>Joined:</Text>
                <Text style={styles.detailValue}>{member.joining_date}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                onPress={handleSendReminder}
                disabled={reminderSending}
                style={styles.actionPill}
              >
                {reminderSending ? (
                  <ActivityIndicator size="small" color="#0052FF" />
                ) : (
                  <>
                    <Ionicons name="notifications-outline" size={15} color="#0052FF" />
                    <Text style={styles.actionPillText}>Send Reminder</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleToggleStatus}
                disabled={statusUpdating}
                style={[
                  styles.actionPill,
                  member.status === 'active' ? styles.actionPillDanger : styles.actionPillSuccess,
                ]}
              >
                <Text
                  style={[
                    styles.actionPillText,
                    member.status === 'active' ? styles.actionPillTextDanger : styles.actionPillTextSuccess,
                  ]}
                >
                  {member.status === 'active' ? 'Deactivate' : 'Activate'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Membership Plan Info Card */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planLabel}>Active Membership Plan</Text>
                <Text style={styles.planTitle}>{member.plan_name || 'Standard Plan'}</Text>
              </View>
              <Text style={styles.planFee}>
                ₹{Number(member.plan_fee || 1500).toLocaleString('en-IN')}
              </Text>
            </View>
            <Text style={styles.planDuration}>Duration: {member.plan_duration || '1 Month'}</Text>
          </View>

          {/* Attendance Stats Micro-Bar */}
          <View style={styles.attendanceBarCard}>
            <Text style={styles.cardHeaderSmall}>Attendance Summary</Text>
            <View style={styles.attStatsRow}>
              <View style={styles.attStatBox}>
                <Text style={styles.attStatNum}>{attSummary.total_logged}</Text>
                <Text style={styles.attStatLbl}>Days Tracked</Text>
              </View>
              <View style={styles.attStatDivider} />
              <View style={styles.attStatBox}>
                <Text style={[styles.attStatNum, { color: '#16A34A' }]}>{attSummary.present_days}</Text>
                <Text style={styles.attStatLbl}>Present</Text>
              </View>
              <View style={styles.attStatDivider} />
              <View style={styles.attStatBox}>
                <Text style={[styles.attStatNum, { color: '#DC2626' }]}>{attSummary.absent_days}</Text>
                <Text style={styles.attStatLbl}>Absent</Text>
              </View>
            </View>
          </View>

          {/* Tab Navigation: Payments vs Attendance History */}
          <View style={styles.tabHeaderRow}>
            <Pressable
              onPress={() => setActiveTab('payments')}
              style={[styles.historyTab, activeTab === 'payments' && styles.historyTabActive]}
            >
              <Text
                style={[
                  styles.historyTabText,
                  activeTab === 'payments' && styles.historyTabTextActive,
                ]}
              >
                Payment History ({payments.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('attendance')}
              style={[styles.historyTab, activeTab === 'attendance' && styles.historyTabActive]}
            >
              <Text
                style={[
                  styles.historyTabText,
                  activeTab === 'attendance' && styles.historyTabTextActive,
                ]}
              >
                Attendance Log ({attendance.length})
              </Text>
            </Pressable>
          </View>

          {/* Tab 1: Payment History */}
          {activeTab === 'payments' && (
            <View style={styles.historyList}>
              {payments.length === 0 ? (
                <Text style={styles.emptyText}>No payment records available.</Text>
              ) : (
                payments.map((p: any) => (
                  <View key={`pay-${p.id}`} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View style={styles.historyIcon}>
                        <Ionicons name="card-outline" size={16} color="#0052FF" />
                      </View>
                      <View>
                        <Text style={styles.historyItemTitle}>₹{Number(p.amount).toLocaleString('en-IN')}</Text>
                        <Text style={styles.historyItemSub}>
                          {p.payment_date} • {p.payment_method || 'UPI'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.payStatusChip,
                        p.status === 'paid' ? styles.payStatusPaid : styles.payStatusDue,
                      ]}
                    >
                      <Text
                        style={[
                          styles.payStatusChipText,
                          p.status === 'paid' ? styles.payStatusPaidText : styles.payStatusDueText,
                        ]}
                      >
                        {p.status}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Tab 2: Attendance History */}
          {activeTab === 'attendance' && (
            <View style={styles.historyList}>
              {attendance.length === 0 ? (
                <Text style={styles.emptyText}>No attendance records recorded yet.</Text>
              ) : (
                attendance.map((a: any) => (
                  <View key={`att-${a.id}`} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <View
                        style={[
                          styles.historyIcon,
                          a.status === 'present' ? { backgroundColor: '#DCFCE7' } : { backgroundColor: '#FEE2E2' },
                        ]}
                      >
                        <Ionicons
                          name={a.status === 'present' ? 'checkmark' : 'close'}
                          size={16}
                          color={a.status === 'present' ? '#16A34A' : '#DC2626'}
                        />
                      </View>
                      <View>
                        <Text style={styles.historyItemTitle}>{a.attendance_date}</Text>
                        <Text style={styles.historyItemSub}>
                          {a.check_in_time ? `Check-in: ${a.check_in_time}` : 'No check-in'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.attStatusText,
                        a.status === 'present' ? { color: '#16A34A' } : { color: '#DC2626' },
                      ]}
                    >
                      {a.status === 'present' ? 'Present' : 'Absent'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#0052FF',
    borderRadius: 8,
    marginTop: 12,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0052FF',
    marginBottom: 10,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0052FF',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: '#15803D',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  contactDetails: {
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    width: '100%',
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052FF',
  },
  actionPillDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  actionPillTextDanger: {
    color: '#DC2626',
  },
  actionPillSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  actionPillTextSuccess: {
    color: '#16A34A',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  planFee: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0052FF',
  },
  planDuration: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  attendanceBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  attStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  attStatBox: {
    alignItems: 'center',
  },
  attStatNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  attStatLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  attStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabHeaderRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  historyTabActive: {
    backgroundColor: '#0052FF',
  },
  historyTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  historyTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  historyList: {
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  payStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  payStatusPaid: {
    backgroundColor: '#DCFCE7',
  },
  payStatusDue: {
    backgroundColor: '#FEE2E2',
  },
  payStatusChipText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  payStatusPaidText: {
    color: '#166534',
  },
  payStatusDueText: {
    color: '#991B1B',
  },
  attStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
