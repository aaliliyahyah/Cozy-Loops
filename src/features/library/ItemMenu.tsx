import { router } from 'expo-router';
import { OverflowMenu, type MenuAction } from '@/components/ui/OverflowMenu';
import { useApp } from '@/providers/AppProvider';
import { confirm } from '@/utils/confirm';
import { displayTitle } from '@/utils/title';
import type { CrochetProject, Pattern } from '@/types/cozy';
import { deleteLibraryItems } from './deletion';
import { duplicatePattern, duplicateProject } from './duplication';

export function PatternMenu({ pattern, from = 'patterns', onDelete }: { pattern: Pattern; from?: string; onDelete?: () => void }) {
  const { change } = useApp();
  if (pattern.deletedAt) return null;
  const actions: MenuAction[] = [
    { title: 'Edit', icon: 'pencil-outline', onPress: () => router.push({ pathname: '/pattern/edit/[id]', params: { id: pattern.id, from } }) },
    { title: 'Duplicate', icon: 'copy', onPress: () => {
      const copy = duplicatePattern(pattern);
      change(data => ({ ...data, patterns: [...data.patterns, copy] }));
      router.push({ pathname: '/pattern/[id]', params: { id: copy.id, from } });
    } },
    { title: 'Delete', icon: 'trash-can-outline', destructive: true, onPress: onDelete ?? (() => confirm(`Delete ${displayTitle(pattern.title)}?`, 'This pattern will move to Deleted. Existing projects keep their instructions.', () => change(data => deleteLibraryItems(data, 'patterns', [pattern.id])), true)) },
  ];
  return <OverflowMenu label={displayTitle(pattern.title)} actions={actions} />;
}

export function ProjectMenu({ project, from = 'projects', leaveAfterDelete = false }: { project: CrochetProject; from?: string; leaveAfterDelete?: boolean }) {
  const { change } = useApp();
  if (project.deletedAt) return null;
  return <OverflowMenu label={displayTitle(project.name)} actions={[
    { title: 'Duplicate', icon: 'copy', onPress: () => {
      const copy = duplicateProject(project);
      change(data => ({ ...data, projects: [...data.projects, copy] }));
      router.push({ pathname: copy.status === 'completed' ? '/project/complete/[id]' : '/(tabs)/count/[id]', params: { id: copy.id, from } });
    } },
    { title: 'Delete', icon: 'trash-can-outline', destructive: true, onPress: () => confirm(`Delete ${displayTitle(project.name)}?`, 'This project will move to Deleted with its saved progress.', () => {
      change(data => deleteLibraryItems(data, 'projects', [project.id]));
      if (leaveAfterDelete) router.navigate('/(tabs)/count');
    }, true) },
  ]} />;
}
