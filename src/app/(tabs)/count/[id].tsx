import { useLocalSearchParams } from 'expo-router';
import { WorkMode } from '../../../features/projects/WorkMode';
export default function Counter() { const { id } = useLocalSearchParams<{ id: string }>(); return <WorkMode key={id} id={id} />; }
