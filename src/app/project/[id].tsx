import { Redirect, useLocalSearchParams } from 'expo-router';
export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/(tabs)/count/[id]', params: { id } }} />;
}
