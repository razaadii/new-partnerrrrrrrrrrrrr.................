import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 330;

interface MapRouteGraphicProps {
  onLocatePress?: () => void;
  onNavigatePress?: () => void;
}

export const MapRouteGraphic: React.FC<MapRouteGraphicProps> = ({
  onLocatePress,
  onNavigatePress,
}) => {
  const handleLocate = () => {
    if (onLocatePress) {
      onLocatePress();
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('GPS Location Centered\nCurrent Position: Near NH 31, Begusarai, Bihar\nGPS Signal: Strong');
    } else {
      Alert.alert(
        'GPS Location Centered',
        'Current Position: Near NH 31, Begusarai, Bihar\nGPS Signal: Strong'
      );
    }
  };

  const handleNavigate = () => {
    if (onNavigatePress) {
      onNavigatePress();
    } else {
      const url = Platform.select({
        ios: 'maps:0,0?q=Barauni,Begusarai,Bihar',
        android: 'geo:0,0?q=Barauni,Begusarai,Bihar',
        default: 'https://maps.google.com/?q=Barauni,Begusarai,Bihar',
      });
      Linking.openURL(url).catch(() => {});
    }
  };
  return (
    <View style={styles.container}>
      {/* Vector Map Canvas */}
      <Svg width={width} height={MAP_HEIGHT} viewBox={`0 0 ${width} ${MAP_HEIGHT}`}>
        {/* Base Map Land Background */}
        <Rect x={0} y={0} width={width} height={MAP_HEIGHT} fill="#F3F6FA" />

        {/* River / Water Canal */}
        <Path
          d={`M0 240 Q100 230 200 270 T${width} 290`}
          stroke="#D8E8FC"
          strokeWidth={14}
          fill="none"
        />

        {/* Grid Road Network */}
        {/* Secondary roads (white with subtle border) */}
        <Path d={`M-20 60 L${width + 20} 85`} stroke="#FFFFFF" strokeWidth={10} fill="none" />
        <Path d={`M-20 180 L${width + 20} 140`} stroke="#FFFFFF" strokeWidth={8} fill="none" />
        <Path d={`M60 -20 L160 ${MAP_HEIGHT + 20}`} stroke="#FFFFFF" strokeWidth={10} fill="none" />
        <Path d={`M220 -20 L270 ${MAP_HEIGHT + 20}`} stroke="#FFFFFF" strokeWidth={8} fill="none" />
        <Path d={`M300 30 L${width + 10} 240`} stroke="#FFFFFF" strokeWidth={7} fill="none" />
        <Path d={`M10 120 Q120 160 260 90`} stroke="#FFFFFF" strokeWidth={9} fill="none" />

        {/* NH 31 Main Highway (Yellow with orange badge) */}
        <Path
          d={`M-10 110 L120 220 L${width * 0.7} ${MAP_HEIGHT + 20}`}
          stroke="#FDE047"
          strokeWidth={7}
          fill="none"
        />

        {/* GPS Blue Navigation Route Polyline */}
        <Path
          d="M125 150 L145 140 L160 142 L185 85 L260 70 L268 40 L272 25"
          stroke="#0052FF"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Origin: Blue Pulsing Location Dot */}
        <Circle cx={125} cy={150} r={18} fill="#3B82F6" opacity={0.25} />
        <Circle cx={125} cy={150} r={11} fill="#FFFFFF" />
        <Circle cx={125} cy={150} r={7} fill="#0052FF" />

        {/* Destination: Red Map Marker Pin */}
        <G transform="translate(262, 10)">
          <Path
            d="M10 0 C4.5 0 0 4.5 0 10 C0 17 9 26 9.5 26.5 C9.8 26.8 10.2 26.8 10.5 26.5 C11 26 20 17 20 10 C20 4.5 15.5 0 10 0 Z"
            fill="#EF4444"
          />
          <Circle cx={10} cy={9.5} r={3.8} fill="#FFFFFF" />
        </G>

        {/* Map Landmark Labels */}
        <SvgText
          x="46"
          y="40"
          fontSize="11"
          fontWeight="600"
          fill="#475569"
        >
          Barauni Junction 🚆
        </SvgText>
        <SvgText
          x="80"
          y="72"
          fontSize="10.5"
          fontWeight="500"
          fill="#64748B"
        >
          Begusarai College
        </SvgText>
        <SvgText
          x="75"
          y="132"
          fontSize="12"
          fontWeight="700"
          fill="#334155"
        >
          BARAUNI बरौनी
        </SvgText>
        <SvgText
          x="260"
          y="150"
          fontSize="9.5"
          fontWeight="500"
          fill="#94A3B8"
          transform="rotate(-25 260 150)"
        >
          Begusarai Rd
        </SvgText>
        <SvgText
          x="355"
          y="60"
          fontSize="9.5"
          fontWeight="500"
          fill="#94A3B8"
          transform="rotate(75 355 60)"
        >
          Kalyanpurr Rd
        </SvgText>

        {/* NH 31 Highway Badge */}
        <G transform="translate(6, 115)">
          <Rect x={0} y={0} width={38} height={18} rx={3} fill="#F59E0B" />
          <SvgText
            x={19}
            y={12}
            fontSize="9.5"
            fontWeight="bold"
            fill="#000000"
            textAnchor="middle"
          >
            NH 31
          </SvgText>
        </G>
      </Svg>

      {/* Floating Route Distance Tooltip Banner */}
      <View style={styles.tooltipContainer}>
        <View style={styles.tooltipBadge}>
          <Text style={styles.tooltipTextMain}>2.3 KM</Text>
          <Text style={styles.tooltipTextSub}>8 min</Text>
        </View>
        <View style={styles.tooltipPointer} />
      </View>

      {/* Floating Map Controls */}
      <View style={styles.controlsContainer}>
        <Pressable onPress={handleLocate} style={styles.controlButton} hitSlop={6}>
          <Ionicons name="locate-outline" size={22} color="#1E293B" />
        </Pressable>
        <Pressable onPress={handleNavigate} style={styles.controlButton} hitSlop={6}>
          <Ionicons name="navigate" size={20} color="#0052FF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3F6FA',
    overflow: 'hidden',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 50,
    left: width * 0.42,
    alignItems: 'center',
  },
  tooltipBadge: {
    backgroundColor: '#0052FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipTextMain: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipTextSub: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  tooltipPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0052FF',
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    gap: 12,
  },
  controlButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
});
