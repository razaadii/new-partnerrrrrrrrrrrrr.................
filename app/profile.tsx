import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
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

export default function ProfileScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editor will open here.');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'App configuration and account settings.');
  };

  const handleLogOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out from SlotB Partner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          router.replace('/login' as any);
        },
      },
    ]);
  };

  const handleItemPress = (itemTitle: string) => {
    Alert.alert(itemTitle, `${itemTitle} details will open here.`);
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
            {/* Avatar with Green Shirt & Camera Badge */}
            <View style={styles.avatarWrapper}>
              <Svg width={72} height={72} viewBox="0 0 72 72">
                <Defs>
                  <ClipPath id="circleClip">
                    <Circle cx={36} cy={36} r={36} />
                  </ClipPath>
                </Defs>
                <G clipPath="url(#circleClip)">
                  {/* Background */}
                  <Rect width={72} height={72} fill="#E2E8F0" />
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
                  {/* Green Technician Polo Uniform */}
                  <Path
                    d="M14 72 L18 45 L28 42 L36 49 L44 42 L54 45 L58 72 Z"
                    fill="#15803D"
                  />
                  {/* Collar */}
                  <Polygon points="28,42 36,49 32,56" fill="#166534" />
                  <Polygon points="44,42 36,49 40,56" fill="#166534" />
                </G>
              </Svg>

              {/* Camera Icon Badge */}
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Profile Photo',
                    'Choose an option:',
                    [
                      { text: 'Take Photo' },
                      { text: 'Choose from Gallery' },
                      { text: 'Cancel', style: 'cancel' },
                    ]
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
                <Text style={styles.partnerName}>Rohit Kumar</Text>
              </View>

              <View style={styles.roleRow}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>AC Technician</Text>
                  <Ionicons name="checkmark-circle" size={13} color="#16A34A" style={{ marginLeft: 3 }} />
                </View>
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.reviewsText}> (128 Reviews)</Text>
              </View>

              {/* Phone */}
              <View style={styles.metaRow}>
                <Ionicons name="call" size={12} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.metaText}>+91 91234 56789</Text>
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
              <Feather name="edit-2" size={12} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
          </View>

          {/* 4 Stats Metrics Box */}
          <View style={styles.statsContainer}>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Jobs Completed (156)',
                  'Total AC installations, repairs, and servicing jobs completed successfully.'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="briefcase-outline" size={18} color="#16A34A" style={styles.statIcon} />
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Customer Rating (4.8 / 5.0)',
                  'Based on 128 verified customer ratings.\n★ 5 Stars: 88%\n★ 4 Stars: 10%\n★ 3 Stars: 2%'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="star-outline" size={18} color="#16A34A" style={styles.statIcon} />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Partner Tenure',
                  'Registered as verified SlotB partner for 8 months.'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="calendar-outline" size={18} color="#16A34A" style={styles.statIcon} />
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Months Joined</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert(
                  '100% Profile Verified',
                  'Aadhaar, PAN card, Trade Certificate, and Bank details are 100% verified.'
                )
              }
              style={styles.statBox}
            >
              <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" style={styles.statIcon} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Profile Verified</Text>
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
            <View style={styles.menuIconCircle}>
              <Ionicons name="person-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Bank Details')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <MaterialCommunityIcons name="bank-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Bank Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Documents')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="document-text-outline" size={18} color="#334155" />
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
            <View style={styles.menuIconCircle}>
              <Ionicons name="lock-closed-outline" size={18} color="#334155" />
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
            <View style={styles.menuIconCircle}>
              <Ionicons name="notifications-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Language')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="globe-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Language</Text>
            <Text style={styles.langValue}>English</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <View style={styles.menuItem}>
            <View style={styles.menuIconCircle}>
              <Ionicons name="moon-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CBD5E1', true: '#16A34A' }}
              thumbColor="#FFFFFF"
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
            <View style={styles.menuIconCircle}>
              <Ionicons name="headset-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('Safety Guidelines')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="shield-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.menuItemTitle}>Safety Guidelines</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.itemDivider} />

          <Pressable
            onPress={() => handleItemPress('About SlotB Partner App')}
            style={styles.menuItem}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="information-circle-outline" size={18} color="#334155" />
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
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logOutText}>Log Out</Text>
        </Pressable>

        {/* Version Footer */}
        <Text style={styles.versionFooter}>Version 1.0.0 (100)</Text>
      </ScrollView>

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
    fontSize: 22,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
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
    backgroundColor: '#22C55E',
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
    fontWeight: '700',
    color: '#0F172A',
  },
  roleRow: {
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  editProfileText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#0F172A',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 58,
  },
  verifiedTagPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    height: 48,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  logOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionFooter: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
