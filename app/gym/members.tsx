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

export default function GymMembersScreen() {
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'due'>('all');

  // Add Member Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [memberStatus, setMemberStatus] = useState('active');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [formError, setFormError] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.gym.getMembers({
        q: searchQuery,
        status: activeFilter === 'all' ? undefined : activeFilter,
      });
      if (res && res.success) {
        setMembers(res.data?.members || []);
      }
    } catch (e) {
      console.warn('Fetch members error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Load plans for the Add Member modal
  const loadPlans = async () => {
    try {
      const res = await api.gym.getPlans();
      if (res && res.success && Array.isArray(res.data)) {
        setPlans(res.data);
        if (res.data.length > 0 && !selectedPlanId) {
          setSelectedPlanId(res.data[0].id);
        }
      }
    } catch (e) {
      console.warn('Load plans error:', e);
    }
  };

  const handleOpenAddModal = () => {
    setName('');
    setMobile('');
    setEmail('');
    setFormError('');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    loadPlans();
    setModalVisible(true);
  };

  const handleCreateMember = async () => {
    if (!name.trim()) {
      setFormError('Member name is required.');
      return;
    }
    if (!mobile.trim()) {
      setFormError('Mobile number is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await api.gym.createMember({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        joining_date: joiningDate,
        plan_id: selectedPlanId || undefined,
        status: memberStatus,
        payment_status: paymentStatus,
      });

      if (res && res.success) {
        setModalVisible(false);
        Alert.alert('Success', `Member ${name} added successfully!`);
        fetchMembers();
      } else {
        setFormError(res?.message || 'Failed to add member.');
      }
    } catch (e) {
      setFormError('Failed to connect to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderMemberItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`/gym/member-detail?id=${item.id}` as any)}
      style={({ pressed }) => [styles.memberCard, pressed && styles.cardPressed]}
    >
      <View style={styles.cardMain}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameLine}>
            <Text style={styles.memberName} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'active' ? styles.badgeActive : styles.badgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === 'active' ? styles.statusActiveText : styles.statusInactiveText,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.memberContact}>
            <Ionicons name="call-outline" size={12} color="#64748B" /> {item.mobile}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.planPill}>
              <Ionicons name="barbell-outline" size={11} color="#0052FF" />
              <Text style={styles.planPillText}>{item.plan_name || 'No Plan'}</Text>
            </View>
            <Text style={styles.joinDateText}>Joined: {item.joining_date}</Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <View
            style={[
              styles.paymentBadge,
              item.last_payment_status === 'paid' ? styles.paymentPaid : styles.paymentDue,
            ]}
          >
            <Text
              style={[
                styles.paymentBadgeText,
                item.last_payment_status === 'paid' ? styles.paymentPaidText : styles.paymentDueText,
              ]}
            >
              {item.last_payment_status === 'paid' ? 'Paid' : 'Fee Due'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={{ marginTop: 12 }} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Gym Members</Text>
            <Text style={styles.headerSubtitle}>{members.length} Total Registered</Text>
          </View>

          <Pressable
            onPress={handleOpenAddModal}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Member</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or mobile number..."
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
          {(['all', 'active', 'due', 'inactive'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            const labels = { all: 'All', active: 'Active', due: 'Fee Due', inactive: 'Inactive' };
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

        {/* Members List */}
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Members...</Text>
          </View>
        ) : (
          <FlatList
            data={members}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchMembers();
                }}
                colors={['#0052FF']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Members Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search query' : 'Tap "Add Member" to register your first gym member.'}
                </Text>
              </View>
            }
          />
        )}

        {/* Add Member Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Member</Text>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>

              {formError ? (
                <View style={styles.modalErrorBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.modalErrorText}>{formError}</Text>
                </View>
              ) : null}

              <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={
                  <View style={styles.formContent}>
                    {/* Full Name */}
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChangeText={setName}
                      placeholderTextColor="#94A3B8"
                    />

                    {/* Mobile Number */}
                    <Text style={styles.inputLabel}>Mobile Number *</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. +91 98765 43210"
                      value={mobile}
                      onChangeText={setMobile}
                      keyboardType="phone-pad"
                      placeholderTextColor="#94A3B8"
                    />

                    {/* Email */}
                    <Text style={styles.inputLabel}>Email Address (Optional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#94A3B8"
                    />

                    {/* Joining Date */}
                    <Text style={styles.inputLabel}>Joining Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={joiningDate}
                      onChangeText={setJoiningDate}
                      placeholderTextColor="#94A3B8"
                    />

                    {/* Select Membership Plan */}
                    <Text style={styles.inputLabel}>Membership Plan</Text>
                    <View style={styles.planSelector}>
                      {plans.map((p) => (
                        <Pressable
                          key={`sel-${p.id}`}
                          onPress={() => setSelectedPlanId(p.id)}
                          style={[
                            styles.planOption,
                            selectedPlanId === p.id && styles.planOptionActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.planOptionTitle,
                              selectedPlanId === p.id && styles.planOptionTitleActive,
                            ]}
                          >
                            {p.name}
                          </Text>
                          <Text
                            style={[
                              styles.planOptionFee,
                              selectedPlanId === p.id && styles.planOptionFeeActive,
                            ]}
                          >
                            ₹{Number(p.fee).toLocaleString('en-IN')}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Initial Payment Status */}
                    <Text style={styles.inputLabel}>Initial Payment</Text>
                    <View style={styles.rowToggle}>
                      <Pressable
                        onPress={() => setPaymentStatus('paid')}
                        style={[
                          styles.toggleBtn,
                          paymentStatus === 'paid' && styles.toggleBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            paymentStatus === 'paid' && styles.toggleTextActive,
                          ]}
                        >
                          Paid (Active Receipt)
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setPaymentStatus('due')}
                        style={[
                          styles.toggleBtn,
                          paymentStatus === 'due' && styles.toggleBtnActiveDue,
                        ]}
                      >
                        <Text
                          style={[
                            styles.toggleText,
                            paymentStatus === 'due' && styles.toggleTextActiveDue,
                          ]}
                        >
                          Mark as Due
                        </Text>
                      </Pressable>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                      onPress={handleCreateMember}
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
                        <Text style={styles.submitButtonText}>Save & Register Member</Text>
                      )}
                    </Pressable>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Bottom Tab Bar */}
        <GymBottomTabBar activeTab="members" />
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0052FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonPressed: {
    backgroundColor: '#0046E0',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
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
    marginBottom: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
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
    paddingTop: 6,
    paddingBottom: 24,
  },
  memberCard: {
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
  cardPressed: {
    backgroundColor: '#F8FAFC',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0052FF',
  },
  infoCol: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusActiveText: {
    color: '#15803D',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  memberContact: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  planPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0052FF',
  },
  joinDateText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentPaid: {
    backgroundColor: '#DCFCE7',
  },
  paymentDue: {
    backgroundColor: '#FEE2E2',
  },
  paymentBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  paymentPaidText: {
    color: '#166534',
  },
  paymentDueText: {
    color: '#B91C1C',
  },
  centerBox: {
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
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  planSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  planOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    minWidth: '47%',
  },
  planOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0052FF',
  },
  planOptionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  planOptionTitleActive: {
    color: '#0052FF',
  },
  planOptionFee: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  planOptionFeeActive: {
    color: '#0052FF',
  },
  rowToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  toggleBtnActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  toggleBtnActiveDue: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleTextActive: {
    color: '#166534',
    fontWeight: '700',
  },
  toggleTextActiveDue: {
    color: '#991B1B',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#0052FF',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
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
