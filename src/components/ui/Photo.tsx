import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export function CraftArt({ small = false }: { small?: boolean }) { return <Image source={require('@/assets/images/crochet-basket.png')} accessible={false} style={{ width: small ? 90 : 180, height: small ? 90 : 145, resizeMode: 'contain' }} />; }

export function Photo({ uri, compact = false, size, fill = false }: { uri?: string; compact?: boolean; size?: number; fill?: boolean }) {
  const [failed, setFailed] = useState<string>();
  return <View style={[styles.photo, fill && { height: '100%', borderRadius: 0 }, compact && { width: 86, height: 94, flexShrink: 0 }, size !== undefined && { width: size, height: size, flexShrink: 0 }]}>
    {uri && failed !== uri ? <Image source={{ uri }} accessibilityLabel="Crochet project photo" onError={() => setFailed(uri)} style={{ width: '100%', height: '100%' }} /> : <CraftArt small={compact || size !== undefined} />}
  </View>;
}

const styles = StyleSheet.create({
  photo: { width: '100%', height: 190, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.colors.sand, alignItems: 'center', justifyContent: 'center' },
});
