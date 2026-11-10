import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import { IconButton } from '@/components/library/Controls';
import { theme } from '@/theme';

type Props = { children: ReactNode; enabled: boolean; onDelete: () => void; onDuplicate: () => void; onDragStart: (y: number) => void; onDragMove: (y: number) => void; onDragEnd: (cancelled: boolean) => void };
const WIDTH = 104;
export function SwipeRow({ children, ...props }: Props) {
  const callbacks = useRef(props);
  useEffect(() => { callbacks.current = props; });
  const started = useRef(0);
  const mode = useRef<'swipe' | 'drag'>('swipe');
  const position = useRef(0);
  const [open, setOpen] = useState(false);
  const [offset] = useState(() => new Animated.Value(0));
  const settle = (value: number) => {
    position.current = value; setOpen(value !== 0);
    Animated.timing(offset, { toValue: value, duration: 140, useNativeDriver: false }).start();
  };
  // PanResponder registers callbacks here; ref values are read only during gestures.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => {
      if (!callbacks.current.enabled) return false;
      if (Date.now() - started.current >= 300 && Math.abs(gesture.dy) > 5 && Math.abs(gesture.dy) > Math.abs(gesture.dx)) { mode.current = 'drag'; return true; }
      if (Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.3) { mode.current = 'swipe'; return true; }
      return false;
    },
    onPanResponderGrant: (_, gesture) => {
      offset.stopAnimation();
      if (mode.current === 'drag') { settle(0); callbacks.current.onDragStart(gesture.y0); }
    },
    onPanResponderMove: (_, gesture) => {
      if (mode.current === 'drag') callbacks.current.onDragMove(gesture.moveY);
      else offset.setValue(Math.max(-WIDTH, Math.min(0, position.current + gesture.dx)));
    },
    onPanResponderRelease: (_, gesture) => {
      if (mode.current === 'drag') { callbacks.current.onDragMove(gesture.moveY); callbacks.current.onDragEnd(false); }
      else settle(gesture.vx < -0.4 || (gesture.vx <= 0.4 && position.current + gesture.dx < -WIDTH / 3) ? -WIDTH : 0);
    },
    onPanResponderTerminate: () => { if (mode.current === 'drag') callbacks.current.onDragEnd(true); else settle(position.current); },
    onPanResponderTerminationRequest: () => false,
  }));
  return <View style={styles.container}>
    <View aria-hidden={!open || !props.enabled} pointerEvents={open && props.enabled ? 'auto' : 'none'} accessibilityElementsHidden={!open || !props.enabled} importantForAccessibility={open && props.enabled ? 'auto' : 'no-hide-descendants'} style={styles.actions}>
      <IconButton icon="copy" label="Duplicate row or selected rows" onPress={() => { settle(0); props.onDuplicate(); }} />
      <IconButton icon="trash-can-outline" label="Delete row or selected rows" onPress={() => { settle(0); props.onDelete(); }} />
    </View>
    <Animated.View {...responder.panHandlers} onTouchStart={() => { started.current = Date.now(); }} style={{ transform: [{ translateX: props.enabled ? offset : 0 }], backgroundColor: theme.colors.background }}>{children}</Animated.View>
  </View>;
}
const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 10 },
  actions: { position: 'absolute', right: 0, top: 0, bottom: 0, width: WIDTH, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'flex-end' },
});
