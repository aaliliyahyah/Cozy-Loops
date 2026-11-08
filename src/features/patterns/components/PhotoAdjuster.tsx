import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, PanResponder, Platform, ScrollView, View, type GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Photo } from '@/components/ui/Photo';
import { Copy } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { TabHeader } from '@/components/layout/TabHeader';
import { BackButton } from '@/components/navigation/BackButton';
import { theme } from '@/theme';
import { gesturePhoto, zoomPhoto, type PhotoCrop, type PhotoPoint } from '../model/photo';

export function PhotoAdjuster({ uri, initialCrop, onCancel, onApply }: { uri: string; initialCrop?: PhotoCrop; onCancel: () => void; onApply: (crop: PhotoCrop) => void }) {
  const [crop, setCrop] = useState(initialCrop);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const latest = useRef(crop);
  const previousTouches = useRef<PhotoPoint[]>([]);
  const size = useRef(300);
  useEffect(() => { latest.current = crop; }, [crop]);
  useEffect(() => {
    if (initialCrop) return;
    let cancelled = false;
    Image.getSize(uri, (width, height) => { if (!cancelled) setCrop({ width, height, x: 0, y: 0, zoom: 1 }); }, () => { if (!cancelled) setError('Could not open this photo. Try choosing it again.'); });
    return () => { cancelled = true; };
  }, [uri, initialCrop]);
  const touches = (event: GestureResponderEvent) => event.nativeEvent.touches.slice(0, 2).map(touch => ({ x: touch.locationX, y: touch.locationY }));
  // These registered callbacks read refs only during touch events.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !!latest.current,
    onPanResponderGrant: event => { previousTouches.current = touches(event); setDragging(true); },
    onPanResponderStart: event => { previousTouches.current = touches(event); },
    onPanResponderEnd: event => { previousTouches.current = touches(event); },
    onPanResponderMove: event => {
      const points = touches(event);
      if (latest.current) {
        const next = gesturePhoto(latest.current, previousTouches.current, points, size.current);
        latest.current = next; setCrop(next);
      }
      previousTouches.current = points;
    },
    onPanResponderRelease: () => { previousTouches.current = []; setDragging(false); },
    onPanResponderTerminate: () => { previousTouches.current = []; setDragging(false); },
    onPanResponderTerminationRequest: () => false,
  }));
  return <Modal animationType="none" onRequestClose={onCancel}><SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }}><ScrollView scrollEnabled={!dragging} contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 16, width: '100%', maxWidth: 650, alignSelf: 'center' }}>
    <TabHeader title="Adjust photo" icon="pencil-outline" leading={<BackButton onPress={onCancel} />} />
    <View {...responder.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Photo framing" accessibilityValue={{ min: 100, max: 400, now: Math.round((crop?.zoom ?? 1) * 100) }} accessibilityActions={[{ name: 'increment', label: 'Zoom in' }, { name: 'decrement', label: 'Zoom out' }]} onAccessibilityAction={event => {
      if (!latest.current) return;
      const name = event.nativeEvent.actionName;
      if (name !== 'increment' && name !== 'decrement') return;
      const next = zoomPhoto(latest.current, latest.current.zoom + (name === 'increment' ? 0.25 : -0.25));
      latest.current = next; setCrop(next);
    }} onLayout={event => { size.current = event.nativeEvent.layout.width; }} style={{ ...(Platform.OS === 'web' ? { touchAction: 'none' as const } : {}), width: '100%', maxWidth: 340, aspectRatio: 1, alignSelf: 'center', borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.line }}>
      <View pointerEvents="none" style={{ flex: 1 }}><Photo uri={uri} crop={crop} fill /></View>
    </View>
    {!crop && !error && <ActivityIndicator accessibilityLabel="Loading photo" />}
    {!!error && <Copy accessibilityRole="alert">{error}</Copy>}
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}><Button title="Reset" secondary disabled={!crop} onPress={() => {
        if (!latest.current) return;
        const reset = { ...latest.current, x: 0, y: 0, zoom: 1 };
        latest.current = reset; setCrop(reset);
      }} /></View>
      <View style={{ flex: 1 }}><Button title="Done" olive disabled={!crop} onPress={() => { if (latest.current) onApply(latest.current); }} /></View>
    </View>
  </ScrollView></SafeAreaView></Modal>;
}
