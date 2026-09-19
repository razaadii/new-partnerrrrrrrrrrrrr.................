import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface SlotBLogoProps {
  badgeVariant?: 'blue' | 'orange';
  size?: 'small' | 'medium' | 'large';
  textColor?: string;
}

export const SlotBLogo: React.FC<SlotBLogoProps> = ({
  badgeVariant = 'blue',
  size = 'medium',
  textColor = '#0052FF',
}) => {
  const isLarge = size === 'large';
  const fontSize = isLarge ? 48 : 38;
  const pinSize = isLarge ? 34 : 26;
  const burstSize = isLarge ? 28 : 22;

  const badgeBg = badgeVariant === 'orange' ? '#FF6B00' : '#0052FF';

  return (
    <View style={styles.container}>
      {/* Main Logo Row */}
      <View style={styles.logoRow}>
        {/* 'sl' */}
        <Text style={[styles.letterText, { fontSize, color: textColor }]}>sl</Text>

        {/* Orange Map Pin for 'o' */}
        <View style={[styles.pinWrapper, { width: pinSize, height: pinSize * 1.3 }]}>
          <Svg
            width={pinSize}
            height={pinSize * 1.3}
            viewBox="0 0 24 32"
            fill="none"
          >
            {/* Map Pin body */}
            <Path
              d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 10.5 30.5 11.5 31.5C11.75 31.75 12.25 31.75 12.5 31.5C13.5 30.5 24 19.5 24 12C24 5.37258 18.6274 0 12 0Z"
              fill="#FF6B00"
            />
            {/* Inner white circle */}
            <Circle cx="12" cy="11.5" r="4.5" fill="#FFFFFF" />
          </Svg>
        </View>

        {/* 't' */}
        <Text style={[styles.letterText, { fontSize, color: textColor }]}>t</Text>

        {/* 'b' with Burst Rays */}
        <View style={styles.bWrapper}>
          <Text style={[styles.letterText, { fontSize, color: textColor }]}>b</Text>
          {/* 3 orange burst rays */}
          <View style={[styles.burstWrapper, { width: burstSize, height: burstSize }]}>
            <Svg width={burstSize} height={burstSize} viewBox="0 0 20 20" fill="none">
              <Path
                d="M4 14L1 15"
                stroke="#FF6B00"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <Path
                d="M7 8L4 5"
                stroke="#FF6B00"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <Path
                d="M13 5L15 2"
                stroke="#FF6B00"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        </View>
      </View>

      {/* 'PARTNER' Badge */}
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={styles.badgeText}>PARTNER</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontWeight: '900',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  pinWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
    marginTop: 2,
  },
  bWrapper: {
    position: 'relative',
    flexDirection: 'row',
  },
  burstWrapper: {
    position: 'absolute',
    top: -8,
    right: -14,
  },
  badge: {
    marginTop: 3,
    paddingHorizontal: 14,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
