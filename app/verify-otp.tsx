import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySkylineBackground } from '../components/CitySkylineBackground';
import { MailShieldGraphic } from '../components/MailShieldGraphic';
import { OtpInput } from '../components/OtpInput';
import { SlotBLogo } from '../components/SlotBLogo';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const displayEmail = (params.email as string) || 'rohan@example.com';

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(45);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = () => {
    // Navigate to Review Status screen
    router.push('/review-status' as any);
  };

  const handleResend = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(45);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formattedTime = `00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Background Skyline */}
      <CitySkylineBackground />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Back Navigation Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header Brand */}
            <View style={styles.header}>
              <SlotBLogo badgeVariant="blue" size="medium" />

              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                {"We've sent a 6-digit verification code to"}
              </Text>
              <Text style={styles.emailText}>{displayEmail}</Text>
              <Text style={styles.subtitle}>Please enter it below to continue.</Text>
            </View>

            {/* Central Mail Shield Graphic */}
            <MailShieldGraphic />

            {/* OTP Section */}
            <View style={styles.otpSection}>
              <Text style={styles.otpLabel}>Enter 6-digit code</Text>

              {/* 6 Digit Input Boxes */}
              <OtpInput code={code} setCode={setCode} length={6} />

              {/* Resend Timer Row */}
              <Pressable
                onPress={handleResend}
                disabled={secondsLeft > 0}
                style={styles.timerRow}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color="#64748B"
                  style={styles.clockIcon}
                />
                <Text style={styles.timerText}>
                  Resend OTP in{' '}
                  <Text style={styles.timerCountText}>{formattedTime}</Text>
                </Text>
              </Pressable>

              {/* Verify & Continue Button */}
              <Pressable
                onPress={handleVerify}
                style={({ pressed }) => [
                  styles.verifyButton,
                  pressed && styles.verifyButtonPressed,
                ]}
              >
                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
              </Pressable>

              {/* Secure Verification Info Box */}
              <View style={styles.secureCard}>
                <View style={styles.shieldIconWrapper}>
                  <Ionicons name="shield-checkmark" size={22} color="#0052FF" />
                </View>
                <View style={styles.secureTextContent}>
                  <Text style={styles.secureTitle}>Secure Verification</Text>
                  <Text style={styles.secureBody}>
                    Your email is used to protect your account and business
                    information.
                  </Text>
                </View>
              </View>

              {/* Change Email Footer Link */}
              <View style={styles.changeEmailRow}>
                <Text style={styles.wrongEmailText}>Wrong email?</Text>
                <Pressable onPress={handleBack} hitSlop={8}>
                  <Text style={styles.changeEmailLink}>Change Email Address</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emailText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0052FF',
    marginVertical: 2,
    textAlign: 'center',
  },
  otpSection: {
    marginTop: 6,
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  clockIcon: {
    marginRight: 6,
  },
  timerText: {
    fontSize: 13,
    color: '#64748B',
  },
  timerCountText: {
    color: '#0052FF',
    fontWeight: '700',
  },
  verifyButton: {
    height: 50,
    backgroundColor: '#0052FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  verifyButtonPressed: {
    backgroundColor: '#0046E0',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E1EDFE',
  },
  shieldIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secureTextContent: {
    flex: 1,
  },
  secureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  secureBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  changeEmailRow: {
    alignItems: 'center',
    marginTop: 24,
  },
  wrongEmailText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  changeEmailLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0052FF',
  },
});
