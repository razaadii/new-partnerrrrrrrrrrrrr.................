import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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
import { GoogleButton } from '../components/GoogleButton';
import { InputField } from '../components/InputField';
import { SlotBLogo } from '../components/SlotBLogo';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.push('/dashboard' as any);
  };

  const handleCreateAccount = () => {
    router.push('/register' as any);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Decorative city skyline & watermarks */}
      <CitySkylineBackground />

      <SafeAreaView style={styles.safeArea}>
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
            {/* Top Brand Header */}
            <View style={styles.header}>
              <SlotBLogo badgeVariant="blue" size="medium" />

              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Login to manage your businees</Text>
            </View>

            {/* Elevated White Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log In</Text>
              <Text style={styles.cardSubtitle}>
                Enter your details to continue
              </Text>

              {/* Email Address Input */}
              <InputField
                label="Email Address"
                placeholder="Enter your email address"
                leftIconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Password Input */}
              <InputField
                label="Password"
                placeholder="Enter your password"
                leftIconName="lock-closed-outline"
                isPassword={true}
                value={password}
                onChangeText={setPassword}
              />

              {/* Forgot Password Link */}
              <Pressable
                onPress={() => router.push('/verify-otp' as any)}
                style={styles.forgotPasswordButton}
                hitSlop={8}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>

              {/* Log In Button */}
              <Pressable
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                ]}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </Pressable>

              {/* OR Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Continue with Google Button */}
              <GoogleButton onPress={handleLogin} />
            </View>

            {/* Bottom Footer Call-to-action */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={handleCreateAccount} hitSlop={8}>
                <Text style={styles.createAccountText}>Create Account</Text>
              </Pressable>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 18,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0052FF',
  },
  loginButton: {
    height: 50,
    backgroundColor: '#0052FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#0046E0',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 12,
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
  createAccountText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0052FF',
    marginTop: 4,
  },
});
