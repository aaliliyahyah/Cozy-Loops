import { useContext, useState, type ReactNode } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontReadyContext } from '../theme/FontReadyContext';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle, type TextInputProps, type TextProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { theme } from '../theme';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';

export function Copy({ style, ...props }: TextProps) { const fontsReady = useContext(FontReadyContext); return <Text {...props} style={[styles.text, style, !fontsReady && { fontFamily: 'System' }]} />; }
export function Heading({ children }: { children: ReactNode }) { return <Copy accessibilityRole="header" style={styles.heading}>{children}</Copy>; }
export function YarnIcon({ size = 28, color = theme.colors.terracotta, background = theme.colors.surface }: { size?: number; color?: string; background?: string }) {
  return <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.8, borderColor: color, overflow: 'hidden', transform: [{ rotate: '-35deg' }] }}>
    {[0.18, 0.4, 0.62, 0.84].map(position => <View key={position} style={{ position: 'absolute', top: -size / 4, bottom: -size / 4, left: size * position, width: 1.8, backgroundColor: color }} />)}
    <View style={{ position: 'absolute', width: size * 1.5, height: size * 0.44, top: size * 0.25, left: -size * 0.25, backgroundColor: background, borderTopWidth: 1.8, borderBottomWidth: 1.8, borderColor: color, transform: [{ rotate: '55deg' }] }} />
  </View>;
}
export function Button({ title, onPress, secondary, disabled, label, olive, icon }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; label?: string; olive?: boolean; icon?: keyof typeof Ionicons.glyphMap;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label || title} accessibilityState={{ disabled: !!disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, olive && { backgroundColor: theme.colors.primary }, secondary && styles.secondary, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }]}>
    {icon && <Ionicons name={icon} size={22} color={secondary ? theme.colors.text : '#FFFAF1'} />}
    <Copy style={[styles.buttonText, secondary && { color: theme.colors.text }]}>{title}</Copy>
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const fontsReady = useContext(FontReadyContext);
  return <View style={{ gap: 6 }}><Copy style={styles.label}>{label}</Copy><TextInput accessibilityLabel={label}
    placeholderTextColor={theme.colors.muted} {...props} style={[styles.field, props.multiline && { minHeight: 110, textAlignVertical: 'top' }, props.style, !fontsReady && { fontFamily: 'System' }]} /></View>;
}
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[styles.card, style]}>{children}</View>; }
export function CraftArt({ small = false }: { small?: boolean }) { return <Image source={require('../../assets/images/crochet-basket.png')} accessible={false} style={{ width: small ? 90 : 180, height: small ? 90 : 145, resizeMode: 'contain' }} />; }
export function Photo({ uri, compact = false, size, fill = false }: { uri?: string; compact?: boolean; size?: number; fill?: boolean }) {
  const [failed, setFailed] = useState<string>();
  return <View style={[styles.photo, fill && { height: '100%', borderRadius: 0 }, compact && { width: 86, height: 94, flexShrink: 0 }, size !== undefined && { width: size, height: size, flexShrink: 0 }]}>
    {uri && failed !== uri ? <Image source={{ uri }} accessibilityLabel="Crochet project photo" onError={() => setFailed(uri)} style={{ width: '100%', height: '100%' }} /> : <CraftArt small={compact || size !== undefined} />}
  </View>;
}
export function Gingham() { return <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.gingham}>{Array.from({ length: 32 }, (_, i) => <View key={i} style={{ width: 22, height: 24, backgroundColor: i % 2 ? '#B7B77E55' : '#F1E8C6', borderBottomWidth: 12, borderBottomColor: i % 2 ? '#B7B77E33' : '#D7CFA155' }} />)}</View>; }
export function Empty({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return <Card><View style={{ alignItems: 'center' }}><CraftArt /></View><Heading>{title}</Heading><Copy>{detail}</Copy>{children}</Card>;
}
export function Progress({ completed, total, caption = true, unit = 'rows completed' }: { completed: number; total: number; caption?: boolean; unit?: string }) {
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round(completed / total * 100))) : 0;
  return <View style={{ gap: 6 }} accessibilityLabel={`${completed} of ${total} ${unit}`} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: completed }}>
    <View style={styles.row}><View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View><Copy style={{ fontSize: 15, fontFamily: theme.fonts.bold }}>{percent}%</Copy></View>
    {caption && <Copy style={{ fontSize: 14, color: theme.colors.muted }}>{completed} of {total} completed</Copy>}</View>;
}
export function Screen({ title, subtitle, children, footer, decoration = false, header, includeTopInset = false, contentStyle }: { title?: string; subtitle?: string; children: ReactNode; footer?: ReactNode; decoration?: boolean; header?: ReactNode; includeTopInset?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const { ready, loadError, reload, saveStatus, retrySave } = useApp();
  const tabHeight = useContext(BottomTabBarHeightContext);
  const edges: ('top' | 'left' | 'right' | 'bottom')[] = ['left', 'right'];
  if (includeTopInset) edges.push('top');
  if (tabHeight === undefined) edges.push('bottom');
  return <SafeAreaView style={styles.safe} edges={edges}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, contentStyle]}>
      {header}
      {decoration && <Gingham />}
      {title && <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><View style={{ flex: 1, gap: 6 }}><Heading>{title}</Heading>{subtitle && <Copy style={{ color: theme.colors.muted }}>{subtitle}</Copy>}</View>{decoration && <Image source={require('../../assets/images/crochet-daisy.png')} accessible={false} style={{ width: 80, height: 88, resizeMode: 'contain' }} />}</View>}
      {loadError ? <Card><Copy accessibilityRole="alert">{loadError}</Copy><Button title="Try loading again" onPress={reload} /></Card> : !ready ? <ActivityIndicator accessibilityLabel="Loading saved crochet data" color={theme.colors.primary} /> : <>
        {saveStatus === 'error' && <Card><Copy accessibilityRole="alert">Changes are on this screen but could not be saved. Keep the app open and retry.</Copy><Button title="Retry saving" onPress={retrySave} /></Card>}
        {children}
      </>}
    </ScrollView>{ready && !loadError && footer}</KeyboardAvoidingView></SafeAreaView>;
}
export function confirm(title: string, message: string, action: () => void, destructive = false) {
  if (Platform.OS === 'web') { if (window.confirm(`${title}\n${message}`)) action(); return; }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', style: destructive ? 'destructive' : 'default', onPress: action }]);
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  page: { padding: 20, paddingBottom: 32, gap: 20, width: '100%', maxWidth: 650, alignSelf: 'center' },
  text: { fontFamily: theme.fonts.body, fontSize: 16, lineHeight: 24, color: theme.colors.text },
  heading: { fontFamily: theme.fonts.heading, fontSize: 25, lineHeight: 34, color: theme.colors.primaryDark },
  label: { fontFamily: theme.fonts.bold, color: theme.colors.text, fontSize: 14 },
  card: { borderRadius: theme.radius.card, backgroundColor: theme.colors.surface, padding: 18, gap: 14, borderWidth: 1, borderColor: theme.colors.line, boxShadow: '0px 2px 3px rgba(110, 68, 31, 0.08)' },
  button: { minHeight: 50, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.terracotta, borderRadius: theme.radius.button, padding: 12, borderWidth: 1, borderColor: '#FFFFFF66', boxShadow: '0px 2px 3px rgba(110, 68, 31, 0.1)' },
  secondary: { backgroundColor: theme.colors.surface, borderColor: theme.colors.line },
  buttonText: { color: '#FFFAF1', fontFamily: theme.fonts.bold, textAlign: 'center', flexShrink: 1 },
  field: { borderWidth: 1, borderColor: theme.colors.line, borderRadius: 16, padding: 14, minHeight: 52, backgroundColor: theme.colors.paper, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 16 },
  track: { height: 11, flex: 1, borderRadius: 8, backgroundColor: theme.colors.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 8 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  photo: { width: '100%', height: 190, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center' },
  gingham: { height: 24, flexDirection: 'row', overflow: 'hidden', borderRadius: 6, opacity: 0.8 },
});
