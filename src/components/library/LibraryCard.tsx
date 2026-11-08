import type { ReactNode } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { theme } from '@/theme';

export function LibraryCard({ title, description, uri, badge, onPress, label, accessory, children, art }: { title: string; description?: string; uri?: string; badge?: string; onPress: () => void; label: string; accessory?: ReactNode; children?: ReactNode; art?: ReactNode }) {
  return <View style={s.card}>
    <View style={s.image}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.photoLink, pressed && s.dim]}>{art || <Photo uri={uri} fill />}</Pressable>
      {accessory && <View style={s.accessory}>{accessory}</View>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.content, pressed && s.dim]}>
      <View style={s.cardBody}>{badge && <Copy style={s.badge}>{badge}</Copy>}<Copy style={s.cardTitle} numberOfLines={2}>{title}</Copy>{description && <Copy style={s.description} numberOfLines={2}>{description}</Copy>}{children}</View>
    </Pressable>
  </View>;
}

const s = StyleSheet.create({
  content: { flex: 1 },
  photoLink: { width: '100%', height: '100%' },
  card: { flex: 1, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, overflow: 'hidden', backgroundColor: theme.colors.sand },
  cardBody: { flex: 1, minHeight: 160, padding: 12, gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: theme.colors.sage, paddingHorizontal: 8, borderRadius: theme.radius.pill, fontSize: 11, lineHeight: 20, fontFamily: theme.fonts.bold },
  cardTitle: { fontFamily: theme.fonts.heading, fontSize: 16, lineHeight: 22, minHeight: 44 },
  description: { fontSize: 12, lineHeight: 18, minHeight: 36, color: theme.colors.muted },
  accessory: { position: 'absolute', right: 6, bottom: 6 },
  dim: { opacity: 0.6 },
});
