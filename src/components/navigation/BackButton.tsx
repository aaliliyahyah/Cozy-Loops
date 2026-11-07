import { router, usePreventRemove, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';
import { IconButton } from '@/components/library/Controls';

export function BackButton({ fallback = '/(tabs)', target, onPress }: { fallback?: Href; target?: Href; onPress?: () => void }) {
  const back = () => target ? router.navigate(target) : router.canGoBack() ? router.back() : router.replace(fallback);
  return <IconButton icon="arrow-left" label="Back" onPress={onPress || back} />;
}

export function OriginBackGuard({ target }: { target: Href }) {
  return Platform.OS === 'web' ? null : <NativeOriginBackGuard target={target} />;
}

function NativeOriginBackGuard({ target }: { target: Href }) {
  const [enabled, setEnabled] = useState(true);
  usePreventRemove(enabled, ({ repeat }) => { setEnabled(false); repeat(); router.navigate(target); });
  return null;
}
