import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { SlotBLogo } from '../components/SlotBLogo';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Smooth loading animation over 2.2 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start(() => {
      // Auto navigate to login screen
      router.replace('/login' as any);
    });
  }, []);

  const handleSkip = () => {
    router.replace('/login' as any);
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable style={styles.screen} onPress={handleSkip}>
      <StatusBar style="light" />

      {/* Faint Background Watermarks */}
      <View style={styles.backgroundGraphic} pointerEvents="none">
        <Svg width={width} height="100%" viewBox={`0 0 ${width} 700`}>
          {/* Top-left subtle curved arc */}
          <Circle
            cx={0}
            cy={100}
            r={120}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={35}
            fill="none"
          />
          {/* Top-right subtle map pin watermark */}
          <Path
            d="M320 60 C290 60 270 85 270 115 C270 150 315 190 320 195 C325 190 370 150 370 115 C370 85 350 60 320 60 Z"
            fill="rgba(255, 255, 255, 0.04)"
          />
          {/* Bottom-left subtle circle */}
          <Circle
            cx={20}
            cy={620}
            r={90}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={30}
            fill="none"
          />
        </Svg>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Center Brand & Tagline Block */}
          <View style={styles.centerBlock}>
            {/* SlotB Logo with Orange Badge & White Text */}
            <SlotBLogo badgeVariant="orange" size="large" textColor="#FFFFFF" />

            {/* Manage Your Business Smarter */}
            <View style={styles.taglineBlock}>
              <Text style={styles.taglineMain}>Manage Your Business</Text>
              <Text style={styles.taglineAccent}>Smarter</Text>
            </View>

            {/* 3 Highlight Feature Icons */}
            <View style={styles.featuresRow}>
              {/* Feature 1: Manage Bookings */}
              <View style={styles.featureItem}>
                <View style={styles.iconBox}>
                  <Ionicons name="calendar-outline" size={26} color="#FFFFFF" />
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color="#FF6B00"
                    style={styles.featureMiniBadge}
                  />
                </View>
                <Text style={styles.featureLabel}>Manage Bookings</Text>
              </View>

              {/* Feature 2: Track Earnings */}
              <View style={styles.featureItem}>
                <View style={styles.iconBox}>
                  <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color="#FF6B00"
                    style={styles.featureArrowBadge}
                  />
                </View>
                <Text style={styles.featureLabel}>Track Earnings</Text>
              </View>

              {/* Feature 3: Control Availability */}
              <View style={styles.featureItem}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name="storefront-outline"
                    size={26}
                    color="#FFFFFF"
                  />
                  <Ionicons
                    name="settings"
                    size={13}
                    color="#FF6B00"
                    style={styles.featureMiniBadge}
                  />
                </View>
                <Text style={styles.featureLabel}>Control Availability</Text>
              </View>
            </View>
          </View>

          {/* Bottom Loading Progress Bar */}
          <View style={styles.bottomBlock}>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[styles.progressBarFill, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0047FF',
  },
  backgroundGraphic: {
    ...StyleSheet.absoluteFill,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taglineBlock: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 42,
  },
  taglineMain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  taglineAccent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B00',
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
    width: 88,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  featureMiniBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  featureArrowBadge: {
    position: 'absolute',
    top: 4,
    right: 5,
  },
  featureLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
  bottomBlock: {
    alignItems: 'center',
  },
  progressBarTrack: {
    width: 140,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 10,
    fontWeight: '500',
  },
});
