import { Volleyball } from 'lucide-react-native';
import { theme } from '@/theme';
export function YarnIcon({ size = 28, color = theme.colors.terracotta }: { size?: number; color?: string; background?: string }) {
  return <Volleyball size={size} color={color} strokeWidth={1.8} />;
}
