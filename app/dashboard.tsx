import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';

export default function DashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  const handleToggleAvailability = (val: boolean) => {
    setIsAvailable(val);
    Alert.alert(
      val ? 'You are Online' : 'You are Offline',
      val
        ? 'You will now receive job requests in Begusarai.'
        : 'You will not receive new job requests while offline.'
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications (3)',
      '1. New AC Installation in Barauni (2.3 KM away)\n2. Payment of ₹699 credited to your wallet\n3. Weekly incentive target reached (90%)'
    );
  };

  const handleOpenJobs = (filterType?: string) => {
    if (filterType) {
      router.push({ pathname: '/jobs', params: { filter: filterType } } as any);
    } else {
      router.push('/jobs' as any);
    }
  };

  const handleOpenEarnings = () => {
    router.push('/earnings' as any);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Blue Header Section with Curved Bottom */}
      <View style={styles.headerBackground}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTopRow}>
            {/* Greeting & Location */}
            <View style={styles.greetingBlock}>
              <Text style={styles.greetingText}>Good Morning, Rohan 👋</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.locationText}>Begusarai, Bihar</Text>
              </View>
            </View>

            {/* Available Toggle & Notification Bell */}
            <View style={styles.headerRightBlock}>
              {/* Available for Work Pill */}
              <View style={styles.availablePill}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isAvailable ? '#22C55E' : '#94A3B8' },
                  ]}
                />
                <Text style={styles.availableText}>Available for Work</Text>
                <Switch
                  value={isAvailable}
                  onValueChange={handleToggleAvailability}
                  trackColor={{ false: '#CBD5E1', true: '#22C55E' }}
                  thumbColor="#FFFFFF"
                  style={Platform.OS === 'ios' ? styles.switchIOS : styles.switchAndroid}
                />
              </View>

              {/* Notification Bell with Badge */}
              <Pressable onPress={handleNotifications} style={styles.bellBtn} hitSlop={8}>
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable Dashboard Body */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Today's Overview</Text>

        {/* 2x2 Grid of Overview Cards */}
        <View style={styles.grid}>
          {/* Card 1: Today's Jobs */}
          <Pressable
            onPress={() => handleOpenJobs()}
            style={({ pressed }) => [
              styles.card,
              styles.cardBlue,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EAF2FE' }]}>
              <Ionicons name="calendar-outline" size={24} color="#0066F5" />
            </View>
            <Text style={styles.cardLabel}>Today's Jobs</Text>
            <Text style={[styles.cardValue, { color: '#0066F5' }]}>12</Text>
            <View style={[styles.cardWave, { backgroundColor: '#EBF4FF' }]} />
          </Pressable>

          {/* Card 2: Today's Earnings */}
          <Pressable
            onPress={handleOpenEarnings}
            style={({ pressed }) => [
              styles.card,
              styles.cardGreen,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F8EE' }]}>
              <FontAwesome name="rupee" size={22} color="#16A34A" />
            </View>
            <Text style={styles.cardLabel}>Today's Earnings</Text>
            <Text style={[styles.cardValue, { color: '#16A34A' }]}>₹2,450</Text>
            <View style={[styles.cardWave, { backgroundColor: '#E8F8EE' }]} />
          </Pressable>

          {/* Card 3: Pending Jobs */}
          <Pressable
            onPress={() => handleOpenJobs('pending')}
            style={({ pressed }) => [
              styles.card,
              styles.cardOrange,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.cardLabel}>Pending Jobs</Text>
            <Text style={[styles.cardValue, { color: '#D97706' }]}>3</Text>
            <View style={[styles.cardWave, { backgroundColor: '#FFFBEB' }]} />
          </Pressable>

          {/* Card 4: Completed Jobs */}
          <Pressable
            onPress={() => handleOpenJobs('completed')}
            style={({ pressed }) => [
              styles.card,
              styles.cardPurple,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.cardLabel}>Completed Jobs</Text>
            <Text style={[styles.cardValue, { color: '#7C3AED' }]}>9</Text>
            <View style={[styles.cardWave, { backgroundColor: '#FAF5FF' }]} />
          </Pressable>
        </View>

        {/* Huge Watermark Branding Section */}
        <View style={styles.watermarkSection}>
          <Text style={styles.watermarkText}>
            Thanks for{'\n'}Choosing{'\n'}SlotB Partner
          </Text>
          <View style={styles.madeWithIndiaRow}>
            <Text style={styles.madeWithIndiaText}>Made with ❤️ in India</Text>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <BottomTabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    backgroundColor: '#005BEA',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
  },
  headerSafe: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  greetingBlock: {
    flex: 1,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  headerRightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availablePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,
    paddingLeft: 8,
    paddingRight: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 4,
  },
  switchIOS: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  switchAndroid: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#005BEA',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardBlue: {
    borderTopColor: '#0066F5',
    borderLeftColor: '#0066F5',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cardGreen: {
    borderTopColor: '#16A34A',
    borderLeftColor: '#16A34A',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cardOrange: {
    borderTopColor: '#F59E0B',
    borderLeftColor: '#F59E0B',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cardPurple: {
    borderTopColor: '#8B5CF6',
    borderLeftColor: '#8B5CF6',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardWave: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.4,
    zIndex: -1,
  },
  watermarkSection: {
    paddingTop: 32,
    paddingHorizontal: 4,
  },
  watermarkText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#E2E8F0',
    lineHeight: 50,
    letterSpacing: -1,
    opacity: 0.85,
  },
  madeWithIndiaRow: {
    marginTop: 16,
  },
  madeWithIndiaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
});
