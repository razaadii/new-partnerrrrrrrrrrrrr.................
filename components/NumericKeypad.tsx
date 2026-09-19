import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface NumericKeypadProps {
  onNumberPress: (digit: string) => void;
  onDeletePress: () => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumberPress,
  onDeletePress,
}) => {
  const keys: Array<{ num: string; sub?: string; isBack?: boolean; isEmpty?: boolean }> = [
    { num: '1' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '', isEmpty: true },
    { num: '0' },
    { num: '', isBack: true },
  ];

  return (
    <View style={styles.keypadContainer}>
      <View style={styles.grid}>
        {keys.map((keyItem, index) => {
          if (keyItem.isEmpty) {
            return <View key={`empty-${index}`} style={styles.keyCellEmpty} />;
          }

          if (keyItem.isBack) {
            return (
              <Pressable
                key="backspace"
                onPress={onDeletePress}
                style={({ pressed }) => [
                  styles.keyCell,
                  styles.keyCellEmpty,
                  pressed && styles.keyPressed,
                ]}
                hitSlop={6}
              >
                <Ionicons name="backspace-outline" size={24} color="#0F172A" />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={keyItem.num}
              onPress={() => onNumberPress(keyItem.num)}
              style={({ pressed }) => [
                styles.keyCell,
                pressed && styles.keyPressed,
              ]}
              hitSlop={6}
            >
              <Text style={styles.numberText}>{keyItem.num}</Text>
              {keyItem.sub && <Text style={styles.subText}>{keyItem.sub}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keypadContainer: {
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  keyCell: {
    width: '31%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyCellEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyPressed: {
    backgroundColor: '#E2E8F0',
    opacity: 0.9,
  },
  numberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  subText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1.5,
    marginTop: -1,
  },
});
