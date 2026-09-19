import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import { NumericKeypad } from '../components/NumericKeypad';

export default function VerifyCustomerScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const handleBack = () => {
    router.push('/live-location' as any);
  };

  const handleNumberPress = (digit: string) => {
    const nextCode = [...code];
    const emptyIndex = nextCode.findIndex((val) => val === '');
    if (emptyIndex !== -1) {
      nextCode[emptyIndex] = digit;
      setCode(nextCode);
      setFocusedIndex(Math.min(emptyIndex + 1, 3));
    }
  };

  const handleDeletePress = () => {
    const nextCode = [...code];
    let lastFilledIndex = -1;
    for (let i = nextCode.length - 1; i >= 0; i--) {
      if (nextCode[i] !== '') {
        lastFilledIndex = i;
        break;
      }
    }
    if (lastFilledIndex !== -1) {
      nextCode[lastFilledIndex] = '';
      setCode(nextCode);
      setFocusedIndex(lastFilledIndex);
    }
  };

  const handleVerifyCode = () => {
    // Navigate to location-verified
    router.push('/location-verified' as any);
  };

  const handleInfoPress = () => {
    Alert.alert(
      'Verification Information',
      'The 4-digit code is provided to the customer in their SlotB booking details. This ensures safety and confirms on-site arrival.'
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Royal Blue Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            {/* Back Button */}
            <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Title */}
            <Text style={styles.headerTitle}>Verify Customer</Text>

            {/* Info Button */}
            <Pressable onPress={handleInfoPress} style={styles.headerIconBtn} hitSlop={10}>
              <Ionicons name="information-circle-outline" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Arrival Location Banner Card */}
        <View style={styles.arrivalCard}>
          <View style={styles.arrivalIconCircle}>
            <Ionicons name="location-sharp" size={22} color="#16A34A" />
          </View>
          <View style={styles.arrivalTextWrapper}>
            <Text style={styles.arrivalTitle}>You have reached the customer location</Text>
            <Text style={styles.arrivalAddress}>
              Barauni, Ward No. 22, Near Power House Road,{'\n'}
              Begusarai, Bihar - 851101
            </Text>
          </View>
        </View>

        {/* 4-Digit Verification Card */}
        <View style={styles.verificationCard}>
          {/* Shield Badge Icon */}
          <View style={styles.shieldBadge}>
            <Ionicons name="shield-checkmark" size={22} color="#0052FF" />
          </View>

          <Text style={styles.cardTitle}>Enter 4-Digit Verification Code</Text>
          <Text style={styles.cardSubtitle}>
            Please ask the customer for the 4-digit code{'\n'}shown in their booking.
          </Text>

          {/* 4 Code Input Boxes */}
          <View style={styles.codeBoxesRow}>
            {[0, 1, 2, 3].map((idx) => {
              const val = code[idx];
              const isCurrent = (val === '' && (idx === 0 || code[idx - 1] !== '')) || (idx === 0 && code.every(c => c === ''));
              return (
                <View
                  key={idx}
                  style={[
                    styles.codeBox,
                    isCurrent && styles.codeBoxFocused,
                    val !== '' && styles.codeBoxFilled,
                  ]}
                >
                  {val !== '' ? (
                    <Text style={styles.codeDigit}>{val}</Text>
                  ) : isCurrent ? (
                    <View style={styles.cursorBlink} />
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Security Subtext */}
          <View style={styles.securitySubRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#64748B"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.securityText}>
              This code verifies that you have reached the correct customer.
            </Text>
          </View>
        </View>

        {/* Where is the Code? Information Card */}
        <View style={styles.helpCard}>
          {/* Smartphone Graphic Vector */}
          <View style={styles.phoneGraphicContainer}>
            <Svg width={44} height={60} viewBox="0 0 44 60">
              <Rect
                x={4}
                y={2}
                width={36}
                height={56}
                rx={8}
                fill="#0052FF"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <Rect x={8} y={8} width={28} height={44} rx={4} fill="#FFFFFF" />
              {/* Screen Content: Stars */}
              <SvgText
                x={22}
                y={32}
                fontSize="12"
                fontWeight="bold"
                fill="#0052FF"
                textAnchor="middle"
              >
                ★★★★
              </SvgText>
            </Svg>
          </View>

          <View style={styles.helpTextWrapper}>
            <Text style={styles.helpTitle}>Where is the code?</Text>
            <Text style={styles.helpDescription}>
              The customer can find this 4-digit code in their booking details in the SlotB app.
            </Text>
          </View>
        </View>

        {/* Verify Code Primary Button */}
        <Pressable
          onPress={handleVerifyCode}
          style={({ pressed }) => [
            styles.verifyButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.verifyButtonText}>Verify Code</Text>
        </Pressable>
      </ScrollView>

      {/* Numeric Keypad at bottom */}
      <NumericKeypad
        onNumberPress={handleNumberPress}
        onDeletePress={handleDeletePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#005BEA',
  },
  headerSafe: {
    backgroundColor: '#005BEA',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  arrivalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  arrivalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  arrivalTextWrapper: {
    flex: 1,
  },
  arrivalTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  arrivalAddress: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  shieldBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  codeBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
  },
  codeBox: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFocused: {
    borderColor: '#0052FF',
    backgroundColor: '#F8FAFF',
  },
  codeBoxFilled: {
    borderColor: '#0052FF',
    backgroundColor: '#FFFFFF',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  cursorBlink: {
    width: 2,
    height: 24,
    backgroundColor: '#0052FF',
    borderRadius: 1,
  },
  securitySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  securityText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  phoneGraphicContainer: {
    marginRight: 12,
  },
  helpTextWrapper: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0052FF',
    marginBottom: 3,
  },
  helpDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  verifyButton: {
    backgroundColor: '#0052FF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
