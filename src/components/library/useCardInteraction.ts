import { useContext, useRef } from 'react';
import { CardActionsContext } from './CardActions';

export function useCardInteraction({ id, onPress, onDelete, deleteLabel }: { id?: string; onPress: () => void; onDelete?: () => void; deleteLabel: string }) {
  const actions = useContext(CardActionsContext);
  const held = useRef(false);
  const showDelete = !!id && actions?.activeId === id;
  const closeDelete = () => actions?.open(null);
  const reveal = () => { if (id && onDelete) actions?.open(id); };
  return {
    showDelete,
    closeDelete,
    interaction: {
      onPress: () => { if (!held.current) onPress(); },
      onPressIn: () => { held.current = false; },
      onLongPress: onDelete ? () => { held.current = true; reveal(); } : undefined,
      delayLongPress: 450,
      accessibilityHint: onDelete ? 'Touch and hold to delete.' : undefined,
      accessibilityActions: onDelete ? [{ name: 'delete', label: deleteLabel }] : undefined,
      onAccessibilityAction: onDelete ? (event: { nativeEvent: { actionName: string } }) => { if (event.nativeEvent.actionName === 'delete') reveal(); } : undefined,
    },
  };
}
