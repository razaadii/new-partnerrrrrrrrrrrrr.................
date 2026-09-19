import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';
import { BottomTabBar } from '../components/BottomTabBar';

export default function LocationVerifiedScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/live-location' as any);
  };

  const handleCall = () => {
    Linking.openURL('tel:+919123456789').catch(() => {});
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919123456789').catch(() => {});
  };

  const handleStartService = () => {
    router.push('/complete-job' as any);
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'Choose an issue type to report:',
      [
        { text: 'Customer Unavailable' },
        { text: 'Wrong Location' },
        { text: 'Safety Concern' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleShieldInfo = () => {
    Alert.alert(
      'Verified Location',
      'The customer PIN matched the booking. Customer identity and location are verified.'
    );
  };

  const handleMenuOptions = () => {
    Alert.alert('Job Options', 'Select an action:', [
      {
        text: 'Partner Helpline (24/7)',
        onPress: () => Linking.openURL('tel:1800123456').catch(() => {}),
      },
      {
        text: 'Safety Guidelines',
        onPress: () =>
          Alert.alert(
            'Safety Guidelines',
            '1. Wear safety gear\n2. Turn off mains power before AC installation\n3. Use certified tools'
          ),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Forest Green Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            {/* Back Arrow */}
            <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Header Title */}
            <Text style={styles.headerTitle}>Location Verified</Text>

            {/* Right Header Icons (Shield & 3-Dots) */}
            <View style={styles.headerRightActions}>
              <Pressable onPress={handleShieldInfo} hitSlop={8}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#FFFFFF"
                  style={{ marginRight: 12 }}
                />
              </Pressable>
              <Pressable onPress={handleMenuOptions} hitSlop={8}>
                <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Success Checkmark & Confetti Graphic */}
        <View style={styles.celebrationWrapper}>
          <Svg width={140} height={120} viewBox="0 0 140 120">
            {/* Confetti Sprinkles */}
            <Polygon points="20,25 24,19 27,24" fill="#F59E0B" />
            <Polygon points="115,22 120,18 118,25" fill="#EF4444" />
            <Polygon points="12,70 17,67 14,75" fill="#10B981" />
            <Polygon points="125,72 130,68 128,76" fill="#F97316" />
            <Circle cx="18" cy="45" r="2.5" fill="#EF4444" />
            <Circle cx="120" cy="46" r="2.5" fill="#F59E0B" />
            <Circle cx="108" cy="88" r="2.5" fill="#10B981" />
            <Circle cx="28" cy="85" r="2" fill="#0052FF" />

            {/* Soft Green Glow Ring */}
            <Circle cx="70" cy="60" r="46" fill="#DCFCE7" opacity={0.6} />

            {/* Main Green Circle */}
            <Circle cx="70" cy="60" r="36" fill="#16A34A" />

            {/* Bold White Checkmark */}
            <Path
              d="M57 60 L66 69 L83 52"
              stroke="#FFFFFF"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>

          <Text style={styles.verifiedHeading}>Location Verified!</Text>
          <Text style={styles.verifiedSubheading}>Customer verified successfully</Text>
        </View>

        {/* You Can Now Start Service Alert Banner */}
        <View style={styles.canStartBanner}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#16A34A"
            style={styles.bannerIcon}
          />
          <View style={styles.bannerTextBlock}>
            <Text style={styles.bannerTitle}>You can now start the service.</Text>
            <Text style={styles.bannerDesc}>Provide the best service experience.</Text>
          </View>
        </View>

        {/* Customer Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Customer Details</Text>

          <View style={styles.customerRow}>
            {/* Customer Avatar */}
            <View style={styles.avatarCircleGreen}>
              <Ionicons name="person" size={28} color="#16A34A" />
            </View>

            {/* Info Block */}
            <View style={styles.customerInfoBlock}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.customerName}>Rahul Kumar</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" style={{ marginRight: 3 }} />
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>

              <View style={styles.phoneRow}>
                <Ionicons name="call" size={13} color="#64748B" style={{ marginRight: 4 }} />
                <Text style={styles.customerPhone}>+91 91234 56789</Text>
              </View>

              <View style={styles.addressRow}>
                <Ionicons name="location" size={14} color="#64748B" style={{ marginRight: 4, marginTop: 2 }} />
                <Text style={styles.addressText}>
                  Barauni, Ward No. 22,{'\n'}
                  Near Power House Road,{'\n'}
                  Begusarai, Bihar - 851101
                </Text>
              </View>
            </View>

            {/* Call & WhatsApp Quick Buttons */}
            <View style={styles.contactActions}>
              <Pressable onPress={handleCall} style={styles.contactItem} hitSlop={6}>
                <View style={[styles.contactIconCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="call" size={18} color="#0052FF" />
                </View>
                <Text style={styles.contactLabel}>Call</Text>
              </Pressable>

              <Pressable onPress={handleWhatsApp} style={styles.contactItem} hitSlop={6}>
                <View style={[styles.contactIconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
                </View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Service Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Service Details</Text>

          <View style={styles.serviceRow}>
            {/* Service Icon */}
            <View style={styles.serviceIconCircle}>
              <MaterialCommunityIcons name="air-conditioner" size={26} color="#0052FF" />
              <Ionicons name="snow" size={11} color="#0052FF" style={styles.miniSnow} />
            </View>

            {/* Service Info */}
            <View style={styles.serviceInfoBlock}>
              <Text style={styles.serviceTitle}>AC Installation</Text>
              <Text style={styles.serviceMeta}>Booking ID <Text style={{ color: '#0F172A', fontWeight: '600' }}>#AC1254</Text></Text>
              <Text style={styles.serviceMeta}>Scheduled Time <Text style={{ color: '#0F172A', fontWeight: '600' }}>Today, 10:30 AM</Text></Text>
            </View>

            {/* Amount Badge */}
            <View style={styles.amountBadgeBox}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>₹699</Text>
            </View>
          </View>
        </View>

        {/* Important Note Box */}
        <View style={styles.importantNoteBox}>
          <Ionicons name="clipboard-outline" size={22} color="#0052FF" style={styles.noteIcon} />
          <View style={styles.noteTextBlock}>
            <Text style={styles.noteTitle}>Important Note</Text>
            <Text style={styles.noteDesc}>
              Please start the service and complete the job after providing excellent service.
            </Text>
          </View>
        </View>

        {/* Start Service Primary Button */}
        <Pressable
          onPress={handleStartService}
          style={({ pressed }) => [
            styles.startServiceBtn,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startServiceBtnText}>Start Service</Text>
        </Pressable>

        {/* Report an Issue Secondary Button */}
        <Pressable
          onPress={handleReportIssue}
          style={({ pressed }) => [
            styles.reportIssueBtn,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="flag-outline" size={18} color="#0052FF" style={{ marginRight: 8 }} />
          <Text style={styles.reportIssueBtnText}>Report an Issue</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation Tab Bar */}
      <BottomTabBar activeTab="jobs" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#16A34A',
  },
  headerSafe: {
    backgroundColor: '#16A34A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  celebrationWrapper: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  verifiedHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  verifiedSubheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  canStartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerTextBlock: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 11.5,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarCircleGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerInfoBlock: {
    flex: 1,
    marginRight: 8,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerPhone: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactItem: {
    alignItems: 'center',
  },
  contactIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  miniSnow: {
    position: 'absolute',
    bottom: 4,
    right: 6,
  },
  serviceInfoBlock: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceMeta: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  amountBadgeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  importantNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  noteTextBlock: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052FF',
    marginBottom: 2,
  },
  noteDesc: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  startServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052FF',
    height: 50,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  startServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  reportIssueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0052FF',
    height: 48,
    borderRadius: 12,
    marginBottom: 10,
  },
  reportIssueBtnText: {
    color: '#0052FF',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
