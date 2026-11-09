import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/library/Controls';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Copy, Heading } from '@/components/ui/Typography';
import { useApp } from '@/providers/AppProvider';
import { restartProject } from '../model/progress';
import { displayTitle } from '@/utils/title';

export function RestartProjectButton({ projectId, from }: { projectId: string; from?: string }) {
  const { data } = useApp();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusEffect(useCallback(() => close, [close]));
  const project = data.projects.find(item => item.id === projectId && !item.deletedAt && item.status === 'completed');
  if (!project) return null;
  return <>
    <IconButton icon="redo" label={`Start ${displayTitle(project.name)} again`} floating disabled={!project.patternSnapshot.instructions.length} onPress={() => setOpen(true)} />
    {open && <RestartProjectDialog projectId={projectId} from={from} onClose={close} />}
  </>;
}

function RestartProjectDialog({ projectId, from, onClose }: { projectId: string; from?: string; onClose: () => void }) {
  const { data, change } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const starting = useRef(false);
  const source = data.projects.find(item => item.id === projectId && !item.deletedAt && item.status === 'completed');
  const start = () => {
    if (starting.current || !source || !name.trim()) return;
    starting.current = true;
    try {
      const project = restartProject(source, name);
      change(current => ({ ...current, projects: [...current.projects, project] }));
      onClose();
      router.push({ pathname: '/(tabs)/count/[id]', params: { id: project.id, from } });
    } catch (error) {
      starting.current = false;
      setError((error as Error).message);
    }
  };
  return <Dialog onClose={onClose}>
    <Heading>Start again?</Heading>
    <Field label="Project name" value={name} onChangeText={setName} placeholder="Enter project name" />
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <View style={styles.actions}>
      <View style={styles.action}><Button title="Start" olive disabled={!source || !name.trim()} onPress={start} /></View>
      <View style={styles.action}><Button title="Cancel" secondary onPress={onClose} /></View>
    </View>
  </Dialog>;
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, minWidth: 0 },
});
