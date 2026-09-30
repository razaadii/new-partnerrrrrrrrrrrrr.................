import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GymBottomTabBar } from '../../components/GymBottomTabBar';
import { ThemedAlert } from '../../components/ThemedAlert';
import { ThemedBottomSheet } from '../../components/ThemedBottomSheet';
import { api, API_BASE_URL } from '../../services/api';

export default function GymProfileScreen() {
  const router = useRouter();

  const [business, setBusiness] = useState<any>(() => api.gym.getInitialBusiness().data);
  const [partner, setPartner] = useState<any>(() => api.getCurrentPartner() || {
    name: 'Vikram Rathore',
    mobile: '+91 98351 23456',
    login_id: '123@gym',
    rating: 4.92,
    business_type: 'gym',
  });
  const [loading, setLoading] = useState(false);
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

  // Preference switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [checkInSound, setCheckInSound] = useState(true);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

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

  const fetchProfile = useCallback(async () => {
    try {
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
    } else {
      setModalVisible(true);
    }
  };

  const handleSaveBusiness = async () => {
    if (!gymName.trim()) {
      setFormError('Gym business name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Complete address is required.');
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
        showAlert('success', 'Profile Updated', 'Gym business details updated successfully!');
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
    showAlert(
      'danger',
      'Log Out',
      'Are you sure you want to log out of your SlotB Gym Partner account?',
      async () => {
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
      true,
      'Log Out',
      'Cancel'
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerBrandRow}>
            <View style={styles.brandIconBox}>
              <Ionicons name="barbell" size={20} color="#0052FF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Business Profile</Text>
              <Text style={styles.headerSubtitle}>SlotB Gym Management</Text>
            </View>
          </View>

          <Pressable
            onPress={handleOpenEditModal}
            style={({ pressed }) => [styles.editBtn, pressed && styles.btnPressed]}
            hitSlop={8}
          >
            <Ionicons name="create-outline" size={16} color="#0052FF" />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0052FF" />
            <Text style={styles.loadingText}>Loading Gym Profile...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.flex1}
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
                tintColor="#0052FF"
              />
            }
          >
            {/* Hero Partner / Gym Identity Card */}
            <View style={styles.heroCard}>
              {/* Subtle Background Graphic Rings */}
              <View style={styles.heroGraphicRing1} />
              <View style={styles.heroGraphicRing2} />

              <View style={styles.heroTopRow}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarBox}>
                    <Ionicons name="barbell" size={32} color="#0052FF" />
                  </View>
                  <View style={styles.verifiedCheckBadge}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>
                </View>

                <View style={styles.heroTextCol}>
                  <View style={styles.badgeRow}>
                    <View style={styles.verifiedPartnerBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                      <Text style={styles.verifiedPartnerText}>Verified Gym Partner</Text>
                    </View>
                    <View style={styles.idBadge}>
                      <Text style={styles.idBadgeText}>ID: {partner?.login_id || '123@gym'}</Text>
                    </View>
                  </View>

                  <Text style={styles.gymTitle} numberOfLines={1}>
                    {business?.gym_name || 'SlotB Fitness & Gym'}
                  </Text>
                  <Text style={styles.partnerName}>
                    Manager: {partner?.name || 'Vikram Rathore'}
                  </Text>
                </View>
              </View>

              {/* Clean Quick Meta Strip */}
              <View style={styles.statsGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statValue}>{partner?.rating || '4.92'} ★</Text>
                  <Text style={styles.statLabel}>64 Reviews</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: '#16A34A' }]}>Active</Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCell}>
                  <Text style={[styles.statValue, { color: '#0052FF' }]}>Verified</Text>
                  <Text style={styles.statLabel}>Partner Tier</Text>
                </View>
              </View>
            </View>

            {/* Business Details Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="business-outline" size={18} color="#0052FF" />
                <Text style={styles.sectionHeader}>Business Information</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="location-outline" size={18} color="#0052FF" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Physical Address</Text>
                  <Text style={styles.detailValue}>
                    {business?.address || 'Near Stadium Road, Begusarai, Bihar - 851101'}
                  </Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.detailItem}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time-outline" size={18} color="#D97706" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Operating Hours</Text>
                  <Text style={styles.detailValue}>
                    {business?.opening_time || '06:00 AM'} - {business?.closing_time || '10:00 PM'} (All 7 Days)
                  </Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.detailItem}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="map-outline" size={18} color="#7C3AED" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>GPS Coordinates</Text>
                  <Text style={styles.detailValue}>
                    Latitude: {business?.latitude || '25.4182'} • Longitude: {business?.longitude || '86.1272'}
                  </Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.detailItem}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="fitness-outline" size={18} color="#16A34A" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Facilities & Highlights</Text>
                  <Text style={styles.detailValue}>
                    {business?.description ||
                      'State-of-the-art strength training, cardiovascular zone, air conditioned floor & certified fitness trainers.'}
                  </Text>
                </View>
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.detailItem}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Admission & Joining Rules</Text>
                  <Text style={styles.detailValue}>
                    {business?.admission_info ||
                      'Registration fee: ₹200. Indoor workout shoes and gym towel mandatory.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Non-Tab Configurations (Clean & Non-Repetitive) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="settings-outline" size={18} color="#0052FF" />
                <Text style={styles.sectionHeader}>Gym Configurations</Text>
              </View>

              <Pressable
                onPress={() => router.push('/gym/plans' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="layers" size={18} color="#7C3AED" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Membership Plans</Text>
                  <Text style={styles.shortcutSub}>Add or modify monthly, quarterly, annual packages</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>

              <View style={styles.itemDivider} />

              <Pressable
                onPress={() => router.push('/gym/timings' as any)}
                style={({ pressed }) => [styles.shortcutRow, pressed && styles.rowPressed]}
              >
                <View style={[styles.shortcutIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="time" size={18} color="#0284C7" />
                </View>
                <View style={styles.shortcutTextCol}>
                  <Text style={styles.shortcutTitle}>Timings & Batches</Text>
                  <Text style={styles.shortcutSub}>Set morning, evening & women-only slots</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </Pressable>
            </View>

            {/* App Preferences & Controls */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="options-outline" size={18} color="#0052FF" />
                <Text style={styles.sectionHeader}>Preferences & Controls</Text>
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Push Notifications</Text>
                  <Text style={styles.toggleSub}>Receive payment reminders & check-in alerts</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                  thumbColor={notificationsEnabled ? '#0052FF' : '#94A3B8'}
                />
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextCol}>
                  <Text style={styles.toggleTitle}>Attendance Sound Chime</Text>
                  <Text style={styles.toggleSub}>Play audio chime when member attendance is recorded</Text>
                </View>
                <Switch
                  value={checkInSound}
                  onValueChange={setCheckInSound}
                  trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                  thumbColor={checkInSound ? '#0052FF' : '#94A3B8'}
                />
              </View>
            </View>

            {/* Cloud Status Card (Replaces ugly raw IP debug box) */}
            <View style={styles.systemStatusCard}>
              <View style={styles.statusRow}>
                <View style={styles.onlineDotWrapper}>
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.statusTextCol}>
                  <Text style={styles.statusTitle}>SlotB Cloud Server Connected</Text>
                  <Text style={styles.statusSub}>SlotB Partner v1.0.4 • High-availability Gym sync</Text>
                </View>

                <Pressable
                  onPress={() => setShowNetworkInfo((prev) => !prev)}
                  style={styles.diagToggleBtn}
                  hitSlop={6}
                >
                  <Ionicons
                    name={showNetworkInfo ? 'chevron-up' : 'information-circle-outline'}
                    size={18}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              {showNetworkInfo && (
                <View style={styles.diagBox}>
                  <Text style={styles.diagLabel}>Server Endpoint:</Text>
                  <Text style={styles.diagUrl}>{API_BASE_URL}</Text>
                  <Text style={styles.diagTip}>
                    Ensure your mobile device and backend server share the same network for real-time sync.
                  </Text>
                </View>
              )}
            </View>

            {/* Log Out Button */}
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
            >
              {loggingOut ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={19} color="#DC2626" />
                  <Text style={styles.logoutBtnText}>Log Out of Partner Account</Text>
                </>
              )}
            </Pressable>

            {/* Bottom Footer Spacing */}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Themed Edit Business Profile Bottom Sheet Modal */}
        <ThemedBottomSheet
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Edit Gym Business Profile"
          subtitle="Keep your gym information updated for members"
          icon="barbell-outline"
          iconColor="#0052FF"
          maxHeight="88%"
        >
          <ScrollView
            contentContainerStyle={styles.sheetFormContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formError ? (
              <View style={styles.errorAlertBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorAlertText}>{formError}</Text>
              </View>
            ) : null}

            {/* Field: Gym Name */}
            <Text style={styles.formInputLabel}>
              Gym Business Name <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.formInput}
              placeholder="e.g. SlotB Fitness & Crossfit"
              value={gymName}
              onChangeText={setGymName}
              placeholderTextColor="#94A3B8"
            />

            {/* Field: Address */}
            <Text style={styles.formInputLabel}>
              Complete Physical Address <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.formInput, styles.formInputMultiline]}
              placeholder="Street, Landmark, City, State, PIN"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              placeholderTextColor="#94A3B8"
            />

            {/* Operating Hours in Dual Columns */}
            <View style={styles.dualFieldRow}>
              <View style={styles.flex1}>
                <Text style={styles.formInputLabel}>Opening Time</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="06:00 AM"
                  value={openingTime}
                  onChangeText={setOpeningTime}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.formInputLabel}>Closing Time</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="10:00 PM"
                  value={closingTime}
                  onChangeText={setClosingTime}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* GPS Coordinates */}
            <View style={styles.dualFieldRow}>
              <View style={styles.flex1}>
                <Text style={styles.formInputLabel}>Latitude</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="25.4182"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.flex1}>
                <Text style={styles.formInputLabel}>Longitude</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="86.1272"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Gym Description */}
            <Text style={styles.formInputLabel}>Gym Highlights & Equipment</Text>
            <TextInput
              style={[styles.formInput, styles.formInputMultiline]}
              placeholder="Cardio floor, certified trainers, steam bath, AC zones..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#94A3B8"
            />

            {/* Admission Information */}
            <Text style={styles.formInputLabel}>Admission Rules & Joining Terms</Text>
            <TextInput
              style={[styles.formInput, styles.formInputMultiline]}
              placeholder="Registration fee, mandatory ID proof, dress code rules..."
              value={admissionInfo}
              onChangeText={setAdmissionInfo}
              multiline
              numberOfLines={2}
              placeholderTextColor="#94A3B8"
            />

            {/* Submit Button */}
            <Pressable
              onPress={handleSaveBusiness}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
                saving && styles.saveButtonDisabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Gym Profile</Text>
                </>
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

        {/* Bottom Tab Navigation */}
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
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052FF',
  },
  btnPressed: {
    opacity: 0.75,
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
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  // Hero Identity Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0052FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: {
        elevation: 2.5,
      },
    }),
  },
  heroGraphicRing1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 20,
    borderColor: 'rgba(0, 82, 255, 0.03)',
  },
  heroGraphicRing2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 16,
    borderColor: 'rgba(0, 82, 255, 0.02)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  verifiedPartnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPartnerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  idBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  gymTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  partnerName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  heroActionsRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  heroActionBtnPressed: {
    backgroundColor: '#DBEAFE',
  },
  heroActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  detailIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
    lineHeight: 18,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowPressed: {
    opacity: 0.7,
  },
  shortcutIconBox: {
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  // System Status Card
  systemStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onlineDotWrapper: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  statusSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  diagToggleBtn: {
    padding: 4,
  },
  diagBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  diagLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  diagUrl: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0052FF',
    marginTop: 2,
    marginBottom: 4,
  },
  diagTip: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 50,
    borderRadius: 14,
    marginBottom: 10,
  },
  logoutBtnPressed: {
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Form Styles inside Sheet
  sheetFormContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  errorAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorAlertText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  formInputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#DC2626',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13.5,
    color: '#0F172A',
  },
  formInputMultiline: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  dualFieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0052FF',
    height: 50,
    borderRadius: 14,
    marginTop: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0052FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonPressed: {
    backgroundColor: '#0046E0',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
