import { Platform, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';
import { theme } from '@/theme';

// Stylized stitch motifs drawn as scalable vectors.
export function StitchIllustration({ id, label, compact = false }: { id: string; label: string; compact?: boolean }) {
  const color = theme.colors.terracotta;
  const height = compact ? '100%' : 180;
  return <View accessible accessibilityRole="image" accessibilityLabel={`${label} stitch symbol illustration`} style={{ width: '100%', height, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.sand, borderRadius: compact ? 0 : 20 }}>
    <Svg width="90%" height="90%" viewBox="0 0 240 150" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={Platform.OS === 'web' ? true : undefined}>
      <Path d="M 24 126 Q 72 110 120 126 T 216 126" fill="none" stroke={theme.colors.sage} strokeWidth={3} />
      {id === 'chain' ? [60, 100, 140, 180].map(x => <Ellipse key={x} cx={x} cy={75} rx={25} ry={12} transform={`rotate(-30 ${x} 75)`} fill="none" stroke={color} strokeWidth={4} />)
        : id === 'magic-ring' || id === 'slip-knot' ? <><Circle cx={120} cy={70} r={35} fill="none" stroke={color} strokeWidth={4} /><Path d="M 125 36 C 165 20 178 98 143 103 L 180 126 M 103 100 Q 85 124 56 120" fill="none" stroke={color} strokeWidth={4} /></>
        : id === 'front-loop' || id === 'back-loop' ? <><Path d="M 50 65 Q 120 125 190 65 M 50 65 Q 120 5 190 65" fill="none" stroke={theme.colors.primary} strokeWidth={4} /><Path d={id === 'front-loop' ? 'M 50 65 Q 120 125 190 65' : 'M 50 65 Q 120 5 190 65'} fill="none" stroke={color} strokeWidth={7} /></>
        : id === 'slip-stitch' ? <Circle cx={120} cy={75} r={9} fill={color} />
        : id === 'increase' || id === 'decrease' ? <Path d={id === 'increase' ? 'M 80 40 L 120 112 L 160 40 M 68 40 L 92 40 M 148 40 L 172 40' : 'M 80 112 L 120 40 L 160 112 M 108 40 L 132 40'} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
        : [75, 120, 165].map(x => <ViewSymbol key={x} x={x} id={id} color={color} />)}
    </Svg>
  </View>;
}
function ViewSymbol({ x, id, color }: { x: number; id: string; color: string }) {
  if (id === 'single') return <Path d={`M ${x - 12} 62 L ${x + 12} 90 M ${x + 12} 62 L ${x - 12} 90`} stroke={color} strokeWidth={4} strokeLinecap="round" />;
  const bars = id === 'treble' ? 2 : id === 'double' ? 1 : 0;
  return <>
    <Line x1={x} y1={36} x2={x} y2={112} stroke={color} strokeWidth={4} strokeLinecap="round" />
    <Line x1={x - 13} y1={36} x2={x + 13} y2={36} stroke={color} strokeWidth={4} strokeLinecap="round" />
    {Array.from({ length: bars }, (_, i) => <Line key={i} x1={x - 10} y1={57 + i * 17} x2={x + 10} y2={69 + i * 17} stroke={color} strokeWidth={4} strokeLinecap="round" />)}
  </>;
}
