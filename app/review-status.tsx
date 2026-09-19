import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySkylineBackground } from '../components/CitySkylineBackground';
import { ReviewSuccessGraphic } from '../components/ReviewSuccessGraphic';
import { SlotBLogo } from '../components/SlotBLogo';

export default function ReviewStatusScreen() {
  const router = useRouter();

  const handleDone = () => {
    router.replace('/dashboard' as any);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Decorative City Skyline Background */}
      <CitySkylineBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Brand Header */}
          <View style={styles.header}>
            <SlotBLogo badgeVariant="blue" size="medium" />
          </View>

          {/* Central Clipboard & Confetti Illustration */}
          <ReviewSuccessGraphic />

          {/* Main Headings */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              Thanks for{'\n'}Submitting Your Details!
            </Text>
            <Text style={styles.subtitle}>
              Your application is currently under review.{'\n'}We will get back
              to you within
            </Text>
            <Text style={styles.highlightTime}>3-4 Hours</Text>
          </View>

          {/* Notification Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.clockCircle}>
              <Ionicons name="time-outline" size={26} color="#0052FF" />
            </View>
            <Text style={styles.infoText}>
              {"We'll notify you via SMS and email once your account is approved."}
            </Text>
          </View>

          {/* Bottom Action Button */}
          <View style={styles.bottomSection}>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Ok, Got It</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8FC',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  highlightTime: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0052FF',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E1EDFE',
  },
  clockCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 18,
  },
  primaryButton: {
    height: 50,
    backgroundColor: '#0052FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#0046E0',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
