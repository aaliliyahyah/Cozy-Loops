import { useContext, type ReactNode } from 'react';
import { Text, StyleSheet, type TextProps } from 'react-native';
import { FontReadyContext } from '@/theme/FontReadyContext';
import { theme } from '@/theme';

export function Copy({ style, ...props }: TextProps) { const fontsReady = useContext(FontReadyContext); return <Text {...props} style={[styles.text, style, !fontsReady && { fontFamily: 'System' }]} />; }

export function Heading({ children, style }: { children: ReactNode; style?: TextProps['style'] }) { return <Copy accessibilityRole="header" style={[styles.heading, style]}>{children}</Copy>; }

const styles = StyleSheet.create({
  text: { fontFamily: theme.fonts.body, fontSize: 16, lineHeight: 24, color: theme.colors.text },
  heading: { fontFamily: theme.fonts.heading, fontSize: 25, lineHeight: 34, color: theme.colors.primaryDark },
});
