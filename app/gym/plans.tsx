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

export default function GymPlansScreen() {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState('');
  const [fee, setFee] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.gym.getPlans();
      if (res && res.success && Array.isArray(res.data)) {
        setPlans(res.data);
      }
    } catch (e) {
      console.warn('Fetch plans error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setPlanName('');
    setDuration('1 Month');
    setFee('');
    setStatus('active');
    setFormError('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (plan: any) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setDuration(plan.duration);
    setFee(String(plan.fee));
    setStatus(plan.status);
    setFormError('');
    setModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setFormError('Plan name is required.');
      return;
    }
    if (!duration.trim()) {
      setFormError('Plan duration is required (e.g. 1 Month, 3 Months).');
      return;
    }
    const numericFee = parseFloat(fee);
    if (isNaN(numericFee) || numericFee <= 0) {
      setFormError('Please enter a valid membership fee.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingPlanId) {
        const res = await api.gym.updatePlan(editingPlanId, {
          name: planName.trim(),
          duration: duration.trim(),
          fee: numericFee,
          status,
        });
        if (res && res.success) {
          Alert.alert('Updated', 'Membership plan updated successfully!');
          setModalVisible(false);
          fetchPlans();
        } else {
          setFormError(res?.message || 'Failed to update plan.');
        }
      } else {
        const res = await api.gym.createPlan({
          name: planName.trim(),
          duration: duration.trim(),
          fee: numericFee,
          status,
        });
        if (res && res.success) {
          Alert.alert('Success', 'Membership plan created successfully!');
          setModalVisible(false);
          fetchPlans();
        } else {
          setFormError(res?.message || 'Failed to create plan.');
        }
      }
    } catch (e) {
      setFormError('Failed to communicate with backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = (plan: any) => {
    Alert.alert(
      'Deactivate / Delete Plan',
      `Are you sure you want to deactivate or remove "${plan.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.gym.deletePlan(plan.id);
              if (res && res.success) {
                Alert.alert('Removed', res.message || 'Plan removed.');
                fetchPlans();
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete plan.');
            }
          },
        },
      ]
    );
  };

  const renderPlanItem = ({ item }: { item: any }) => (
    <View style={styles.planCard}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.planIcon}>
            <Ionicons name="layers" size={20} color="#0052FF" />
          </View>
          <View>
            <Text style={styles.planTitle}>{item.name}</Text>
            <Text style={styles.planDuration}>{item.duration}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            item.status === 'active' ? styles.statusPillActive : styles.statusPillInactive,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              item.status === 'active' ? styles.statusActiveText : styles.statusInactiveText,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View>
          <Text style={styles.feeLabel}>Membership Fee</Text>
          <Text style={styles.feeValue}>₹{Number(item.fee).toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.memberBadge}>
          <Ionicons name="people-outline" size={14} color="#0052FF" />
          <Text style={styles.memberBadgeText}>
            {item.active_members_count ?? 0} Enrolled Members
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => handleOpenEditModal(item)}
          style={styles.editActionBtn}
        >
          <Ionicons name="create-outline" size={16} color="#0052FF" />
          <Text style={styles.editActionText}>Edit Plan</Text>
        </Pressable>

        <Pressable
          onPress={() => handleDeletePlan(item)}
          style={styles.deleteActionBtn}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
          <Text style={styles.deleteActionText}>Deactivate</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Membership Plans</Text>
            <Text style={styles.headerSubtitle}>Manage gym packages & fees</Text>
          </View>

          <Pressable
            onPress={handleOpenAddModal}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Plan</Text>
          </Pressable>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Plans...</Text>
          </View>
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPlanItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchPlans();
                }}
                colors={['#0052FF']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="layers-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Plans Available</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first membership plan (e.g. Monthly, Quarterly, Yearly).
                </Text>
              </View>
            }
          />
        )}

        {/* Add / Edit Plan Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingPlanId ? 'Edit Membership Plan' : 'Create Membership Plan'}
                </Text>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </Pressable>
              </View>

              {formError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <View style={styles.formContent}>
                <Text style={styles.inputLabel}>Plan Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Monthly Standard, Annual Pro"
                  value={planName}
                  onChangeText={setPlanName}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>Duration *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 1 Month, 3 Months, 12 Months"
                  value={duration}
                  onChangeText={setDuration}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>Fee Amount (₹) *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 1500"
                  value={fee}
                  onChangeText={setFee}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusToggleRow}>
                  <Pressable
                    onPress={() => setStatus('active')}
                    style={[
                      styles.statusToggleBtn,
                      status === 'active' && styles.statusToggleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusToggleText,
                        status === 'active' && styles.statusToggleTextActive,
                      ]}
                    >
                      Active
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setStatus('inactive')}
                    style={[
                      styles.statusToggleBtn,
                      status === 'inactive' && styles.statusToggleInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusToggleText,
                        status === 'inactive' && styles.statusToggleTextInactive,
                      ]}
                    >
                      Inactive
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleSavePlan}
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
                    <Text style={styles.submitButtonText}>
                      {editingPlanId ? 'Save Changes' : 'Create Plan'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab Bar */}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  planDuration: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPillInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statusActiveText: {
    color: '#15803D',
  },
  statusInactiveText: {
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  feeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0052FF',
    marginTop: 2,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0052FF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  editActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052FF',
  },
  deleteActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyContainer: {
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  errorText: {
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
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statusToggleActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  statusToggleInactive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusToggleTextActive: {
    color: '#166534',
    fontWeight: '700',
  },
  statusToggleTextInactive: {
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
