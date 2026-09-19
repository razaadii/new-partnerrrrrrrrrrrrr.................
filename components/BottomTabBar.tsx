import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export type TabName = 'home' | 'jobs' | 'earnings' | 'profile';

interface BottomTabBarProps {
  activeTab: TabName;
  activeColorOverride?: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  activeColorOverride,
}) => {
  const router = useRouter();

  const handleTabPress = (tab: TabName) => {
    if (tab === activeTab) return;

    if (tab === 'home') {
      router.push('/dashboard' as any);
    } else if (tab === 'jobs') {
      router.push('/jobs' as any);
    } else if (tab === 'earnings') {
      router.push('/earnings' as any);
    } else if (tab === 'profile') {
      router.push('/profile' as any);
    }
  };

  const tabs: {
    key: TabName;
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
    activeColor: string;
  }[] = [
    {
      key: 'home',
      label: 'Home',
      iconActive: 'home',
      iconInactive: 'home-outline',
      activeColor: '#0066F5',
    },
    {
      key: 'jobs',
      label: 'Jobs',
      iconActive: 'calendar',
      iconInactive: 'calendar-outline',
      activeColor: '#0066F5',
    },
    {
      key: 'earnings',
      label: 'Earnings',
      iconActive: 'wallet',
      iconInactive: 'wallet-outline',
      activeColor: '#0066F5',
    },
    {
      key: 'profile',
      label: 'Profile',
      iconActive: 'person',
      iconInactive: 'person-outline',
      activeColor: '#16A34A',
    },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const effectiveActiveColor = activeColorOverride || tab.activeColor;
        const color = isActive ? effectiveActiveColor : '#94A3B8';

        return (
          <Pressable
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            style={styles.tabItem}
            hitSlop={8}
          >
            <View style={styles.iconContainer}>
              {isActive && (
                <View
                  style={[styles.topIndicator, { backgroundColor: effectiveActiveColor }]}
                />
              )}
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
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

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
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
