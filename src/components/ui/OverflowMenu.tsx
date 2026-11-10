import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconButton } from '@/components/library/Controls';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Heading } from './Typography';

export interface MenuAction { title: string; icon: string; destructive?: boolean; onPress: () => void }
export function OverflowMenu({ label, actions, disabled = false }: { label: string; actions: MenuAction[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);
  const choosing = useRef(false);
  const close = useCallback(() => { setOpen(false); pending.current = null; }, []);
  useFocusEffect(useCallback(() => close, [close]));
  const runPending = () => {
    const action = pending.current;
    pending.current = null;
    action?.();
  };
  return <>
    <IconButton disabled={disabled} icon="ellipsis" label={`More actions for ${label}`} onPress={() => { choosing.current = false; setOpen(true); }} />
    <Dialog visible={open} onClose={close} onDismiss={runPending}>
      <Heading>{label}</Heading>
      {actions.map(action => <Button key={action.title} title={action.title} icon={action.icon} destructive={action.destructive} secondary={!action.destructive} onPress={() => {
        if (choosing.current) return;
        choosing.current = true;
        pending.current = action.onPress;
        setOpen(false);
        // iOS must finish dismissing this modal before presenting a confirmation.
        if (Platform.OS !== 'ios') runPending();
      }} />)}
      <Button title="Cancel" secondary onPress={close} />
    </Dialog>
  </>;
}
