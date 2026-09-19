import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export const MailShieldGraphic: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={220} height={160} viewBox="0 0 220 160">
        {/* Soft background aura */}
        <Circle cx={110} cy={80} r={65} fill="#EEF5FF" opacity={0.8} />

        {/* Small decorative stars / crosses */}
        {/* Top left blue + */}
        <Path d="M38 52 H44 M41 49 V55" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />
        {/* Top right orange + */}
        <Path d="M178 56 H184 M181 53 V59" stroke="#FF8A00" strokeWidth={2} strokeLinecap="round" />
        {/* Bottom left orange dot */}
        <Circle cx={48} cy={110} r={2.5} fill="#FF8A00" />
        {/* Right blue + */}
        <Path d="M182 98 H188 M185 95 V101" stroke="#60A5FA" strokeWidth={1.8} strokeLinecap="round" />

        {/* Floating Mail Envelope */}
        <G transform="translate(45, 42)">
          {/* Envelope Body */}
          <Rect
            x={0}
            y={24}
            width={130}
            height={82}
            rx={10}
            fill="#FFFFFF"
            stroke="#D6E4FC"
            strokeWidth={1.5}
          />

          {/* Envelope fold shadows */}
          <Path
            d="M0 26 L65 72 L130 26"
            fill="none"
            stroke="#E0ECFE"
            strokeWidth={1.5}
          />
          <Path
            d="M0 104 L48 62 M130 104 L82 62"
            fill="none"
            stroke="#E8F1FE"
            strokeWidth={1.5}
          />

          {/* Vibrant Royal Blue Shield */}
          <G transform="translate(42, 0)">
            <Path
              d="M23 0 L46 8 V24 C46 38 23 48 23 48 C23 48 0 38 0 24 V8 L23 0 Z"
              fill="#0052FF"
            />
            {/* White Checkmark */}
            <Path
              d="M14 24 L20 30 L32 18"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>

          {/* Circle '@' Badge on lower right */}
          <G transform="translate(92, 54)">
            <Circle cx={18} cy={18} r={18} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.5} />
            <Circle cx={18} cy={18} r={14} fill="#EFF6FF" />
            <Path
              d="M18 10 C14 10 11 13 11 18 C11 23 14 26 18 26 C21 26 23.5 24.5 24.5 22.5 L22.5 21.5 C21.5 23 20 24 18 24 C15 24 13 21.5 13 18 C13 14.5 15 12 18 12 C21.5 12 23 14 23 17 V19 C23 20 23.5 20.5 24 20.5 C24.5 20.5 25 20 25 19 V17 C25 13 22 10 18 10 Z"
              fill="#0052FF"
            />
            <Circle cx={18} cy={18} r={2.5} fill="#0052FF" />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});
