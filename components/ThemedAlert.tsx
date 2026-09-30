import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type AlertType = 'success' | 'warning' | 'danger' | 'info' | 'confirm';

export interface ThemedAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ThemedAlert: React.FC<ThemedAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          iconColor: '#16A34A',
          bgColor: '#DCFCE7',
          confirmBtnBg: '#16A34A',
          confirmBtnText: '#FFFFFF',
        };
      case 'danger':
        return {
          icon: 'trash-outline' as const,
          iconColor: '#DC2626',
          bgColor: '#FEE2E2',
          confirmBtnBg: '#DC2626',
          confirmBtnText: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: 'alert-circle-outline' as const,
          iconColor: '#D97706',
          bgColor: '#FEF3C7',
          confirmBtnBg: '#D97706',
          confirmBtnText: '#FFFFFF',
        };
      case 'confirm':
        return {
          icon: 'help-circle-outline' as const,
          iconColor: '#0052FF',
          bgColor: '#EFF6FF',
          confirmBtnBg: '#0052FF',
          confirmBtnText: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle-outline' as const,
          iconColor: '#0052FF',
          bgColor: '#EFF6FF',
          confirmBtnBg: '#0052FF',
          confirmBtnText: '#FFFFFF',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel || onConfirm}
        />
        <View style={styles.dialogCard}>
          {/* Top Decorative Graphic Ring */}
          <View style={[styles.iconRing, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={32} color={config.iconColor} />
          </View>

          {/* Title & Body */}
          <Text style={styles.titleText}>{title}</Text>
          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          {/* Action Buttons */}
          <View style={[styles.buttonRow, showCancel && styles.buttonRowDual]}>
            {showCancel && (
              <Pressable
                onPress={onCancel}
                disabled={loading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.confirmButton,
                { backgroundColor: config.confirmBtnBg },
                showCancel && { flex: 1 },
                pressed && { opacity: 0.85 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={config.confirmBtnText} size="small" />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: config.confirmBtnText },
                  ]}
                >
                  {confirmText}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  buttonRowDual: {
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonPressed: {
    backgroundColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmButton: {
    minWidth: 120,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
