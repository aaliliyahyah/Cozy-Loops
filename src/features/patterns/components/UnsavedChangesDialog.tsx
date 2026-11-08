import { Modal, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Copy, Heading } from '@/components/ui/Typography';

export function UnsavedChangesDialog({ onSave, onDiscard, onCancel, busy }: { onSave: () => void; onDiscard: () => void; onCancel: () => void; busy: boolean }) {
  return <Modal transparent animationType="none" onRequestClose={onCancel}>
    <View accessibilityViewIsModal style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(35, 21, 12, 0.45)' }}>
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <Heading>Save your changes?</Heading>
        <Copy>Save your edits or discard them before leaving.</Copy>
        <Button title="Save changes" olive disabled={busy} onPress={onSave} />
        <Button title="Discard changes" destructive disabled={busy} onPress={onDiscard} />
        <Button title="Cancel" secondary onPress={onCancel} />
      </Card>
    </View>
  </Modal>;
}
