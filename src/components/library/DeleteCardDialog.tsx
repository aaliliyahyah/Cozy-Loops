import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Heading } from '@/components/ui/Typography';

export function DeleteCardDialog({ title, onDelete, onCancel }: { title: string; onDelete: () => void; onCancel: () => void }) {
  const deleting = useRef(false);
  return <Dialog onClose={onCancel}>
    <Heading>Delete {title}?</Heading>
    <View style={styles.actions}>
      <View style={styles.action}><Button title="Delete" destructive icon="trash-can-outline" onPress={() => {
        if (deleting.current) return;
        deleting.current = true;
        onCancel();
        onDelete();
      }} /></View>
      <View style={styles.action}><Button title="Cancel" secondary onPress={onCancel} /></View>
    </View>
  </Dialog>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, minWidth: 0 },
});
