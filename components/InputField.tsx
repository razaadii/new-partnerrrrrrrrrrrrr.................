import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  phonePrefix?: string;
  isDropdown?: boolean;
  onPress?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  leftIconName,
  isPassword = false,
  phonePrefix,
  isDropdown = false,
  onPress,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const content = (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
      ]}
    >
      {/* Left Icon */}
      {leftIconName && (
        <Ionicons
          name={leftIconName}
          size={18}
          color={isFocused ? '#0052FF' : '#94A3B8'}
          style={styles.leftIcon}
        />
      )}

      {/* Optional Phone Prefix Dropdown (+91 ⌵) */}
      {phonePrefix && (
        <View style={styles.phonePrefixRow}>
          <Text style={styles.phonePrefixText}>{phonePrefix}</Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color="#64748B"
            style={styles.prefixChevron}
          />
          <View style={styles.prefixDivider} />
        </View>
      )}

      {/* Text Input or Text Display for Dropdown */}
      {isDropdown ? (
        <Text
          style={[
            styles.input,
            styles.dropdownText,
            !value && styles.placeholderText,
          ]}
        >
          {value || placeholder}
        </Text>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
      )}

      {/* Right Password Toggle Icon */}
      {isPassword && (
        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          hitSlop={10}
          style={styles.rightIconButton}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#64748B"
          />
        </Pressable>
      )}

      {/* Right Dropdown Chevron */}
      {isDropdown && (
        <Ionicons
          name="chevron-down"
          size={18}
          color="#64748B"
          style={styles.rightChevron}
        />
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Interactive Container if Dropdown, else Direct */}
      {isDropdown && onPress ? (
        <Pressable onPress={onPress}>{content}</Pressable>
      ) : (
        content
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: '#0052FF',
    borderWidth: 1.5,
  },
  leftIcon: {
    marginRight: 10,
  },
  phonePrefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  prefixChevron: {
    marginLeft: 3,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  dropdownText: {
    textAlignVertical: 'center',
    lineHeight: 46,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  rightIconButton: {
    padding: 4,
  },
  rightChevron: {
    marginLeft: 6,
  },
});
