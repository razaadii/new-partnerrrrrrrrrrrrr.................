import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { BottomTabBar } from '../components/BottomTabBar';

type JobStatus = 'active' | 'pending' | 'completed';
type FilterType = 'all' | 'active' | 'pending' | 'completed';

interface JobItem {
  id: string;
  serviceTitle: string;
  status: JobStatus;
  customerName: string;
  location: string;
  time: string;
  amount: number;
  iconType: 'install' | 'gas' | 'service' | 'repair' | 'maintenance';
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'AC1254',
    serviceTitle: 'AC Installation',
    status: 'active',
    customerName: 'Rahul Kumar',
    location: 'Barauni, Begusarai',
    time: '10:30 AM • 24 May 2025',
    amount: 699,
    iconType: 'install',
  },
  {
    id: 'AC1255',
    serviceTitle: 'AC Gas Refill',
    status: 'pending',
    customerName: 'Amit Singh',
    location: 'Begusarai',
    time: '12:00 PM • 24 May 2025',
    amount: 899,
    iconType: 'gas',
  },
  {
    id: 'AC1250',
    serviceTitle: 'AC Service',
    status: 'completed',
    customerName: 'Rakesh Kumar',
    location: 'Teghra, Begusarai',
    time: '02:30 PM • 24 May 2025',
    amount: 499,
    iconType: 'service',
  },
  {
    id: 'AC1256',
    serviceTitle: 'AC Repair',
    status: 'pending',
    customerName: 'Vikash Kumar',
    location: 'Begusarai',
    time: '04:30 PM • 24 May 2025',
    amount: 599,
    iconType: 'repair',
  },
  {
    id: 'AC1248',
    serviceTitle: 'AC Maintenance',
    status: 'completed',
    customerName: 'Sanjeet Kumar',
    location: 'Barauni, Begusarai',
    time: '06:00 PM • 24 May 2025',
    amount: 399,
    iconType: 'maintenance',
  },
];

export default function JobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [filter, setFilter] = useState<FilterType>(
    (params.filter as FilterType) || 'all'
  );
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);

  const handleNotifications = () => {
    Alert.alert(
      'New Job Leads (3)',
      '1. AC Installation - Barauni (₹699)\n2. AC Gas Refill - Begusarai (₹899)\n3. AC Repair - Begusarai (₹599)'
    );
  };

  const handleAcceptJob = (jobId: string, title: string) => {
    Alert.alert(
      'Accept Job Lead?',
      `Are you sure you want to accept "${title}"? The customer will be notified that you are assigned.`,
      [
        { text: 'Decline', style: 'cancel' },
        {
          text: 'Accept Job',
          onPress: () => {
            setJobs((prev) =>
              prev.map((j) => (j.id === jobId ? { ...j, status: 'active' } : j))
            );
            Alert.alert(
              'Job Accepted! 🎉',
              `"${title}" is now Active. You can start the job when ready to navigate to the customer.`
            );
          },
        },
      ]
    );
  };

  const handleStartJob = (job: JobItem) => {
    // Navigate to Live Location tracking and arrival screen
    router.push('/live-location' as any);
  };

  const handleViewReceipt = (job: JobItem) => {
    Alert.alert(
      `Job Completed (#${job.id})`,
      `Service: ${job.serviceTitle}\nCustomer: ${job.customerName}\nLocation: ${job.location}\nAmount: ₹${job.amount}\nStatus: Paid & Settled to Wallet`
    );
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const activeCount = jobs.filter((j) => j.status === 'active').length;
  const pendingCount = jobs.filter((j) => j.status === 'pending').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  const renderServiceIcon = (type: JobItem['iconType']) => {
    switch (type) {
      case 'install':
        return (
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="air-conditioner" size={24} color="#0052FF" />
            <Ionicons name="snow" size={10} color="#0052FF" style={styles.miniIcon} />
          </View>
        );
      case 'gas':
        return (
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="air-conditioner" size={24} color="#0052FF" />
            <Ionicons name="construct" size={10} color="#0052FF" style={styles.miniIcon} />
          </View>
        );
      case 'service':
        return (
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="air-conditioner" size={24} color="#0052FF" />
            <Ionicons name="sparkles" size={10} color="#0052FF" style={styles.miniIcon} />
          </View>
        );
      case 'repair':
        return (
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="air-conditioner" size={24} color="#0052FF" />
            <Ionicons name="water" size={10} color="#0052FF" style={styles.miniIcon} />
          </View>
        );
      case 'maintenance':
      default:
        return (
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="air-conditioner" size={24} color="#0052FF" />
            <Ionicons name="shield-checkmark" size={10} color="#0052FF" style={styles.miniIcon} />
          </View>
        );
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* Royal Blue Header */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerRow}>
            {/* Title & Metadata */}
            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerTitle}>My Jobs</Text>
              <View style={styles.categoryRow}>
                <Ionicons name="snow" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.categoryText}>AC Technician</Text>
              </View>
              <Text style={styles.todayMetaText}>Today • {jobs.length} Jobs</Text>
            </View>

            {/* Notification Bell */}
            <Pressable
              onPress={handleNotifications}
              style={styles.bellBtn}
              hitSlop={8}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>3</Text>
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* Filter Tabs Bar */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* All Filter */}
          <Pressable
            onPress={() => setFilter('all')}
            style={[
              styles.filterPill,
              filter === 'all' ? styles.filterPillActiveBlue : styles.filterPillInactive,
            ]}
          >
            <Feather
              name="sliders"
              size={13}
              color={filter === 'all' ? '#FFFFFF' : '#475569'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterText,
                filter === 'all' ? styles.filterTextActiveWhite : styles.filterTextInactive,
              ]}
            >
              All
            </Text>
          </Pressable>

          {/* Active Filter */}
          <Pressable
            onPress={() => setFilter('active')}
            style={[
              styles.filterPill,
              filter === 'active' ? styles.filterPillActiveBlue : styles.filterPillInactive,
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
            <Text
              style={[
                styles.filterText,
                filter === 'active' ? styles.filterTextActiveWhite : styles.filterTextInactive,
              ]}
            >
              Active {activeCount > 0 ? `(${activeCount})` : ''}
            </Text>
          </Pressable>

          {/* Pending Filter */}
          <Pressable
            onPress={() => setFilter('pending')}
            style={[
              styles.filterPill,
              filter === 'pending' ? styles.filterPillActiveBlue : styles.filterPillInactive,
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text
              style={[
                styles.filterText,
                filter === 'pending' ? styles.filterTextActiveWhite : styles.filterTextInactive,
              ]}
            >
              Pending {pendingCount > 0 ? `(${pendingCount})` : ''}
            </Text>
          </Pressable>

          {/* Completed Filter */}
          <Pressable
            onPress={() => setFilter('completed')}
            style={[
              styles.filterPill,
              filter === 'completed' ? styles.filterPillActiveBlue : styles.filterPillInactive,
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: '#0052FF' }]} />
            <Text
              style={[
                styles.filterText,
                filter === 'completed' ? styles.filterTextActiveWhite : styles.filterTextInactive,
              ]}
            >
              Completed {completedCount > 0 ? `(${completedCount})` : ''}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Jobs Scrollable List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyStateTitle}>No Jobs Found</Text>
            <Text style={styles.emptyStateDesc}>
              There are no jobs in this category for today.
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => {
            const isActive = job.status === 'active';
            const isPending = job.status === 'pending';
            const isCompleted = job.status === 'completed';

            return (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.cardTopRow}>
                  {/* Left Service Icon */}
                  {renderServiceIcon(job.iconType)}

                  {/* Service Info Block */}
                  <View style={styles.jobInfoBlock}>
                    <Text style={styles.serviceTitle}>{job.serviceTitle}</Text>

                    {/* Customer Name */}
                    <View style={styles.detailRow}>
                      <Ionicons name="person-outline" size={13} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.detailText}>{job.customerName}</Text>
                    </View>

                    {/* Location */}
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={13} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.detailText}>{job.location}</Text>
                    </View>

                    {/* Scheduled Time */}
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={13} color="#64748B" style={styles.rowIcon} />
                      <Text style={styles.detailText}>{job.time}</Text>
                    </View>
                  </View>

                  {/* Right Price and Status Badge */}
                  <View style={styles.priceStatusBlock}>
                    {/* Status Pill Badge */}
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                    {isPending && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                    {isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    )}

                    {/* Price Block */}
                    <View style={styles.priceContainer}>
                      <Text style={styles.amountText}>₹{job.amount}</Text>
                      <Text style={styles.amountLabel}>Total Amount</Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Action Button for Active / Pending */}
                {isActive && (
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => handleStartJob(job)}
                      style={({ pressed }) => [
                        styles.startJobButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.startJobButtonText}>Start Job</Text>
                    </Pressable>
                  </View>
                )}

                {isPending && (
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => handleAcceptJob(job.id, job.serviceTitle)}
                      style={({ pressed }) => [
                        styles.acceptJobButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.acceptJobButtonText}>Accept Job</Text>
                    </Pressable>
                  </View>
                )}

                {isCompleted && (
                  <Pressable
                    onPress={() => handleViewReceipt(job)}
                    style={styles.completedInfoRow}
                    hitSlop={6}
                  >
                    <Ionicons name="checkmark-done" size={14} color="#16A34A" style={{ marginRight: 4 }} />
                    <Text style={styles.completedInfoText}>Payment Settled • View Details</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Navigation Tab Bar with active Jobs tab */}
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
    backgroundColor: '#005BEA',
    paddingBottom: 16,
  },
  headerSafe: {
    backgroundColor: '#005BEA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13.5,
    fontWeight: '500',
  },
  todayMetaText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#005BEA',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActiveBlue: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterTextActiveWhite: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#334155',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  jobCard: {
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
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  miniIcon: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  jobInfoBlock: {
    flex: 1,
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowIcon: {
    marginRight: 5,
    width: 14,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
  },
  priceStatusBlock: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  completedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0052FF',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  amountLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  actionRow: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  startJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startJobButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  acceptJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0052FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptJobButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  completedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  completedInfoText: {
    fontSize: 11.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
