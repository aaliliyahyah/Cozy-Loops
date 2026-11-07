import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../contexts/AppContext';
import { theme } from '../theme';
import { FontReadyContext } from '../theme/FontReadyContext';
import { Text, View } from 'react-native';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Nunito_400Regular: require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf'), Nunito_700Bold: require('@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf'), Lora_700Bold: require('@expo-google-fonts/lora/700Bold/Lora_700Bold.ttf'), Caveat_700Bold: require('@expo-google-fonts/caveat/700Bold/Caveat_700Bold.ttf') });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}><Text>Cozy Loops is getting ready...</Text></View>;

  return <SafeAreaProvider><FontReadyContext.Provider value={loaded}><AppProvider><Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.primary, headerShadowVisible: false, headerTitleStyle: { fontFamily: loaded ? theme.fonts.heading : 'System' }, contentStyle: { backgroundColor: theme.colors.background }, headerBackButtonDisplayMode: 'minimal' }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="explore" options={{ headerShown: false }} />
    <Stack.Screen name="projects" options={{ title: 'Projects' }} />
    <Stack.Screen name="pattern/new" options={{ title: 'New pattern' }} />
    <Stack.Screen name="pattern/[id]" options={{ headerShown: false }} />
    <Stack.Screen name="pattern/edit/[id]" options={{ headerShown: false }} />
    <Stack.Screen name="project/[id]" options={{ title: 'Your project', gestureEnabled: false }} />
    <Stack.Screen name="project/complete/[id]" options={{ title: 'Your finished project' }} />
    <Stack.Screen name="stitch/[id]" options={{ headerShown: false }} />
    <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    <Stack.Screen name="lookup" options={{ headerShown: false }} />
  </Stack></AppProvider></FontReadyContext.Provider></SafeAreaProvider>;
}
