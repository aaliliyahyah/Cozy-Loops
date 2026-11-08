import { useContext } from 'react';
import { BackButton } from '@/components/navigation/BackButton';
import { Stack } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';
import { FontReadyContext } from '@/theme/FontReadyContext';
import { theme } from '@/theme';

function RootStack() {
  const loaded = useContext(FontReadyContext);
  return (<Stack screenOptions={{ headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.primary, headerShadowVisible: false, headerTitleStyle: { fontFamily: loaded ? theme.fonts.heading : 'System' }, contentStyle: { backgroundColor: theme.colors.background }, headerBackButtonDisplayMode: 'minimal', headerLeft: () => <BackButton /> }}>
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
    <Stack.Screen name="settings" options={{ headerShown: false }} />
    <Stack.Screen name="lookup" options={{ headerShown: false }} />
  </Stack>);
}

export default function RootNavigator() {
  return <AppProviders><RootStack /></AppProviders>;
}
