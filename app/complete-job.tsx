import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabBar } from '../components/BottomTabBar';

export default function CompleteJobScreen() {
  const router = useRouter();

  const [serviceStatus, setServiceStatus] = useState<'completed' | 'not_completed'>('completed');
  const [notes, setNotes] = useState('');

  const handleBack = () => {
    router.push('/location-verified' as any);
  };

  const handleSecurityInfo = () => {
    Alert.alert(
      'Security & Verification',
      'All job milestones are GPS verified and time-stamped for customer and partner protection.'
    );
  };

  const handleCall = () => {
    Linking.openURL('tel:+919123456789').catch(() => {
      Alert.alert('Call', 'Unable to open phone dialer on this device.');
    });
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919123456789').catch(() => {
      Alert.alert('WhatsApp', 'Unable to open WhatsApp on this device.');
    });
  };

  const handleCompleteJob = () => {
    if (serviceStatus === 'not_completed') {
      Alert.alert(
        'Job Not Completed',
        'Are you sure you want to mark this job as not completed? Our partner support team will contact you.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit Report',
            style: 'destructive',
            onPress: () => {
              Alert.alert('Report Submitted', 'Support will review the case.', [
                {
                  text: 'OK',
                  onPress: () => router.push('/dashboard' as any),
                },
              ]);
            },
          },
        ]
      );
      return;
    }

    // Success Completion Flow
    Alert.alert(
      'Job Completed Successfully! 🎉',
      'Thank you for providing excellent service. ₹699 will be credited to your partner earnings.',
      [
        {
          text: 'Go to Dashboard',
          onPress: () => {
            router.push('/dashboard' as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Forest Green Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            {/* Back Button */}
            <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Title */}
            <Text style={styles.headerTitle}>Complete Job</Text>

            {/* Right Shield Icon */}
            <Pressable onPress={handleSecurityInfo} style={styles.headerIconBtn} hitSlop={10}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Stepper Progress Bar */}
          <View style={styles.stepperWrapper}>
            <View style={styles.stepperRow}>
              {/* Step 1: Accepted */}
              <View style={styles.stepCol}>
                <View style={styles.stepCircleDone}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.stepLabel}>Accepted</Text>
              </View>

              <View style={styles.stepLineDone} />

              {/* Step 2: On The Way */}
              <View style={styles.stepCol}>
                <View style={styles.stepCircleDone}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.stepLabel}>On The Way</Text>
              </View>

              <View style={styles.stepLineDone} />

              {/* Step 3: Location Verified */}
              <View style={styles.stepCol}>
                <View style={styles.stepCircleDone}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.stepLabel}>Location Verified</Text>
              </View>

              <View style={styles.stepLineDone} />

              {/* Step 4: Complete Job */}
              <View style={styles.stepCol}>
                <View style={styles.stepCircleActive}>
                  <Text style={styles.stepNumberActive}>4</Text>
                </View>
                <Text style={[styles.stepLabel, styles.stepLabelActive]}>Complete Job</Text>
              </View>
            </View>
          </View>

          {/* Service Completed? Card */}
          <View style={styles.card}>
            <View style={styles.serviceCompletedHeader}>
              <View style={styles.completedIconCircle}>
                <Ionicons name="checkmark-circle-outline" size={26} color="#16A34A" />
              </View>
              <View style={styles.serviceCompletedText}>
                <Text style={styles.serviceCompletedTitle}>Service Completed?</Text>
                <Text style={styles.serviceCompletedSubtitle}>
                  Please confirm that the job is completed successfully.
                </Text>
              </View>
            </View>

            {/* Selection Buttons Row */}
            <View style={styles.confirmationRow}>
              {/* Yes, Completed Button */}
              <Pressable
                onPress={() => setServiceStatus('completed')}
                style={[
                  styles.confirmBtn,
                  styles.yesBtn,
                  serviceStatus === 'completed' && styles.yesBtnActive,
                ]}
              >
                <Ionicons
                  name="thumbs-up"
                  size={16}
                  color={serviceStatus === 'completed' ? '#16A34A' : '#15803D'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.confirmBtnText,
                    styles.yesBtnText,
                    serviceStatus === 'completed' && styles.yesBtnTextActive,
                  ]}
                >
                  Yes, Completed
                </Text>
              </Pressable>

              {/* Not Completed Button */}
              <Pressable
                onPress={() => setServiceStatus('not_completed')}
                style={[
                  styles.confirmBtn,
                  styles.noBtn,
                  serviceStatus === 'not_completed' && styles.noBtnActive,
                ]}
              >
                <Ionicons
                  name="thumbs-down"
                  size={16}
                  color="#EF4444"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.confirmBtnText,
                    styles.noBtnText,
                    serviceStatus === 'not_completed' && styles.noBtnTextActive,
                  ]}
                >
                  Not Completed
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Customer Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Customer Details</Text>

            <View style={styles.customerRow}>
              {/* Avatar Circle */}
              <View style={styles.avatarCircleGreen}>
                <Ionicons name="person" size={26} color="#16A34A" />
              </View>

              {/* Customer Info */}
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
                <View style={styles.metaLine}>
                  <Text style={styles.metaLabel}>Booking ID</Text>
                  <Text style={styles.metaValue}>#AC1254</Text>
                </View>
                <View style={styles.metaLine}>
                  <Text style={styles.metaLabel}>Scheduled Time</Text>
                  <Text style={styles.metaValue}>Today, 10:30 AM</Text>
                </View>
                <View style={styles.metaLine}>
                  <Text style={styles.metaLabel}>Started At</Text>
                  <Text style={styles.metaValue}>10:45 AM</Text>
                </View>
              </View>

              {/* Amount Box */}
              <View style={styles.amountBadgeBox}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>₹699</Text>
              </View>
            </View>
          </View>

          {/* Please Note Banner Card */}
          <View style={styles.pleaseNoteBox}>
            <Ionicons name="clipboard-outline" size={22} color="#0052FF" style={styles.noteIcon} />
            <View style={styles.noteTextBlock}>
              <Text style={styles.noteTitle}>Please Note</Text>
              <Text style={styles.noteDesc}>
                Make sure the service is completed properly and customer is satisfied before completing the job.
              </Text>
            </View>
          </View>

          {/* Add Notes Section */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Add Notes (Optional)</Text>
            <View style={styles.notesInputWrapper}>
              <TextInput
                placeholder="Write any notes about the job (optional)"
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                style={styles.notesInput}
                multiline={false}
              />
            </View>
          </View>

          {/* Complete Job Primary Action Button */}
          <Pressable
            onPress={handleCompleteJob}
            style={({ pressed }) => [
              styles.completeJobBtn,
              pressed && styles.completeJobBtnPressed,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.completeJobBtnText}>Complete Job</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation Tab Bar with green Jobs tab */}
      <BottomTabBar activeTab="jobs" activeColorOverride="#16A34A" />
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  stepperWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: 70,
  },
  stepCircleDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNumberActive: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  stepLineDone: {
    flex: 1,
    height: 2,
    backgroundColor: '#16A34A',
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: 9.5,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
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
  serviceCompletedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceCompletedText: {
    flex: 1,
  },
  serviceCompletedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  serviceCompletedSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  confirmationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  yesBtn: {
    borderColor: '#16A34A',
    backgroundColor: '#FFFFFF',
  },
  yesBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  yesBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
  yesBtnTextActive: {
    color: '#15803D',
  },
  noBtn: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
  },
  noBtnActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  noBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  noBtnTextActive: {
    color: '#DC2626',
  },
  confirmBtnText: {
    fontWeight: '700',
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
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 11.5,
    color: '#64748B',
    width: 105,
  },
  metaValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
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
  pleaseNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
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
  notesSection: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  notesInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
  },
  notesInput: {
    fontSize: 13,
    color: '#0F172A',
  },
  completeJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    height: 50,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeJobBtnPressed: {
    opacity: 0.9,
    backgroundColor: '#15803D',
  },
  completeJobBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
