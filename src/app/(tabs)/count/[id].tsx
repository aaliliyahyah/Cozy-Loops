import { useLocalSearchParams } from 'expo-router';
import { WorkModeScreen } from '@/features/projects/screens/WorkModeScreen';
export default function Counter() { const { id } = useLocalSearchParams<{ id: string }>(); return <WorkModeScreen key={id} id={id} />; }
