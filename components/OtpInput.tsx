import React, { useRef } from 'react';
import {
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
}

export const OtpInput: React.FC<OtpInputProps> = ({
  code,
  setCode,
  length = 6,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
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
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto advance to next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
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
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = code[index] !== '' || index === 0;

        return (
          <View
            key={index}
            style={[
              styles.box,
              isFocused && styles.boxActive,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              value={code[index] || ''}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
              textAlign="center"
            />
          </View>
        );
      })}
    </View>
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
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: '#0052FF',
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
});
