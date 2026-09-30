import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, G, Path, Polygon, Rect } from 'react-native-svg';
import { BottomTabBar } from '../components/BottomTabBar';
import { ThemedAlert } from '../components/ThemedAlert';
import { api } from '../services/api';

export default function ProfileScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const partner = api.getCurrentPartner() || api.getInitialPartner();

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

  const handleEditProfile = () => {
    showAlert('info', 'Edit Profile', 'Profile editor will allow updating your profile picture and contact details.');
  };

  const handleSettings = () => {
    showAlert('info', 'Settings', 'Account preferences and notification settings.');
  };

  const handleLogOut = () => {
    showAlert(
      'danger',
      'Log Out',
      'Are you sure you want to log out from SlotB Partner?',
      () => {
        router.replace('/login' as any);
      },
      true,
      'Log Out',
      'Cancel'
    );
  };

  const handleItemPress = (itemTitle: string) => {
    showAlert('info', itemTitle, `${itemTitle} management screen.`);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable onPress={handleSettings} style={styles.settingsBtn} hitSlop={10}>
            <Ionicons name="settings-outline" size={24} color="#0F172A" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Top Profile Info Row */}
          <View style={styles.profileTopRow}>
            {/* Avatar with SlotB Royal Blue Uniform & Camera Badge */}
            <View style={styles.avatarWrapper}>
              <Svg width={72} height={72} viewBox="0 0 72 72">
                <Defs>
                  <ClipPath id="circleClip">
                    <Circle cx={36} cy={36} r={36} />
                  </ClipPath>
                </Defs>
                <G clipPath="url(#circleClip)">
                  {/* Background */}
                  <Rect width={72} height={72} fill="#EFF6FF" />
                  {/* Head & Neck */}
                  <Circle cx={36} cy={27} r={14} fill="#F6C8A6" />
                  <Rect x={32} y={36} width={8} height={9} fill="#E5B28F" />
                  {/* Hair */}
                  <Path
                    d="M22 24 C22 15 28 12 36 12 C44 12 50 15 50 24 C48 21 44 20 36 20 C28 20 24 21 22 24 Z"
                    fill="#1E293B"
                  />
                  {/* Mustache / Beard */}
                  <Path
                    d="M31 34 Q36 37 41 34 Q36 39 31 34 Z"
                    fill="#1E293B"
                  />
                  {/* SlotB Royal Blue Polo Uniform */}
                  <Path
                    d="M14 72 L18 45 L28 42 L36 49 L44 42 L54 45 L58 72 Z"
                    fill="#0052FF"
                  />
                  {/* Collar */}
                  <Polygon points="28,42 36,49 32,56" fill="#0040C8" />
                  <Polygon points="44,42 36,49 40,56" fill="#0040C8" />
                </G>
              </Svg>

              {/* Camera Icon Badge */}
              <Pressable
                onPress={() =>
                  showAlert(
                    'info',
                    'Profile Photo',
                    'Choose an option to update photo: Camera or Gallery'
                  )
                }
                style={styles.cameraBadge}
                hitSlop={6}
              >
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Profile Info Details */}
            <View style={styles.profileDetails}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.partnerName}>{partner?.name || 'Rohit Kumar'}</Text>
              </View>

              <View style={styles.roleRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{partner?.category || 'Service Partner'}</Text>
                  <Ionicons name="checkmark-circle" size={13} color="#0052FF" style={{ marginLeft: 3 }} />
                </View>
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{partner?.rating || 4.8}</Text>
                <Text style={styles.reviewsText}> ({partner?.review_count || 128} Reviews)</Text>
              </View>

              {/* Phone */}
              <View style={styles.metaRow}>
                <Ionicons name="call" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>{partner?.mobile || partner?.phone || '+91 91234 56789'}</Text>
              </View>

              {/* Location */}
              <View style={styles.metaRow}>
                <Ionicons name="location" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>Begusarai, Bihar</Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <Pressable
              onPress={handleEditProfile}
              style={({ pressed }) => [
                styles.editProfileBtn,
                pressed && styles.buttonPressed,
              ]}
              hitSlop={6}
            >
              <Feather name="edit-2" size={12} color="#0052FF" style={{ marginRight: 4 }} />
              <Text style={styles.editProfileText}>Edit</Text>
            </Pressable>
          </View>

          {/* 4 Stats Metrics Box (Harmonized Brand Colors) */}
          <View style={styles.statsContainer}>
            <Pressable
              onPress={() =>
                showAlert(
                  'info',
                  `Jobs Completed (${partner?.jobs_completed || 156})`,
                  `Total ${partner?.category || 'service'} jobs completed successfully.`
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="briefcase-outline" size={18} color="#0052FF" style={styles.statIcon} />
              <Text style={styles.statValue}>{partner?.jobs_completed || 156}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                showAlert(
                  'info',
                  `Customer Rating (${partner?.rating || 4.8} / 5.0)`,
                  `Based on ${partner?.review_count || 128} verified customer ratings.\n★ 5 Stars: 92%\n★ 4 Stars: 6%\n★ 3 Stars: 2%`
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="star" size={18} color="#D97706" style={styles.statIcon} />
              <Text style={styles.statValue}>{partner?.rating || 4.8}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                showAlert(
                  'info',
                  'Partner Tenure',
                  'Registered as verified SlotB partner for 8 months.'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="calendar-outline" size={18} color="#7C3AED" style={styles.statIcon} />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Months</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                showAlert(
                  'success',
                  '100% Profile Verified',
                  'Aadhaar, PAN card, Trade Certificate, and Bank details are 100% verified.'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="shield-checkmark" size={18} color="#16A34A" style={styles.statIcon} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </Pressable>
          </View>
        </View>

        {/* Section: Account */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.menuGroup}>
          <Pressable
            onPress={() => handleItemPress('Personal Information')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="person-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Bank Details')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <MaterialCommunityIcons name="bank-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Bank Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Documents')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Documents</Text>
            <View style={styles.verifiedTagPill}>
              <Text style={styles.verifiedTagText}>Verified</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Change Password')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Section: App Preferences */}
        <Text style={styles.sectionHeader}>App Preferences</Text>
        <View style={styles.menuGroup}>
          <Pressable
            onPress={() => handleItemPress('Notifications')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="notifications-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Language')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="globe-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Language</Text>
            <Text style={styles.langValue}>English</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="moon-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
              thumbColor={darkMode ? '#0052FF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Section: Support */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.menuGroup}>
          <Pressable
            onPress={() => handleItemPress('Help & Support')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="headset-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Safety Guidelines')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="shield-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('About SlotB Partner App')}
            style={styles.menuItem}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#0052FF" />
            </View>
            <Text style={styles.menuItemTitle}>About SlotB Partner App</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Log Out Button */}
        <Pressable
          onPress={handleLogOut}
          style={({ pressed }) => [
            styles.logOutBtn,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={styles.logOutText}>Log Out</Text>
        </Pressable>

        {/* Version Footer */}
        <Text style={styles.versionFooter}>Version 1.0.4 • SlotB Partner</Text>
      </ScrollView>

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

      {/* Bottom Navigation Tab Bar with Profile active */}
      <BottomTabBar activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0052FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  partnerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleRow: {
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052FF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewsText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  editProfileText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginLeft: 60,
  },
  verifiedTagPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  verifiedTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  langValue: {
    fontSize: 12.5,
    color: '#64748B',
    marginRight: 6,
  },
  logOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  logOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionFooter: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
