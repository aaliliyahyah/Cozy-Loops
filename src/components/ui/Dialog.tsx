import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from './Card';

export function Dialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <Modal transparent animationType="fade" onRequestClose={onClose}>
    <SafeAreaView style={styles.backdrop}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
