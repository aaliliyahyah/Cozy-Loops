import type { ReactNode } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Copy } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { DeleteCardDialog } from './DeleteCardDialog';
import { useCardInteraction } from './useCardInteraction';
import type { PhotoCrop } from '@/features/patterns/model/photo';
import { theme } from '@/theme';

export function LibraryCard({ id, title, description, uri, crop, badge, onPress, label, accessory, children, art, onDelete, deleteLabel = 'Delete', imageAspectRatio = 4 / 5 }: { id?: string; title: string; description?: string; uri?: string; crop?: PhotoCrop; badge?: string; onPress: () => void; label: string; accessory?: ReactNode; children?: ReactNode; art?: ReactNode; onDelete?: () => void; deleteLabel?: string; imageAspectRatio?: number }) {
  const { showDelete, closeDelete, interaction } = useCardInteraction({ id, onPress, onDelete, deleteLabel });
  return <View style={s.wrapper}><View style={s.card}>
    <View style={[s.image, { aspectRatio: imageAspectRatio }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} {...interaction} style={({ pressed }) => [s.photoLink, pressed && s.dim]}>{art || <Photo uri={uri} crop={crop} fill />}</Pressable>
      {(badge || accessory) && <View pointerEvents="box-none" style={s.imageFooter}>
        {badge && <View pointerEvents="none" style={s.badgeContainer}><Copy style={s.badge}>{badge}</Copy></View>}
        {accessory && <View style={s.accessory}>{accessory}</View>}
      </View>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={label} {...interaction} style={({ pressed }) => [s.content, pressed && s.dim]}>
      <View style={s.cardBody}><Copy style={s.cardTitle} numberOfLines={2}>{title}</Copy>{description && <Copy style={s.description} numberOfLines={2}>{description}</Copy>}{children}</View>
    </Pressable>
  </View>
    {showDelete && onDelete && <DeleteCardDialog title={title} onDelete={onDelete} onCancel={closeDelete} />}
  </View>;
}

const s = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  content: {},
  photoLink: { width: '100%', height: '100%' },
  card: { borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, overflow: 'hidden' },
  image: { width: '100%', overflow: 'hidden', backgroundColor: theme.colors.sand },
  imageFooter: { position: 'absolute', left: 6, right: 6, bottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  badgeContainer: { flexShrink: 1 },
  cardBody: { padding: 12, gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: theme.colors.sage, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radius.pill, fontSize: 11, lineHeight: 20, fontFamily: theme.fonts.bold },
  cardTitle: { fontFamily: theme.fonts.heading, fontSize: 16, lineHeight: 22 },
  description: { fontSize: 12, lineHeight: 18, color: theme.colors.muted },
  accessory: { flexShrink: 0, marginLeft: 'auto' },
  dim: { opacity: 0.6 },
});
