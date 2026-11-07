import { Tabs } from 'expo-router/js-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Copy, YarnIcon } from './cozy-ui';
import { theme } from '../theme';
const destinations = [ ['index', 'Home', 'home-outline'], ['patterns', 'Patterns', 'book-open-variant'], ['add', 'Add pattern', 'heart-plus'], ['count', 'Projects', 'yarn'], ['glossary', 'Glossary', 'flower-tulip-outline'] ] as const;
function TabButton({ name, label, icon, selected, onPress, onLongPress }: { name: string; label: string; icon: string; selected: boolean; onPress: () => void; onLongPress: () => void }) {
  const [scale] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => { let mounted = true; void AccessibilityInfo.isReduceMotionEnabled().then(v => { if (mounted) setReduceMotion(v); }); const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion); return () => { mounted = false; sub.remove(); }; }, []);
  useEffect(() => { if (!reduceMotion && selected) Animated.sequence([Animated.timing(scale, { toValue: 1.12, duration: theme.motion.press, useNativeDriver: Platform.OS !== 'web' }), Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' })]).start(); }, [selected, reduceMotion, scale]);
  const center = name === 'add'; const color = center ? theme.colors.onPrimary : selected ? theme.colors.primary : theme.colors.muted;
  return <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} onPress={onPress} onLongPress={onLongPress} onPressIn={() => { if (!reduceMotion) Animated.timing(scale, { toValue: 0.91, duration: theme.motion.press, useNativeDriver: Platform.OS !== 'web' }).start(); }} onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start()} style={s.tab}>
    <Animated.View style={[s.tabContent, center && s.center, { transform: [{ scale }] }]}>{icon === 'yarn' ? <YarnIcon size={25} color={color} background={theme.colors.surface} /> : <MaterialCommunityIcons name={icon as keyof typeof MaterialCommunityIcons.glyphMap} size={center ? 29 : 25} color={color} />}{!center && <Copy style={[s.label, { color }, selected && s.bold]}>{label}</Copy>}</Animated.View>
  </Pressable>;
}
function CraftTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  if (keyboardVisible) return null;
  return <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>{destinations.map(([name, label, icon]) => {
    const route = state.routes.find(r => r.name === name); if (!route) return null;
    return <TabButton key={name} name={name} label={label} icon={icon} selected={state.routes[state.index].key === route.key} onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })} onPress={() => { const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!event.defaultPrevented && state.routes[state.index].key !== route.key) navigateToTab(route.key); }} />;
  })}</View>;
}
export default function TabLayout() {
  return <Tabs tabBar={props => <CraftTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.colors.background } }}>
    <Tabs.Screen name="index" /><Tabs.Screen name="patterns" /><Tabs.Screen name="add" /><Tabs.Screen name="count" options={{ popToTopOnBlur: true }} /><Tabs.Screen name="glossary" />
  </Tabs>;
}
const s = StyleSheet.create({ bar: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingHorizontal: 6, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line }, tab: { flex: 1, minHeight: 54, justifyContent: 'center', alignItems: 'center' }, tabContent: { minHeight: 48, gap: 2, alignItems: 'center', justifyContent: 'center' }, label: { fontSize: 11, lineHeight: 16, textAlign: 'center', flexShrink: 1 }, bold: { fontFamily: theme.fonts.bold }, center: { width: 60, height: 60, marginTop: -24, backgroundColor: theme.colors.terracotta, borderWidth: 4, borderColor: theme.colors.surface, borderRadius: theme.radius.pill, boxShadow: theme.shadow.raised } });
