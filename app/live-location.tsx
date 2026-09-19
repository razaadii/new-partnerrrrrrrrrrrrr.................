import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';
import { MapRouteGraphic } from '../components/MapRouteGraphic';

export default function LiveLocationScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard' as any);
  };

  const handleCall = () => {
    Linking.openURL('tel:+919123456789').catch(() => {});
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919123456789').catch(() => {});
  };

  const handleReachedLocation = () => {
    router.push('/verify-customer' as any);
  };

  const handleOpenGoogleMaps = () => {
    const url = Platform.select({
      ios: 'maps:0,0?q=Barauni,Begusarai,Bihar',
      android: 'geo:0,0?q=Barauni,Begusarai,Bihar',
      default: 'https://maps.google.com/?q=Barauni,Begusarai,Bihar',
    });
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.headerRow}>
          {/* Back Button */}
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color="#0F172A" />
          </Pressable>

          {/* Title */}
          <Text style={styles.headerTitle}>Live Location</Text>

          {/* "On The Way" Green Badge */}
          <View style={styles.statusPill}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>On The Way</Text>
          </View>
        </View>

        {/* Informational Banner */}
        <View style={styles.bannerRow}>
          <Ionicons name="location" size={16} color="#16A34A" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            You are on the way to customer location
          </Text>
        </View>
      </SafeAreaView>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Vector Map Graphic with Blue Route & Floating Controls */}
        <View style={styles.mapContainer}>
          <MapRouteGraphic />
        </View>

        {/* Customer Information Card */}
        <View style={styles.card}>
          <View style={styles.customerTopRow}>
            {/* Customer Avatar */}
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={28} color="#3B82F6" />
            </View>

            {/* Name & Phone */}
            <View style={styles.customerInfoBlock}>
              <Text style={styles.customerName}>Rahul Kumar</Text>
              <Text style={styles.customerPhone}>+91 91234 56789</Text>
            </View>

            {/* Call & WhatsApp Quick Buttons */}
            <View style={styles.contactButtonsRow}>
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Address Row */}
          <View style={styles.addressRow}>
            <View style={styles.addressIconWrapper}>
              <Ionicons name="location" size={18} color="#0052FF" />
            </View>
            <View style={styles.addressTextBlock}>
              <Text style={styles.addressText}>
                Barauni, Ward No. 22, Near Power House Road,{'\n'}
                Begusarai, Bihar - 851101
              </Text>
            </View>
            <Pressable onPress={handleOpenGoogleMaps} hitSlop={8}>
              <Text style={styles.viewOnMapText}>View on Map</Text>
            </Pressable>
          </View>
        </View>

        {/* Service & Booking Details Card */}
        <View style={styles.card}>
          {/* Top Row: Service Name, ID, Price */}
          <View style={styles.serviceHeaderRow}>
            {/* AC Unit Service Icon */}
            <View style={styles.serviceIconCircle}>
              <MaterialCommunityIcons name="air-conditioner" size={26} color="#0052FF" />
              <Ionicons
                name="snow"
                size={12}
                color="#0052FF"
                style={styles.snowMiniIcon}
              />
            </View>

            {/* Service Title & Booking Details */}
            <View style={styles.serviceInfoBlock}>
              <Text style={styles.serviceTitle}>AC Installation</Text>
              <Text style={styles.serviceMeta}>Booking ID: #AC1254</Text>
              <Text style={styles.serviceMeta}>Scheduled Time: Today, 10:30 AM</Text>
            </View>

            {/* Price Block */}
            <View style={styles.priceBlock}>
              <Text style={styles.priceText}>₹699</Text>
              <Text style={styles.priceSubText}>Total Amount</Text>
            </View>
          </View>

          {/* Metrics Pill (Distance & Estimated Time) */}
          <View style={styles.metricsBox}>
            <View style={styles.metricItem}>
              <FontAwesome5 name="route" size={16} color="#0052FF" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricValue}>2.3 KM</Text>
              </View>
            </View>

            <View style={styles.metricSeparator} />

            <View style={styles.metricItem}>
              <View>
                <Text style={styles.metricLabel}>Estimated Time</Text>
                <Text style={styles.metricValue}>8 Minutes</Text>
              </View>
            </View>
          </View>

          {/* Instruction Note Pill */}
          <View style={styles.instructionBanner}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#16A34A"
              style={styles.instructionIcon}
            />
            <Text style={styles.instructionText}>
              Please reach the location and click on 'Reached Location' to continue.
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            {/* Navigate Button */}
            <Pressable
              onPress={handleOpenGoogleMaps}
              style={({ pressed }) => [
                styles.navigateButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons name="navigate" size={18} color="#0052FF" style={{ marginRight: 6 }} />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </Pressable>

            {/* Reached Location Button */}
            <Pressable
              onPress={handleReachedLocation}
              style={({ pressed }) => [
                styles.reachedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.reachedButtonText}>Reached Location</Text>
            </Pressable>
          </View>
        </View>
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
    paddingVertical: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerIcon: {
    marginRight: 6,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapContainer: {
    width: '100%',
    backgroundColor: '#F3F6FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  customerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerInfoBlock: {
    flex: 1,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  contactButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 10.5,
    fontWeight: '500',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconWrapper: {
    marginRight: 8,
    marginTop: 2,
  },
  addressTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  addressText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '400',
  },
  viewOnMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0052FF',
    marginTop: 2,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  snowMiniIcon: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  serviceInfoBlock: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  serviceMeta: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceSubText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  instructionIcon: {
    marginRight: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '500',
    color: '#15803D',
    lineHeight: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0052FF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0052FF',
  },
  reachedButton: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reachedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
