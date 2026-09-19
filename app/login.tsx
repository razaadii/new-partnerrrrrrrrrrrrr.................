import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { api } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('123@gym');
  const [password, setPassword] = useState('123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter your Partner ID / email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(email.trim(), password);

      if (res && res.success) {
        const partner = res.data?.partner;
        const businessType = partner?.business_type || (email.includes('gym') ? 'gym' : 'service');

        if (businessType === 'gym') {
          router.replace('/gym/dashboard' as any);
        } else {
          router.replace('/dashboard' as any);
        }
      } else {
        const msg = res?.message || 'Invalid Gym ID or password.';
        setErrorMessage(msg);
        Alert.alert('Login Failed', msg);
      }
    } catch (e: any) {
      setErrorMessage('Unable to connect to SlotB server. Check that backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (type: 'gym' | 'service') => {
    setErrorMessage('');
    if (type === 'gym') {
      setEmail('123@gym');
      setPassword('123');
    } else {
      setEmail('123@aadii');
      setPassword('123');
    }
  };

  const handleCreateAccount = () => {
    router.push('/register' as any);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Memoized decorative city skyline */}
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
              <Text style={styles.subtitle}>Login to manage your business</Text>

              {/* Demo Account Switcher */}
              <View style={styles.demoSwitcher}>
                <Pressable
                  onPress={() => handleSelectDemo('gym')}
                  style={[
                    styles.demoPill,
                    email === '123@gym' && styles.demoPillActive,
                  ]}
                >
                  <Ionicons
                    name="barbell"
                    size={14}
                    color={email === '123@gym' ? '#FFFFFF' : '#0052FF'}
                  />
                  <Text
                    style={[
                      styles.demoPillText,
                      email === '123@gym' && styles.demoPillTextActive,
                    ]}
                  >
                    Gym Owner (123@gym)
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectDemo('service')}
                  style={[
                    styles.demoPill,
                    email === '123@aadii' && styles.demoPillActive,
                  ]}
                >
                  <Ionicons
                    name="construct"
                    size={14}
                    color={email === '123@aadii' ? '#FFFFFF' : '#0052FF'}
                  />
                  <Text
                    style={[
                      styles.demoPillText,
                      email === '123@aadii' && styles.demoPillTextActive,
                    ]}
                  >
                    Service Tech (123@aadii)
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Elevated White Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log In</Text>
              <Text style={styles.cardSubtitle}>
                Enter your credentials to continue
              </Text>

              {/* Error Banner if login fails */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Partner ID / Email Input */}
              <InputField
                label="Partner / Gym ID"
                placeholder="Enter Gym ID (e.g. 123@gym)"
                leftIconName="person-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage('');
                }}
              />

              {/* Password Input */}
              <InputField
                label="Password"
                placeholder="Enter your password"
                leftIconName="lock-closed-outline"
                isPassword={true}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage('');
                }}
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
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && styles.loginButtonPressed,
                  loading && styles.loginButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
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
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '400',
  },
  demoSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  demoPillActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0052FF',
  },
  demoPillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
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
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12.5,
    color: '#B91C1C',
    fontWeight: '500',
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
    marginTop: 20,
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
