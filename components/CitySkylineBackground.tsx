import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

export const CitySkylineBackground: React.FC = React.memo(() => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top-Left Decorative Dot Matrix */}
      <View style={styles.dotMatrix}>
        <Svg width={90} height={70} viewBox="0 0 90 70">
          {[0, 18, 36, 54, 72].map((x) =>
            [0, 16, 32, 48].map((y) => (
              <Circle
                key={`${x}-${y}`}
                cx={x + 4}
                cy={y + 4}
                r={2}
                fill="#CBD5E1"
                opacity={0.65}
              />
            ))
          )}
        </Svg>
      </View>

      {/* Top-Right Decorative Translucent Location Pin */}
      <View style={styles.topRightPin}>
        <Svg width={140} height={180} viewBox="0 0 100 130">
          <Path
            d="M50 0C22.4 0 0 22.4 0 50C0 81.25 43.75 127 47.9 131.25C49 132.3 51 132.3 52.1 131.25C56.25 127 100 81.25 100 50C100 22.4 77.6 0 50 0Z"
            fill="#0052FF"
            opacity={0.07}
          />
          <Circle cx={50} cy={48} r={18} fill="#FFFFFF" opacity={0.6} />
        </Svg>
      </View>

      {/* Bottom Skyline Illustration */}
      <View style={styles.skylineWrapper}>
        <Svg width={width} height={110} viewBox={`0 0 ${width} 110`}>
          {/* Faint distant building layer */}
          <Path
            d={`M0 110 L0 55 L30 55 L30 40 L60 40 L60 65 L95 65 L95 30 L130 30 L130 70 L170 70 L170 45 L205 45 L205 60 L245 60 L245 25 L285 25 L285 65 L320 65 L320 40 L360 40 L360 55 L${width} 55 L${width} 110 Z`}
            fill="#E8F1FD"
            opacity={0.5}
          />

          {/* Nearer building & tree silhouettes */}
          <Path
            d={`M0 110 L0 75 L45 75 L45 60 L85 60 L85 80 L120 80 L120 50 L155 50 L155 75 L190 75 L190 62 L230 62 L230 85 L275 85 L275 48 L310 48 L310 75 L350 75 L350 58 L${width} 58 L${width} 110 Z`}
            fill="#DCEBFA"
            opacity={0.6}
          />

          {/* Little Storefront Awning (bottom left) */}
          <G transform="translate(24, 60)">
            <Rect x="0" y="14" width="42" height="36" rx="4" fill="#A8C8F7" />
            <Rect x="4" y="0" width="34" height="15" rx="3" fill="#0052FF" opacity={0.7} />
            {/* Awning stripes */}
            <Rect x="8" y="0" width="4" height="15" fill="#FFFFFF" opacity={0.5} />
            <Rect x="16" y="0" width="4" height="15" fill="#FFFFFF" opacity={0.5} />
            <Rect x="24" y="0" width="4" height="15" fill="#FFFFFF" opacity={0.5} />
            {/* Window */}
            <Rect x="7" y="20" width="13" height="18" rx="2" fill="#FFFFFF" opacity={0.8} />
            {/* Door */}
            <Rect x="23" y="24" width="12" height="24" rx="2" fill="#FFFFFF" opacity={0.8} />
          </G>

          {/* Small floating map pin pin-drop */}
          <G transform="translate(130, 80)">
            <Path
              d="M6 0C2.7 0 0 2.7 0 6C0 9.7 5.2 15.2 5.7 15.7C5.8 15.8 6.2 15.8 6.3 15.7C6.8 15.2 12 9.7 12 6C12 2.7 9.3 0 6 0Z"
              fill="#0052FF"
              opacity={0.45}
            />
            <Circle cx="6" cy="5.5" r="2.2" fill="#FFFFFF" />
          </G>
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  dotMatrix: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  topRightPin: {
    position: 'absolute',
    top: 50,
    right: -25,
  },
  skylineWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
