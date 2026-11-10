import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Copy, Heading } from '@/components/ui/Typography';

export function PartNameDialog({ initialName, onSubmit, onCancel }: {
  initialName?: string; onSubmit: (name: string) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(initialName ?? '');
  const [error, setError] = useState('');
  const submitted = useRef(false);
  const submit = () => {
    if (submitted.current) return;
    try {
      submitted.current = true;
      onSubmit(name);
    } catch (error) {
      submitted.current = false;
      setError(error instanceof Error ? error.message : 'Could not save this part.');
    }
  };
  return <Dialog onClose={onCancel}>
    <Heading>{initialName === undefined ? 'Add part' : 'Rename part'}</Heading>
    <Field label="Part name" value={name} autoFocus onChangeText={value => { setName(value); setError(''); }} placeholder="e.g. Ear, Body, Border" onSubmitEditing={submit} />
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Button title={initialName === undefined ? 'Add part' : 'Rename'} olive disabled={!name.trim()} onPress={submit} /></View>
      <View style={{ flex: 1 }}><Button title="Cancel" secondary onPress={onCancel} /></View>
    </View>
  </Dialog>;
}
