import { ArrowLeft, Undo2, BookOpen, Check, ChevronRight, Flower2, Heart, HeartPlus, House, Import, Minus, Pencil, Plus, Search, Settings, Trash2, Copy as CopyIcon, Circle, Volleyball, type LucideIcon } from 'lucide-react-native';
const icons: Record<string, LucideIcon> = { 'arrow-left': ArrowLeft, 'arrow-undo-outline': Undo2, 'book-open-variant': BookOpen, checkmark: Check, 'chevron-forward': ChevronRight, 'flower-tulip-outline': Flower2, heart: Heart, 'heart-outline': Heart, 'heart-plus': HeartPlus, 'home-outline': House, import: Import, minus: Minus, 'pencil-outline': Pencil, plus: Plus, add: Plus, magnify: Search, 'settings-outline': Settings, 'trash-can-outline': Trash2, yarn: Volleyball, copy: CopyIcon };
export function Icon({ name, size = 24, color, fill = 'none' }: { name: string; size?: number; color?: string; fill?: string }) {
  const Component = icons[name] || Circle;
  return <Component size={size} color={color} strokeWidth={1.8} fill={fill} />;
}
