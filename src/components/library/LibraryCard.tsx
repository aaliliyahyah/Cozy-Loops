import { useContext, useRef, type ReactNode } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Copy } from '@/components/ui/Typography';
import { Photo } from '@/components/ui/Photo';
import { CardActionsContext } from './CardActions';
import type { PhotoCrop } from '@/features/patterns/model/photo';
import { theme } from '@/theme';

export function LibraryCard({ id, title, description, uri, crop, badge, onPress, label, accessory, children, art, onDelete, deleteLabel = 'Delete' }: { id?: string; title: string; description?: string; uri?: string; crop?: PhotoCrop; badge?: string; onPress: () => void; label: string; accessory?: ReactNode; children?: ReactNode; art?: ReactNode; onDelete?: () => void; deleteLabel?: string }) {
  const actions = useContext(CardActionsContext);
  const showDelete = !!id && actions?.activeId === id;
  const setShowDelete = (show: boolean) => { if (id) actions?.open(show ? id : null); };
  const held = useRef(false);
  const press = () => {
    if (held.current) return;
    if (showDelete) setShowDelete(false); else onPress();
  };
  const reveal = () => { held.current = true; setShowDelete(true); };
  const interaction = {
    onPress: press,
    onPressIn: () => { held.current = false; },
    onLongPress: onDelete ? reveal : undefined,
    delayLongPress: 450,
    accessibilityHint: onDelete ? 'Touch and hold to show the delete option.' : undefined,
    accessibilityActions: onDelete ? [{ name: 'showDelete', label: deleteLabel }] : undefined,
    onAccessibilityAction: onDelete ? () => setShowDelete(true) : undefined,
  };
  return <View style={s.wrapper}><View style={[s.card, showDelete && { borderColor: theme.colors.danger }]}>
    <View style={s.image}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} {...interaction} style={({ pressed }) => [s.photoLink, pressed && s.dim]}>{art || <Photo uri={uri} crop={crop} fill />}</Pressable>
      {accessory && <View style={s.accessory}>{accessory}</View>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={label} {...interaction} style={({ pressed }) => [s.content, pressed && s.dim]}>
      <View style={s.cardBody}>{badge && <Copy style={s.badge}>{badge}</Copy>}<Copy style={s.cardTitle} numberOfLines={2}>{title}</Copy>{description && <Copy style={s.description} numberOfLines={2}>{description}</Copy>}{children}</View>
    </Pressable>
  </View>
    {showDelete && onDelete && <View style={s.deleteActions}>
      <Button title="Delete" label={deleteLabel} icon="trash-can-outline" destructive onPress={() => { setShowDelete(false); onDelete(); }} />
    </View>}
  </View>;
}

const s = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  deleteActions: { alignSelf: 'flex-start' },
  content: {},
  photoLink: { width: '100%', height: '100%' },
  card: { borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.surface, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1, overflow: 'hidden', backgroundColor: theme.colors.sand },
  cardBody: { minHeight: 160, padding: 12, gap: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: theme.colors.sage, paddingHorizontal: 8, borderRadius: theme.radius.pill, fontSize: 11, lineHeight: 20, fontFamily: theme.fonts.bold },
  cardTitle: { fontFamily: theme.fonts.heading, fontSize: 16, lineHeight: 22, minHeight: 44 },
  description: { fontSize: 12, lineHeight: 18, minHeight: 36, color: theme.colors.muted },
  accessory: { position: 'absolute', right: 6, bottom: 6 },
  dim: { opacity: 0.6 },
});
