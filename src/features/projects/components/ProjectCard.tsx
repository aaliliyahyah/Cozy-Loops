import { rowContext } from '@/features/patterns/model/rows';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Copy } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { Progress } from '@/components/ui/Progress';
import { YarnIcon } from '@/components/ui/YarnIcon';
import { theme } from '@/theme';
import type { CrochetProject } from '@/types/cozy';
import { useApp } from '@/providers/AppProvider';
import { deleteLibraryItems } from '@/features/library/deletion';
import { DeleteCardDialog } from '@/components/library/DeleteCardDialog';
import { useCardInteraction } from '@/components/library/useCardInteraction';
import { displayTitle } from '@/utils/title';
import { IconButton } from '@/components/library/Controls';

export function ProjectCard({ project, compact = false }: { project: CrochetProject; compact?: boolean }) {
  const { change } = useApp();
  const title = displayTitle(project.name);
  const finished = project.status === 'completed';
  const pattern = project.patternSnapshot;
  const context = rowContext(pattern.instructions, project.currentRowIndex);
  const label = pattern.rowType === 'round' ? 'Round' : 'Row';
  const description = pattern.description?.trim() || pattern.yarnType || `${project.rows.length} ${pattern.rowType}s`;
  const onDelete = () => change(data => deleteLibraryItems(data, 'projects', [project.id]));
  const { interaction, showDelete, closeDelete } = useCardInteraction({
    id: project.id,
    onPress: () => router.push({ pathname: finished ? '/project/complete/[id]' : '/(tabs)/count/[id]', params: { id: project.id, from: compact ? 'home' : 'projects' } }),
    onDelete: project.deletedAt ? undefined : onDelete,
    deleteLabel: `Delete ${title}`,
  });
  return <Card style={compact && styles.compactCard}>
    <View style={[styles.overview, compact && styles.featured]}>
      <View style={compact ? styles.featuredPhoto : styles.thumbnail}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${finished ? 'View finished project' : 'Continue'} ${title}`} {...interaction} style={styles.photoLink}><Photo uri={pattern.imageUri} crop={pattern.photoCrop} fill /></Pressable>
        {compact && <View style={styles.favorite}><IconButton icon={project.favorite ? 'heart' : 'heart-outline'} label={`${project.favorite ? 'Remove' : 'Add'} ${title} ${project.favorite ? 'from' : 'to'} favorites`} selected={!!project.favorite} onPress={() => change(data => ({ ...data, projects: data.projects.map(item => item.id === project.id ? { ...item, favorite: !item.favorite } : item) }))} /></View>}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${finished ? 'View finished project' : 'Continue'} ${title}`} {...interaction} style={styles.details}>
        <Copy accessibilityRole="header" numberOfLines={2} style={styles.title}>{title}</Copy>
        <Copy numberOfLines={2} style={styles.description}>{description}</Copy>
      </Pressable>
    </View>
    <View style={styles.progressArea}>
      <View style={styles.progressSection}>
        <Progress completed={project.rows.filter(row => row.completed).length} total={project.rows.length} caption={false} />
        {compact && <Copy style={styles.position}>{finished ? 'Finished with love' : `${context.part}: ${label} ${context.number} of ${context.total}`}</Copy>}
      </View>
      <View style={[styles.footer, compact && styles.featuredFooter]}>
        {!compact && <View style={styles.positionRow}><Copy style={styles.position}>{finished ? 'Finished with love' : `${context.part}: ${label} ${context.number} of ${context.total}`}</Copy><YarnIcon size={20} color={theme.colors.text} background={theme.colors.surface} /></View>}
        <Pressable accessibilityRole="button" accessibilityLabel={`${finished ? 'View finished project' : 'Continue'} ${title}`}
          {...interaction}
          style={({ pressed }) => [styles.continue, compact && styles.featuredContinue, pressed && { opacity: 0.7 }]}>
          <Copy style={[styles.continueText, compact && { color: theme.colors.onPrimary }]}>{finished ? 'View' : 'Continue'}</Copy>
        </Pressable>
      </View>
    </View>
    {showDelete && <DeleteCardDialog title={title} onDelete={onDelete} onCancel={closeDelete} />}
  </Card>;
}

const styles = StyleSheet.create({
  compactCard: { padding: 12, gap: 12 },
  featured: { flexDirection: 'column', alignItems: 'stretch' },
  featuredPhoto: { height: 260, borderRadius: 18, overflow: 'hidden' },
  thumbnail: { width: 100, height: 100, borderRadius: 18, overflow: 'hidden', flexShrink: 0 },
  photoLink: { width: '100%', height: '100%' },
  favorite: { position: 'absolute', right: 8, bottom: 8 },
  featuredFooter: { flexDirection: 'column', alignItems: 'stretch' },
  featuredContinue: { width: '100%', alignSelf: 'stretch', justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill },
  overview: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  details: { flex: 1, gap: 7 },
  title: { fontFamily: theme.fonts.heading, fontSize: 19, lineHeight: 26 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  progressArea: { gap: 8 },
  progressSection: { gap: 4 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  positionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  position: { flexShrink: 1, fontSize: 14, color: theme.colors.muted },
  continue: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, backgroundColor: theme.colors.terracotta, flexDirection: 'row', alignItems: 'center', gap: 8 },
  continueText: { color: theme.colors.paper, fontFamily: theme.fonts.bold, fontSize: 14 },
});
