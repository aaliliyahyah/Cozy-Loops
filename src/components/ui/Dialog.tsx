import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from './Card';

export function Dialog({ children, onClose, visible = true, onDismiss }: { children: ReactNode; onClose: () => void; visible?: boolean; onDismiss?: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onDismiss={onDismiss}>
    <SafeAreaView style={styles.backdrop}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close dialog" onPress={onClose} />
          <View accessibilityViewIsModal style={styles.dialog}><Card>{children}</Card></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(35, 21, 12, 0.45)' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 400 },
});
