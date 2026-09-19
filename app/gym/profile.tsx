import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { api, API_BASE_URL } from '../../services/api';

export default function GymProfileScreen() {
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Edit Business Profile Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [gymName, setGymName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [admissionInfo, setAdmissionInfo] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [latitude, setLatitude] = useState('25.4182');
  const [longitude, setLongitude] = useState('86.1272');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [bizRes, partnerData] = await Promise.all([
        api.gym.getBusiness(),
        api.getCurrentPartner() || (await api.getMe())?.data?.partner,
      ]);

      if (bizRes && bizRes.success) {
        setBusiness(bizRes.data);
      }
      if (partnerData) {
        setPartner(partnerData);
      }
    } catch (e) {
      console.warn('Fetch gym profile error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEditModal = () => {
    if (business) {
      setGymName(business.gym_name || '');
      setAddress(business.address || '');
      setDescription(business.description || '');
      setAdmissionInfo(business.admission_info || '');
      setOpeningTime(business.opening_time || '06:00 AM');
      setClosingTime(business.closing_time || '10:00 PM');
      setLatitude(String(business.latitude || '25.4182'));
      setLongitude(String(business.longitude || '86.1272'));
      setFormError('');
      setModalVisible(true);
    }
  };

  const handleSaveBusiness = async () => {
    if (!gymName.trim()) {
      setFormError('Gym name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Gym address is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const res = await api.gym.updateBusiness({
        gym_name: gymName.trim(),
        address: address.trim(),
        description: description.trim() || undefined,
        admission_info: admissionInfo.trim() || undefined,
        opening_time: openingTime.trim() || undefined,
        closing_time: closingTime.trim() || undefined,
        latitude: parseFloat(latitude) || 25.4182,
        longitude: parseFloat(longitude) || 86.1272,
      });

      if (res && res.success) {
        setBusiness(res.data);
        setModalVisible(false);
        Alert.alert('Success', 'Gym business details updated successfully!');
      } else {
        setFormError(res?.message || 'Failed to update gym profile.');
      }
    } catch (e) {
      setFormError('Failed to communicate with server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Gym Partner account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await api.logout();
            } catch (e) {
              // Ignore
            } finally {
              setLoggingOut(false);
              router.replace('/login' as any);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gym Business Profile</Text>
          <Pressable
            onPress={handleOpenEditModal}
            style={({ pressed }) => [styles.editBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="create-outline" size={16} color="#0052FF" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Gym Profile...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchProfile();
                }}
                colors={['#0052FF']}
              />
            }
          >
            {/* Partner / Gym Identity Card */}
            <View style={styles.identityCard}>
              <View style={styles.avatarRow}>
                <View style={styles.avatarBox}>
                  <Ionicons name="barbell" size={26} color="#0052FF" />
                </View>

                <View style={styles.avatarTextCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.gymTitle}>{business?.gym_name || 'SlotB Fitness'}</Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                      <Text style={styles.verifiedText}>Verified Partner</Text>
                    </View>
                  </View>
                  <Text style={styles.partnerName}>
                    Owner: {partner?.name || 'Vikram Rathore'}
                  </Text>
                  <Text style={styles.partnerLoginId}>ID: {partner?.login_id || '123@gym'}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.ratingRow}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={16} color="#EAB308" />
                  <Text style={styles.ratingScore}>{partner?.rating || '4.92'}</Text>
                  <Text style={styles.ratingCount}>(64 Reviews)</Text>
                </View>

                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>Gym Partner Account</Text>
                </View>
              </View>
            </View>

            {/* Business Details Section */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>Business Details</Text>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#0052FF" style={styles.rowIcon} />
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Address</Text>
                  <Text style={styles.rowValue}>{business?.address || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#0052FF" style={styles.rowIcon} />
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Operating Hours</Text>
                  <Text style={styles.rowValue}>
                    {business?.opening_time || '06:00 AM'} - {business?.closing_time || '10:00 PM'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="map-outline" size={18} color="#0052FF" style={styles.rowIcon} />
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>GPS Coordinates</Text>
                  <Text style={styles.rowValue}>
                    Lat: {business?.latitude || '25.4182'}, Lng: {business?.longitude || '86.1272'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#0052FF"
                  style={styles.rowIcon}
                />
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>About Gym</Text>
                  <Text style={styles.rowValue}>
                    {business?.description || 'Premier air-conditioned fitness center equipped with modern strength machines.'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#0052FF"
                  style={styles.rowIcon}
                />
                <View style={styles.rowTextCol}>
                  <Text style={styles.rowLabel}>Admission & Joining Information</Text>
                  <Text style={styles.rowValue}>
                    {business?.admission_info || 'One-time registration fee: ₹200. Government ID proof required.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Management Shortcuts */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>Gym Operations Shortcuts</Text>

              <Pressable
                onPress={() => router.push('/gym/plans' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="layers" size={18} color="#9333EA" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Membership Plans</Text>
                  <Text style={styles.shortcutSub}>Monthly, Quarterly, Annual packages</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/timings' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="time" size={18} color="#0284C7" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Timings & Slot Batches</Text>
                  <Text style={styles.shortcutSub}>Configure morning, women & evening hours</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/members' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="people" size={18} color="#0052FF" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Member Directory</Text>
                  <Text style={styles.shortcutSub}>Registered gym members & histories</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/attendance' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark-done" size={18} color="#16A34A" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Attendance Register</Text>
                  <Text style={styles.shortcutSub}>Check-in log & daily turnout</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/gym/payments' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="wallet" size={18} color="#D97706" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Fee Payments & Dues</Text>
                  <Text style={styles.shortcutSub}>Track collections & send reminders</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Server Connection Info Card */}
            <View style={styles.connCard}>
              <View style={styles.connHeader}>
                <Ionicons name="server-outline" size={16} color="#0052FF" />
                <Text style={styles.connTitle}>Backend API Configuration</Text>
              </View>
              <Text style={styles.connUrl}>{API_BASE_URL}</Text>
              <Text style={styles.connTip}>
                For Expo Go on mobile, verify your phone and laptop are on the same Wi-Fi and the LAN IP in services/api.ts is correct.
              </Text>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
            >
              {loggingOut ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                  <Text style={styles.logoutBtnText}>Log Out of SlotB Partner</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        )}

        {/* Edit Business Profile Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Gym Business Profile</Text>
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

              <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
                {/* Gym Name */}
                <Text style={styles.inputLabel}>Gym Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. SlotB Fitness & Crossfit"
                  value={gymName}
                  onChangeText={setGymName}
                  placeholderTextColor="#94A3B8"
                />

                {/* Address */}
                <Text style={styles.inputLabel}>Complete Physical Address *</Text>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput]}
                  placeholder="Street, Landmark, City, State, PIN"
                  value={address}
                  onChangeText={setAddress}
                  multiline={true}
                  numberOfLines={2}
                  placeholderTextColor="#94A3B8"
                />

                {/* Operating Hours */}
                <View style={styles.dualRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Opening Time</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 06:00 AM"
                      value={openingTime}
                      onChangeText={setOpeningTime}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Closing Time</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 10:00 PM"
                      value={closingTime}
                      onChangeText={setClosingTime}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* GPS Coordinates */}
                <View style={styles.dualRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Latitude</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 25.4182"
                      value={latitude}
                      onChangeText={setLatitude}
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Longitude</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. 86.1272"
                      value={longitude}
                      onChangeText={setLongitude}
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.inputLabel}>Gym Description & Amenities</Text>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput]}
                  placeholder="Highlights, equipment, cardio/strength zones..."
                  value={description}
                  onChangeText={setDescription}
                  multiline={true}
                  numberOfLines={3}
                  placeholderTextColor="#94A3B8"
                />

                {/* Admission Info */}
                <Text style={styles.inputLabel}>Admission / Joining Rules</Text>
                <TextInput
                  style={[styles.modalInput, styles.multilineInput]}
                  placeholder="Registration fee, locker rules, dress code..."
                  value={admissionInfo}
                  onChangeText={setAdmissionInfo}
                  multiline={true}
                  numberOfLines={2}
                  placeholderTextColor="#94A3B8"
                />

                {/* Save Button */}
                <Pressable
                  onPress={handleSaveBusiness}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.submitButtonPressed,
                    saving && styles.submitButtonDisabled,
                  ]}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Save Changes</Text>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
        <GymBottomTabBar activeTab="profile" />
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
  editBtn: {
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
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  btnPressed: {
    opacity: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  identityCard: {
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
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarTextCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  partnerName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  partnerLoginId: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  ratingCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  badgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0052FF',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rowIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  rowTextCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
    lineHeight: 18,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowPressed: {
    backgroundColor: '#F8FAFC',
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shortcutTextCol: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  shortcutSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  connCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  connHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  connTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  connUrl: {
    fontSize: 11.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0052FF',
    marginBottom: 4,
  },
  connTip: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 48,
    borderRadius: 12,
  },
  logoutBtnPressed: {
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 13.5,
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
  multilineInput: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  dualRow: {
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
