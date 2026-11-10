import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Copy } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { theme } from '@/theme';

export function StartProjectAction() {
  const { width } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [textSize, setTextSize] = useState({ width: 150, height: 24 });
  const expandedRef = useRef(false);
  const navigating = useRef(false);
  const maxTextWidth = Math.max(44, width - 40 - 56 - 32);
  const labelWidth = Math.min(textSize.width, maxTextWidth) + 32;
  const expandedHeight = Math.max(56, textSize.height + 24);

  useEffect(() => {
    let mounted = true;
    const update = (value: boolean) => {
      if (!mounted) return;
      setReduceMotion(value);
      if (value) { progress.stopAnimation(); progress.setValue(expandedRef.current ? 1 : 0); }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then(update).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => { mounted = false; subscription.remove(); };
  }, [progress]);
  useFocusEffect(useCallback(() => {
    navigating.current = false;
    return () => {
      expandedRef.current = false;
      setExpanded(false);
      progress.stopAnimation(); progress.setValue(0);
    };
  }, [progress]));

  const toggle = () => {
    if (navigating.current) return;
    const next = !expandedRef.current;
    expandedRef.current = next; setExpanded(next);
    progress.stopAnimation();
    if (reduceMotion) progress.setValue(next ? 1 : 0);
    else Animated.timing(progress, { toValue: next ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  };
  const navigate = () => {
    if (!expandedRef.current || navigating.current) return;
    navigating.current = true;
    router.navigate({ pathname: '/(tabs)/patterns', params: { from: 'projects' } });
  };
  return <Animated.View style={[styles.pill, {
    width: progress.interpolate({ inputRange: [0, 1], outputRange: [56, 56 + labelWidth] }),
    height: progress.interpolate({ inputRange: [0, 1], outputRange: [56, expandedHeight] }),
  }]}>
    <View pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.measure, { width: maxTextWidth }]}>
      <Copy style={[styles.label, { alignSelf: 'flex-start' }]} onLayout={({ nativeEvent: { layout } }) => setTextSize(current => Math.abs(current.width - layout.width) < 0.5 && Math.abs(current.height - layout.height) < 0.5 ? current : { width: layout.width, height: layout.height })}>Start a project</Copy>
    </View>
    <Animated.View pointerEvents={expanded ? 'auto' : 'none'} aria-hidden={!expanded} accessibilityElementsHidden={!expanded} importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'} style={{ width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, labelWidth] }), opacity: progress, overflow: 'hidden' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Start a project" disabled={!expanded} onPress={navigate} style={({ pressed }) => [{ width: labelWidth, minHeight: expandedHeight, padding: 12, paddingHorizontal: 16, justifyContent: 'center' }, pressed && styles.dim]}>
        <Copy style={styles.label}>Start a project</Copy>
      </Pressable>
    </Animated.View>
    <Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Hide start project action' : 'Show start project action'} accessibilityState={{ expanded }} aria-expanded={expanded} onPress={toggle} style={({ pressed }) => [styles.circle, pressed && styles.dim]}>
      <Icon name="yarn" size={28} color={theme.colors.text} />
    </Pressable>
  </Animated.View>;
}
const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', borderRadius: 80, borderWidth: 1, borderColor: theme.colors.line, backgroundColor: theme.colors.paper, boxShadow: theme.shadow.raised, overflow: 'hidden' },
  circle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label: { fontFamily: theme.fonts.bold, textAlign: 'center' },
  measure: { position: 'absolute', left: 0, top: 0, opacity: 0 },
  dim: { opacity: 0.65 },
});
