import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Copy, Photo, Progress } from '../../components/cozy-ui';
import { theme } from '../../theme';
import type { CrochetProject } from '../../types/cozy';

export function ProjectCard({ project, compact = false }: { project: CrochetProject; compact?: boolean }) {
  const finished = project.status === 'completed';
  const pattern = project.patternSnapshot;
  const label = pattern.rowType === 'round' ? 'Round' : 'Row';
  const description = pattern.description?.trim() || pattern.yarnType || `${project.rows.length} ${pattern.rowType}s`;
  return <Card style={compact && styles.compactCard}>
    <View style={[styles.overview, compact && styles.featured]}>
      {compact ? <Photo uri={pattern.imageUri} /> : <Photo uri={pattern.imageUri} size={100} />}
      <View style={styles.details}>
        <Copy accessibilityRole="header" numberOfLines={2} style={styles.title}>{project.name}</Copy>
        <Copy numberOfLines={2} style={styles.description}>{description}</Copy>
      </View>
    </View>
    <Progress completed={project.rows.filter(row => row.completed).length} total={project.rows.length} caption={false} />
    <View style={[styles.footer, compact && styles.featuredFooter]}>
      <Copy style={styles.position}>{finished ? 'Finished with love' : `${label} ${project.currentRowIndex + 1} of ${project.rows.length}`}</Copy>
      <Pressable accessibilityRole="button" accessibilityLabel={`${finished ? 'View finished project' : 'Continue'} ${project.name}`}
        onPress={() => router.push({ pathname: finished ? '/project/complete/[id]' : '/(tabs)/count/[id]', params: { id: project.id } })}
        style={({ pressed }) => [styles.continue, compact && styles.featuredContinue, pressed && { opacity: 0.7 }]}>
        <Copy style={styles.continueText}>{finished ? 'View' : 'Continue'}</Copy>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.paper} />
      </Pressable>
    </View>
  </Card>;
}

const styles = StyleSheet.create({
  compactCard: { padding: 14, gap: 8 },
  featured: { flexDirection: 'column', alignItems: 'stretch' },
  featuredFooter: { flexDirection: 'column', alignItems: 'stretch' },
  featuredContinue: { justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radius.button },
  overview: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  details: { flex: 1, gap: 7 },
  title: { fontFamily: theme.fonts.heading, fontSize: 19, lineHeight: 26 },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  position: { flex: 1, fontSize: 14, color: theme.colors.muted },
  continue: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, backgroundColor: theme.colors.terracotta, flexDirection: 'row', alignItems: 'center', gap: 8 },
  continueText: { color: theme.colors.paper, fontFamily: theme.fonts.bold, fontSize: 14 },
});
