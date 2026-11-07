import { View } from 'react-native';
import { theme } from '@/theme';

export function YarnIcon({ size = 28, color = theme.colors.terracotta, background = theme.colors.surface }: { size?: number; color?: string; background?: string }) {
  return <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.8, borderColor: color, overflow: 'hidden', transform: [{ rotate: '-35deg' }] }}>
    {[0.18, 0.4, 0.62, 0.84].map(position => <View key={position} style={{ position: 'absolute', top: -size / 4, bottom: -size / 4, left: size * position, width: 1.8, backgroundColor: color }} />)}
    <View style={{ position: 'absolute', width: size * 1.5, height: size * 0.44, top: size * 0.25, left: -size * 0.25, backgroundColor: background, borderTopWidth: 1.8, borderBottomWidth: 1.8, borderColor: color, transform: [{ rotate: '55deg' }] }} />
  </View>;
}
