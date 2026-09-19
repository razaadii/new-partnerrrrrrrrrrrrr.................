import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export const ReviewSuccessGraphic: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={200} height={200} viewBox="0 0 200 200">
        {/* Outer Halo Rings */}
        <Circle cx={100} cy={100} r={80} fill="#EFF6FF" opacity={0.6} />
        <Circle cx={100} cy={100} r={65} fill="#E2EDFD" opacity={0.7} />

        {/* Floating Confetti Accents */}
        {/* Top left orange diamond */}
        <Rect
          x={35}
          y={40}
          width={6}
          height={6}
          fill="#FF9900"
          transform="rotate(45 38 43)"
        />
        {/* Top right blue dot */}
        <Circle cx={165} cy={48} r={3} fill="#60A5FA" />
        {/* Right orange cross */}
        <Path d="M172 90 H178 M175 87 V93" stroke="#FF9900" strokeWidth={2} strokeLinecap="round" />
        {/* Bottom left green curve */}
        <Path
          d="M38 150 Q43 145 48 152"
          stroke="#10B981"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom right blue cross */}
        <Path d="M160 148 H166 M163 145 V151" stroke="#3B82F6" strokeWidth={2} strokeLinecap="round" />

        {/* Center White Circular Badge */}
        <Circle
          cx={100}
          cy={100}
          r={45}
          fill="#FFFFFF"
          stroke="#EBF2FE"
          strokeWidth={2}
        />

        {/* Clipboard Icon */}
        <G transform="translate(82, 75)">
          {/* Clipboard body */}
          <Rect
            x={2}
            y={8}
            width={32}
            height={40}
            rx={5}
            fill="none"
            stroke="#0052FF"
            strokeWidth={3}
          />
          {/* Clip top */}
          <Path
            d="M13 8 V5 C13 3.5 14.5 2 16 2 H20 C21.5 2 23 3.5 23 5 V8"
            fill="none"
            stroke="#0052FF"
            strokeWidth={2.5}
          />
          {/* Document Lines */}
          <Path d="M9 18 H27" stroke="#0052FF" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M9 25 H27" stroke="#0052FF" strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M9 32 H20" stroke="#0052FF" strokeWidth={2.5} strokeLinecap="round" />

          {/* Overlapping Verified Checkmark Badge */}
          <G transform="translate(20, 26)">
            <Circle cx={12} cy={12} r={12} fill="#0052FF" />
            <Path
              d="M7 12 L10.5 15.5 L17 9"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
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
    marginVertical: 14,
  },
});
