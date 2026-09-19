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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GymBottomTabBar } from '../../components/GymBottomTabBar';
import { api } from '../../services/api';

export default function GymAttendanceScreen() {
  const router = useRouter();

  // Date selection (default today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total_members: 0,
    present_count: 0,
    absent_count: 0,
    attendance_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);

  // Time Customization Modal
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [targetMember, setTargetMember] = useState<any>(null);
  const [customTime, setCustomTime] = useState('');

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.gym.getAttendance(selectedDate, searchQuery);
      if (res && res.success) {
        setAttendanceList(res.data?.attendance || []);
        if (res.data?.summary) {
          setSummary(res.data.summary);
        }
      } else {
        Alert.alert('Notice', res?.message || 'Could not load attendance.');
      }
    } catch (e) {
      console.warn('Fetch attendance error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate, searchQuery]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleMarkAttendance = async (
    memberId: number,
    newStatus: 'present' | 'absent',
    timeOverride?: string
  ) => {
    setUpdatingMemberId(memberId);
    try {
      const nowTime = timeOverride || new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const res = await api.gym.markAttendance(
        memberId,
        newStatus,
        selectedDate,
        newStatus === 'present' ? nowTime : undefined
      );

      if (res && res.success) {
        // Optimistically update list
        setAttendanceList((prev) =>
          prev.map((item) =>
            item.member_id === memberId
              ? {
                  ...item,
                  status: newStatus,
                  check_in_time: newStatus === 'present' ? nowTime : null,
                }
              : item
          )
        );

        // Recalculate summary stats locally
        setSummary((prev) => {
          const wasPresent = attendanceList.find((m) => m.member_id === memberId)?.status === 'present';
          let pCount = prev.present_count;
          let aCount = prev.absent_count;

          if (newStatus === 'present' && !wasPresent) {
            pCount++;
            aCount = Math.max(0, aCount - 1);
          } else if (newStatus === 'absent' && wasPresent) {
            pCount = Math.max(0, pCount - 1);
            aCount++;
          }

          const total = prev.total_members;
          const rate = total > 0 ? Math.round((pCount / total) * 100) : 0;
          return {
            ...prev,
            present_count: pCount,
            absent_count: aCount,
            attendance_rate: rate,
          };
        });
      } else {
        Alert.alert('Error', res?.message || 'Failed to update attendance.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to record attendance.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleOpenTimeModal = (member: any) => {
    setTargetMember(member);
    setCustomTime(
      member.check_in_time ||
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
    setTimeModalVisible(true);
  };

  const handleSaveCustomTime = async () => {
    if (!targetMember) return;
    setTimeModalVisible(false);
    await handleMarkAttendance(targetMember.member_id, 'present', customTime.trim());
  };

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const isPresent = item.status === 'present';
    const isUpdating = updatingMemberId === item.member_id;

    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <View style={[styles.avatar, isPresent ? styles.avatarPresent : styles.avatarAbsent]}>
            <Text style={[styles.avatarText, isPresent ? styles.avatarTextPresent : styles.avatarTextAbsent]}>
              {item.member_name?.charAt(0).toUpperCase() || 'M'}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.memberName} numberOfLines={1}>
                {item.member_name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  isPresent ? styles.badgePresent : styles.badgeAbsent,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isPresent ? styles.badgeTextPresent : styles.badgeTextAbsent,
                  ]}
                >
                  {isPresent ? 'Present' : 'Absent'}
                </Text>
              </View>
            </View>

            <Text style={styles.memberSub}>
              {item.plan_name || 'General Plan'} • {item.member_mobile}
            </Text>

            {isPresent && item.check_in_time ? (
              <Pressable
                onPress={() => handleOpenTimeModal(item)}
                style={styles.timeTag}
                hitSlop={6}
              >
                <Ionicons name="time-outline" size={13} color="#0052FF" />
                <Text style={styles.timeTagText}>In at {item.check_in_time}</Text>
                <Ionicons name="pencil" size={10} color="#0052FF" style={{ marginLeft: 2 }} />
              </Pressable>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionCol}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#0052FF" style={{ padding: 8 }} />
            ) : isPresent ? (
              <Pressable
                onPress={() => handleMarkAttendance(item.member_id, 'absent')}
                style={({ pressed }) => [styles.markAbsentBtn, pressed && styles.btnPressed]}
              >
                <Ionicons name="close" size={16} color="#DC2626" />
                <Text style={styles.markAbsentText}>Mark Absent</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleMarkAttendance(item.member_id, 'present')}
                style={({ pressed }) => [styles.markPresentBtn, pressed && styles.btnPressed]}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.markPresentText}>Mark Present</Text>
              </Pressable>
            )}
          </View>
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
            <Text style={styles.headerTitle}>Attendance Register</Text>
            <Text style={styles.headerSubtitle}>Daily Member Check-in Log</Text>
          </View>

          {/* Quick Date Indicator */}
          <View style={styles.dateBadge}>
            <Ionicons name="calendar-outline" size={14} color="#0052FF" />
            <Text style={styles.dateBadgeText}>{selectedDate}</Text>
          </View>
        </View>

        {/* Date Filter Tabs */}
        <View style={styles.dateFilterRow}>
          <Pressable
            onPress={() => setSelectedDate(todayStr)}
            style={[styles.datePill, selectedDate === todayStr && styles.datePillActive]}
          >
            <Text style={[styles.datePillText, selectedDate === todayStr && styles.datePillTextActive]}>
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedDate(yesterdayStr)}
            style={[styles.datePill, selectedDate === yesterdayStr && styles.datePillActive]}
          >
            <Text style={[styles.datePillText, selectedDate === yesterdayStr && styles.datePillTextActive]}>
              Yesterday
            </Text>
          </Pressable>

          {selectedDate !== todayStr && selectedDate !== yesterdayStr ? (
            <View style={[styles.datePill, styles.datePillActive]}>
              <Text style={[styles.datePillText, styles.datePillTextActive]}>{selectedDate}</Text>
            </View>
          ) : null}
        </View>

        {/* Attendance Summary Banner */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Members</Text>
              <Text style={styles.statValue}>{summary.total_members}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Present Today</Text>
              <Text style={[styles.statValue, { color: '#16A34A' }]}>{summary.present_count}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Absent</Text>
              <Text style={[styles.statValue, { color: '#DC2626' }]}>{summary.absent_count}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Turnout</Text>
              <Text style={[styles.statValue, { color: '#0052FF' }]}>{summary.attendance_rate}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(summary.present_count > 0 ? 6 : 0, summary.attendance_rate))}%` },
              ]}
            />
          </View>
        </View>

        {/* Member Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search member by name or mobile..."
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

        {/* Attendance List */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading attendance list...</Text>
          </View>
        ) : (
          <FlatList
            data={attendanceList}
            keyExtractor={(item) => String(item.member_id)}
            renderItem={renderAttendanceItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchAttendance();
                }}
                colors={['#0052FF']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Members Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Try searching with a different name or number.'
                    : 'No active members registered in your gym.'}
                </Text>
              </View>
            }
          />
        )}

        {/* Custom Time Modal */}
        <Modal
          visible={timeModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTimeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Edit Check-in Time</Text>
              <Text style={styles.modalSubtitle}>
                Set check-in time for {targetMember?.member_name}
              </Text>

              <TextInput
                style={styles.timeInput}
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="e.g. 06:45 AM"
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.modalBtnRow}>
                <Pressable
                  onPress={() => setTimeModalVisible(false)}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveCustomTime}
                  style={styles.modalConfirmBtn}
                >
                  <Text style={styles.modalConfirmText}>Save Time</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab Navigation */}
        <GymBottomTabBar activeTab="attendance" />
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
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052FF',
  },
  dateFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePillActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  datePillTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 3,
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  avatarPresent: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  avatarAbsent: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatarTextPresent: {
    color: '#16A34A',
  },
  avatarTextAbsent: {
    color: '#64748B',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  badgePresent: {
    backgroundColor: '#DCFCE7',
  },
  badgeAbsent: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  badgeTextPresent: {
    color: '#15803D',
  },
  badgeTextAbsent: {
    color: '#B91C1C',
  },
  memberSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  timeTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0052FF',
  },
  actionCol: {
    marginLeft: 8,
  },
  markPresentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  markPresentText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  markAbsentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  markAbsentText: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
  },
  timeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0052FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
