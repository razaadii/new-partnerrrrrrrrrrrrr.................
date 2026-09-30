import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

interface OtpInputProps {
  code: string[];
  setCode: (code: string[]) => void;
  length?: number;
  hasError?: boolean;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  code,
  setCode,
  length = 6,
  hasError = false,
  onComplete,
  disabled = false,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [hasError]);

  const triggerCompletionCheck = (updatedCode: string[]) => {
    const isFull = updatedCode.every((digit) => digit.trim() !== '');
    if (isFull) {
      Keyboard.dismiss();
      if (onComplete) {
        onComplete(updatedCode.join(''));
      }
    }
  };

  const handleChangeText = (text: string, index: number) => {
    if (disabled) return;

    // Handling paste of multiple digits
    if (text.length > 1) {
      const digits = text.replace(/[^0-9]/g, '').slice(0, length).split('');
      const newCode = [...code];
      for (let i = 0; i < length; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      triggerCompletionCheck(newCode);
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto advance to next input or complete
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    triggerCompletionCheck(newCode);
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = Boolean(code[index]);
        const isCurrentFocus = index === code.findIndex((c) => c === '') || (code.every(Boolean) && index === length - 1);

        return (
          <View
            key={index}
            style={[
              styles.box,
              isFilled && styles.boxFilled,
              isCurrentFocus && styles.boxActive,
              hasError && styles.boxError,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.input, hasError && styles.inputError]}
              keyboardType="number-pad"
              maxLength={1}
              value={code[index] || ''}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
              textAlign="center"
              editable={!disabled}
            />
          </View>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  box: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  boxActive: {
    borderColor: '#0052FF',
    backgroundColor: '#F8FAFF',
    shadowColor: '#0052FF',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  boxFilled: {
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
  },
  boxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    shadowColor: '#DC2626',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  inputError: {
    color: '#DC2626',
  },
});
