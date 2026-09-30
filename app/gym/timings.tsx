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
import { ThemedAlert } from '../../components/ThemedAlert';
import { ThemedBottomSheet } from '../../components/ThemedBottomSheet';
import { api } from '../../services/api';

export default function GymTimingsScreen() {
  const router = useRouter();

  const initialTimings = api.gym.getInitialTimings().data;
  const [timings, setTimings] = useState<any[]>(() => initialTimings.slots);
  const [openingTime, setOpeningTime] = useState(() => initialTimings.opening_time);
  const [closingTime, setClosingTime] = useState(() => initialTimings.closing_time);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Slot Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // General Hours Modal State
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  const [editOpenTime, setEditOpenTime] = useState('');
  const [editCloseTime, setEditCloseTime] = useState('');
  const [savingHours, setSavingHours] = useState(false);

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

  const fetchTimings = useCallback(async () => {
    try {
      const res = await api.gym.getTimings();
      if (res && res.success) {
        setTimings(res.data?.slots || []);
        if (res.data?.opening_time) setOpeningTime(res.data.opening_time);
        if (res.data?.closing_time) setClosingTime(res.data.closing_time);
      }
    } catch (e) {
      console.warn('Fetch timings error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTimings();
  }, [fetchTimings]);

  const handleOpenAddModal = () => {
    setEditingSlotId(null);
    setLabel('');
    setStartTime('06:00 AM');
    setEndTime('08:00 AM');
    setStatus('active');
    setFormError('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (slot: any) => {
    setEditingSlotId(slot.id);
    setLabel(slot.label);
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setStatus(slot.status);
    setFormError('');
    setModalVisible(true);
  };

  const handleSaveSlot = async () => {
    if (!label.trim()) {
      setFormError('Slot label/name is required (e.g. Morning Batch).');
      return;
    }
    if (!startTime.trim() || !endTime.trim()) {
      setFormError('Both start time and end time are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (editingSlotId) {
        const res = await api.gym.updateTiming(editingSlotId, {
          label: label.trim(),
          start_time: startTime.trim(),
          end_time: endTime.trim(),
          status,
        });

        if (res && res.success) {
          setModalVisible(false);
          showAlert('success', 'Slot Updated', 'Timing slot updated successfully!');
          fetchTimings();
        } else {
          setFormError(res?.message || 'Failed to update slot.');
        }
      } else {
        const res = await api.gym.createTiming({
          label: label.trim(),
          start_time: startTime.trim(),
          end_time: endTime.trim(),
          status,
        });

        if (res && res.success) {
          setModalVisible(false);
          showAlert('success', 'Slot Added', 'Timing slot added successfully!');
          fetchTimings();
        } else {
          setFormError(res?.message || 'Failed to add slot.');
        }
      }
    } catch (e) {
      setFormError('Failed to communicate with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = (slot: any) => {
    showAlert(
      'danger',
      'Remove Slot Timing',
      `Are you sure you want to remove "${slot.label}"?`,
      async () => {
        try {
          const res = await api.gym.deleteTiming(slot.id);
          if (res && res.success) {
            showAlert('success', 'Slot Removed', 'Timing slot removed.');
            fetchTimings();
          } else {
            showAlert('warning', 'Notice', res?.message || 'Failed to remove slot.');
          }
        } catch (e) {
          showAlert('danger', 'Error', 'Failed to remove slot.');
        }
      },
      true,
      'Remove',
      'Cancel'
    );
  };

  const handleOpenHoursModal = () => {
    setEditOpenTime(openingTime);
    setEditCloseTime(closingTime);
    setHoursModalVisible(true);
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const bizRes = await api.gym.getBusiness();
      const currentBiz = bizRes?.data || {};

      const res = await api.gym.updateBusiness({
        gym_name: currentBiz.gym_name || 'SlotB Fitness',
        address: currentBiz.address || 'Begusarai',
        description: currentBiz.description,
        admission_info: currentBiz.admission_info,
        opening_time: editOpenTime.trim(),
        closing_time: editCloseTime.trim(),
      });

      if (res && res.success) {
        setOpeningTime(editOpenTime.trim());
        setClosingTime(editCloseTime.trim());
        setHoursModalVisible(false);
        showAlert('success', 'Hours Updated', 'Gym operating hours updated!');
      } else {
        showAlert('warning', 'Notice', res?.message || 'Could not update hours.');
      }
    } catch (e) {
      showAlert('danger', 'Error', 'Failed to update gym hours.');
    } finally {
      setSavingHours(false);
    }
  };

  const renderSlotItem = ({ item }: { item: any }) => {
    const isActive = item.status === 'active';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.slotLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={20} color="#0052FF" />
            </View>
            <View>
              <Text style={styles.slotTitle}>{item.label}</Text>
              <Text style={styles.slotDuration}>
                {item.start_time} - {item.end_time}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              isActive ? styles.statusPillActive : styles.statusPillInactive,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                isActive ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardActions}>
          <Pressable
            onPress={() => handleOpenEditModal(item)}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          >
            <Ionicons name="pencil" size={14} color="#0052FF" />
            <Text style={styles.actionBtnText}>Edit Slot</Text>
          </Pressable>

          <Pressable
            onPress={() => handleDeleteSlot(item)}
            style={({ pressed }) => [styles.actionBtnDanger, pressed && styles.actionBtnPressed]}
          >
            <Ionicons name="trash-outline" size={14} color="#DC2626" />
            <Text style={styles.actionBtnTextDanger}>Delete</Text>
          </Pressable>
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
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Gym Timings & Slots</Text>
            <Text style={styles.headerSubtitle}>{timings.length} Configured Batches</Text>
          </View>
          <Pressable
            onPress={handleOpenAddModal}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Slot</Text>
          </Pressable>
        </View>

        {/* General Gym Business Hours Card */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursLeft}>
            <View style={styles.sunIcon}>
              <Ionicons name="sunny-outline" size={22} color="#D97706" />
            </View>
            <View>
              <Text style={styles.hoursLabel}>General Operating Hours</Text>
              <Text style={styles.hoursValue}>
                {openingTime} — {closingTime}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleOpenHoursModal}
            style={({ pressed }) => [styles.editHoursBtn, pressed && styles.actionBtnPressed]}
          >
            <Ionicons name="settings-outline" size={14} color="#0052FF" />
            <Text style={styles.editHoursText}>Edit Hours</Text>
          </Pressable>
        </View>

        {/* Timings List */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading timings...</Text>
          </View>
        ) : (
          <FlatList
            style={styles.flex1}
            data={timings}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderSlotItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchTimings();
                }}
                colors={['#0052FF']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="time-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Slot Batches Found</Text>
                <Text style={styles.emptySubtitle}>
                  Tap "Add Slot" above to create batches like Morning, Women Only, or Evening Peak hours.
                </Text>
              </View>
            }
          />
        )}

        {/* Add/Edit Slot Themed Bottom Sheet */}
        <ThemedBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={editingSlotId ? 'Edit Timing Slot' : 'Add New Timing Slot'}
          subtitle="Configure batch name, operating times, and status"
          icon="time-outline"
          iconColor="#0052FF"
          maxHeight="85%"
        >
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {formError ? (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.modalErrorText}>{formError}</Text>
              </View>
            ) : null}

            {/* Batch Name */}
            <Text style={styles.inputLabel}>Batch / Slot Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Early Birds Batch, Evening Peak"
              value={label}
              onChangeText={setLabel}
              placeholderTextColor="#94A3B8"
            />

            {/* Start & End Times */}
            <View style={styles.dualRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Time *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 06:00 AM"
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Time *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 08:00 AM"
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Status Toggle */}
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusToggleRow}>
              <Pressable
                onPress={() => setStatus('active')}
                style={[styles.statusToggleBtn, status === 'active' && styles.statusToggleActive]}
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
                style={[styles.statusToggleBtn, status === 'inactive' && styles.statusToggleInactive]}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    status === 'inactive' && styles.statusToggleTextActive,
                  ]}
                >
                  Inactive
                </Text>
              </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSaveSlot}
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
                  {editingSlotId ? 'Save Changes' : 'Create Timing Slot'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </ThemedBottomSheet>

        {/* Edit General Hours Themed Bottom Sheet */}
        <ThemedBottomSheet
          visible={hoursModalVisible}
          onClose={() => setHoursModalVisible(false)}
          title="Edit Operating Hours"
          subtitle="Set general daily gym opening & closing timings"
          icon="business-outline"
          iconColor="#0052FF"
          maxHeight="60%"
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}>
            <Text style={styles.inputLabel}>Gym Opening Time</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 06:00 AM"
              value={editOpenTime}
              onChangeText={setEditOpenTime}
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Gym Closing Time</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 10:00 PM"
              value={editCloseTime}
              onChangeText={setEditCloseTime}
              placeholderTextColor="#94A3B8"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable
                onPress={() => setHoursModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveHours}
                disabled={savingHours}
                style={styles.confirmBtn}
              >
                {savingHours ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Save Hours</Text>
                )}
              </Pressable>
            </View>
          </View>
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
  backBtn: {
    marginRight: 8,
  },
  headerTitleCol: {
    flex: 1,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0052FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnPressed: {
    backgroundColor: '#0046E0',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
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
  hoursLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sunIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  editHoursBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editHoursText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  slotTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  slotDuration: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
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
  statusTextActive: {
    color: '#15803D',
  },
  statusTextInactive: {
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  actionBtnTextDanger: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionBtnPressed: {
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
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
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
  dualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusToggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  statusToggleInactive: {
    backgroundColor: '#64748B',
    borderColor: '#64748B',
  },
  statusToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  statusToggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  // Center Modal (Hours)
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBoxCenter: {
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
  hoursBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#0052FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
