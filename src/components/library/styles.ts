import { StyleSheet } from 'react-native';
import { theme } from '@/theme';
export const libraryStyles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, muted: { color: theme.colors.muted }, art: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.sage, gap: 8 }, abbreviation: { fontFamily: theme.fonts.heading, fontSize: 34, lineHeight: 44, color: theme.colors.primary } });
