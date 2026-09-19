import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export type GymTabName = 'home' | 'members' | 'attendance' | 'payments' | 'profile';

interface GymBottomTabBarProps {
  activeTab: GymTabName;
}

export const GymBottomTabBar: React.FC<GymBottomTabBarProps> = React.memo(({ activeTab }) => {
  const router = useRouter();

  const handleTabPress = (tab: GymTabName) => {
    if (tab === activeTab) return;

    if (tab === 'home') {
      router.push('/gym/dashboard' as any);
    } else if (tab === 'members') {
      router.push('/gym/members' as any);
    } else if (tab === 'attendance') {
      router.push('/gym/attendance' as any);
    } else if (tab === 'payments') {
      router.push('/gym/payments' as any);
    } else if (tab === 'profile') {
      router.push('/gym/profile' as any);
    }
  };

  const tabs: {
    key: GymTabName;
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      key: 'home',
      label: 'Home',
      iconActive: 'grid',
      iconInactive: 'grid-outline',
    },
    {
      key: 'members',
      label: 'Members',
      iconActive: 'people',
      iconInactive: 'people-outline',
    },
    {
      key: 'attendance',
      label: 'Attendance',
      iconActive: 'calendar',
      iconInactive: 'calendar-outline',
    },
    {
      key: 'payments',
      label: 'Payments',
      iconActive: 'wallet',
      iconInactive: 'wallet-outline',
    },
    {
      key: 'profile',
      label: 'Gym Profile',
      iconActive: 'barbell',
      iconInactive: 'barbell-outline',
    },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? '#0052FF' : '#94A3B8';

        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabItem}
            hitSlop={6}
          >
            <View style={styles.iconContainer}>
              {isActive && <View style={styles.topIndicator} />}
              <Ionicons
                name={isActive ? tab.iconActive : tab.iconInactive}
                size={22}
                color={color}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color },
                isActive && styles.tabLabelActive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
    width: 38,
  },
  topIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0052FF',
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#0052FF',
  },
});
