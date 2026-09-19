import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CitySkylineBackground } from '../components/CitySkylineBackground';
import { InputField } from '../components/InputField';
import { SlotBLogo } from '../components/SlotBLogo';

const CATEGORIES = [
  'Salon & Beauty Parlour',
  'Gym & Fitness Studio',
  'Library & Study Space',
  'Spa & Wellness',
  'Healthcare & Clinic',
  'Other Services',
];

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const handleRegister = () => {
    // Navigate to OTP verification screen
    router.push({
      pathname: '/verify-otp',
      params: { email: email || 'rohan@example.com' },
    } as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Background Graphic */}
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

              <Text style={styles.title}>Register as a Partner</Text>
              <Text style={styles.subtitle}>
                Create your account to manage your business
              </Text>
            </View>

            {/* Elevated Form Card */}
            <View style={styles.card}>
              {/* Full Name */}
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                leftIconName="person-outline"
                value={fullName}
                onChangeText={setFullName}
              />

              {/* Mobile Number with +91 Prefix */}
              <InputField
                label="Mobile Number"
                placeholder="Enter your mobile number"
                leftIconName="call-outline"
                phonePrefix="+91"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
              />

              {/* Email Address */}
              <InputField
                label="Email Address"
                placeholder="Enter your email address"
                leftIconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Business / Shop Name */}
              <InputField
                label="Business / Shop Name"
                placeholder="Enter your business or shop name"
                leftIconName="storefront-outline"
                value={businessName}
                onChangeText={setBusinessName}
              />

              {/* Business Category Dropdown */}
              <InputField
                label="Select Business Category"
                placeholder="Choose your business category"
                leftIconName="grid-outline"
                isDropdown={true}
                value={category}
                onPress={() => setIsCategoryModalVisible(true)}
              />

              {/* Create Password */}
              <InputField
                label="Create Password"
                placeholder="Enter password"
                leftIconName="lock-closed-outline"
                isPassword={true}
                value={password}
                onChangeText={setPassword}
              />

              {/* Confirm Password */}
              <InputField
                label="Confirm Password"
                placeholder="Confirm password"
                leftIconName="lock-closed-outline"
                isPassword={true}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {/* Terms & Conditions Checkbox Row */}
              <Pressable
                onPress={() => setAgreed((prev) => !prev)}
                style={styles.checkboxRow}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Pressable>

              {/* Register as Partner Button */}
              <Pressable
                onPress={handleRegister}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed && styles.registerButtonPressed,
                ]}
              >
                <Text style={styles.registerButtonText}>Register as Partner</Text>
              </Pressable>
            </View>

            {/* Bottom Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text
                  onPress={() => router.push('/login' as any)}
                  style={styles.loginLink}
                >
                  Log In
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Category Picker Modal */}
      <Modal
        visible={isCategoryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {CATEGORIES.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.categoryItem,
                  category === item && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  setCategory(item);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {category === item && (
                  <Ionicons name="checkmark-circle" size={20} color="#0052FF" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 14,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  termsText: {
    flex: 1,
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  termsLink: {
    color: '#0052FF',
    fontWeight: '600',
  },
  registerButton: {
    height: 50,
    backgroundColor: '#0052FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonPressed: {
    backgroundColor: '#0046E0',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    color: '#0052FF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  categoryText: {
    fontSize: 14,
    color: '#334155',
  },
  categoryTextSelected: {
    fontWeight: '600',
    color: '#0052FF',
  },
});
