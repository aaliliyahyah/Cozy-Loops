import { useCallback, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/library/Controls';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Heading } from '@/components/ui/Typography';
import { useApp } from '@/providers/AppProvider';
import { createProject } from '@/features/projects/model/progress';
import { isUsable } from '../model/pattern';
import { theme } from '@/theme';
import { displayTitle } from '@/utils/title';

export function StartProjectButton({ patternId, from }: { patternId: string; from: string }) {
  const { data } = useApp();
  const pattern = data.patterns.find(item => item.id === patternId);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useFocusEffect(useCallback(() => close, [close]));
  if (!pattern || pattern.deletedAt) return null;
  return <>
    <IconButton icon="yarn" label={`Start project with ${displayTitle(pattern.title)}`} floating style={styles.startButton} disabled={!isUsable(pattern)} onPress={() => setOpen(true)} />
    {open && <StartProjectDialog patternId={patternId} from={from} onClose={close} />}
  </>;
}

function StartProjectDialog({ patternId, from, onClose }: { patternId: string; from: string; onClose: () => void }) {
  const { data, change } = useApp();
  const [name, setName] = useState('');
  const starting = useRef(false);
  const pattern = data.patterns.find(item => item.id === patternId && !item.deletedAt);
  const active = data.projects.filter(project => !project.deletedAt && project.patternId === patternId && project.status === 'active');
  const openProject = (id: string) => {
    onClose();
    router.push({ pathname: '/(tabs)/count/[id]', params: { id, from } });
  };
  const start = () => {
    if (starting.current || !pattern || !isUsable(pattern) || !name.trim()) return;
    starting.current = true;
    const project = createProject(pattern);
    project.name = name.trim();
    change(current => ({ ...current, projects: [...current.projects, project] }));
    openProject(project.id);
  };
  return <Dialog onClose={onClose}>
    <Heading>Start project</Heading>
    <Field label="Project name" value={name} onChangeText={setName} placeholder="Enter project name" />
    {active.map(project => <Button key={project.id} title={`Continue ${displayTitle(project.name)}`} secondary onPress={() => {
      if (starting.current) return;
      starting.current = true;
      openProject(project.id);
    }} />)}
    <View style={styles.actions}>
      <View style={styles.action}><Button title="Start" olive disabled={!pattern || !isUsable(pattern) || !name.trim()} onPress={start} /></View>
      <View style={styles.action}><Button title="Cancel" secondary onPress={onClose} /></View>
    </View>
  </Dialog>;
}

const styles = StyleSheet.create({
  startButton: { borderColor: theme.colors.line },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, minWidth: 0 },
});
