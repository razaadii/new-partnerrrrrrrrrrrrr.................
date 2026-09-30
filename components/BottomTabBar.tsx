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

    // Use router.replace to avoid stack accumulation and jarring slide transitions
    if (tab === 'home') {
      router.replace('/dashboard' as any);
    } else if (tab === 'jobs') {
      router.replace('/jobs' as any);
    } else if (tab === 'earnings') {
      router.replace('/earnings' as any);
    } else if (tab === 'profile') {
      router.replace('/profile' as any);
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
      activeColor: '#0052FF',
    },
    {
      key: 'jobs',
      label: 'Jobs',
      iconActive: 'calendar',
      iconInactive: 'calendar-outline',
      activeColor: '#0052FF',
    },
    {
      key: 'earnings',
      label: 'Earnings',
      iconActive: 'wallet',
      iconInactive: 'wallet-outline',
      activeColor: '#0052FF',
    },
    {
      key: 'profile',
      label: 'Profile',
      iconActive: 'person',
      iconInactive: 'person-outline',
      activeColor: '#0052FF', // Unified brand royal blue instead of green
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
            style={({ pressed }) => [
              styles.tabItem,
              pressed && styles.tabItemPressed,
            ]}
            hitSlop={8}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
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
    height: Platform.OS === 'ios' ? 84 : 66,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 30,
    width: 44,
    borderRadius: 15,
  },
  iconContainerActive: {
    backgroundColor: '#EFF6FF',
  },
  topIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
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
    color: '#0052FF',
  },
});
