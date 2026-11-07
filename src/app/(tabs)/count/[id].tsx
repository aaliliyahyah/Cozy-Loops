import { useLocalSearchParams } from 'expo-router';
import { WorkModeScreen } from '@/features/projects/screens/WorkModeScreen';
export default function Counter() { const { id, from } = useLocalSearchParams<{ id: string; from?: string }>(); return <WorkModeScreen key={id} id={id} from={from} />; }
