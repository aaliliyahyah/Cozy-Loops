import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
// Keep server rendering deterministic without setting React state in an effect.
export function useColorScheme() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const colorScheme = useRNColorScheme();
  return hydrated ? colorScheme : 'light';
}
