import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Heading } from '@/components/ui/Typography';

export function UnsavedChangesDialog({ onSave, onDiscard, onCancel, busy }: { onSave: () => void; onDiscard: () => void; onCancel: () => void; busy: boolean }) {
  return <Dialog onClose={onCancel}>
    <Heading>Save your changes?</Heading>
    <Button title="Save changes" olive disabled={busy} onPress={onSave} />
    <Button title="Discard changes" destructive disabled={busy} onPress={onDiscard} />
    <Button title="Keep editing" secondary onPress={onCancel} />
  </Dialog>;
}
