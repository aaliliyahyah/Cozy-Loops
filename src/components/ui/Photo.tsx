import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { photoLayout, type PhotoCrop } from '@/features/patterns/model/photo';
import { theme } from '@/theme';

export function CraftArt({ small = false }: { small?: boolean }) { return <Image source={require('@/assets/images/crochet-basket.png')} accessible={false} style={{ width: small ? 90 : 180, height: small ? 90 : 145, resizeMode: 'contain' }} />; }

export function Photo({ uri, compact = false, size, fill = false, crop }: { uri?: string; compact?: boolean; size?: number; fill?: boolean; crop?: PhotoCrop }) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [failed, setFailed] = useState<string>();
  return <View onLayout={event => { const { width, height } = event.nativeEvent.layout; setLayout(current => current.width === width && current.height === height ? current : { width, height }); }} style={[styles.photo, fill && { height: '100%', borderRadius: 0 }, compact && { width: 86, height: 94, flexShrink: 0 }, size !== undefined && { width: size, height: size, flexShrink: 0 }]}>
    {uri && failed !== uri ? <Image source={{ uri }} accessibilityLabel="Crochet project photo" onError={() => setFailed(uri)} resizeMode="cover" style={crop && layout.width > 0 && layout.height > 0 ? { position: 'absolute', ...photoLayout(crop, layout.width, layout.height) } : { width: '100%', height: '100%' }} /> : <CraftArt small={compact || size !== undefined} />}
  </View>;
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 190, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center' },
});
