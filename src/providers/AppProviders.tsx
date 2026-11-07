import type { ReactNode } from 'react';
import { useFonts } from 'expo-font';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './AppProvider';
import { theme } from '@/theme';
import { FontReadyContext } from '@/theme/FontReadyContext';
import { fontAssets } from '@/theme/fonts';

export function AppProviders({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts(fontAssets);
  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}><Text>Cozy Loops is getting ready...</Text></View>;
  }
  return (
    <SafeAreaProvider>
      <FontReadyContext.Provider value={loaded}>
        <AppProvider>{children}</AppProvider>
      </FontReadyContext.Provider>
    </SafeAreaProvider>
  );
}
