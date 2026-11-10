import { useRef } from 'react';
import { View } from 'react-native';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Copy, Heading } from './Typography';

export function ConfirmationDialog({ title, message, actionLabel, destructive = false, onConfirm, onCancel }: {
  title: string; message?: string; actionLabel: string; destructive?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const confirmed = useRef(false);
  return <Dialog onClose={onCancel}>
    <Heading>{title}</Heading>
    {!!message && <Copy>{message}</Copy>}
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Button title={actionLabel} destructive={destructive} olive={!destructive} onPress={() => {
        if (confirmed.current) return;
        confirmed.current = true;
        onConfirm();
      }} /></View>
      <View style={{ flex: 1 }}><Button title="Cancel" secondary onPress={onCancel} /></View>
    </View>
  </Dialog>;
}
