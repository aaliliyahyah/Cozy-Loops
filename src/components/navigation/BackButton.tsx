import { router, useFocusEffect, useLocalSearchParams, usePreventRemove, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { originTarget } from './origin';
import { IconButton } from '@/components/library/Controls';

export function BackButton({ fallback = '/(tabs)', target, onPress }: { fallback?: Href; target?: Href; onPress?: () => void }) {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const destination = target || (from ? originTarget(from, fallback) : undefined);
  const back = useCallback(() => destination ? router.navigate(destination) : router.canGoBack() ? router.back() : router.replace(fallback), [destination, fallback]);
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== 'android' || (!destination && !onPress)) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { (onPress || back)(); return true; });
    return () => subscription.remove();
  }, [destination, onPress, back]));
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
