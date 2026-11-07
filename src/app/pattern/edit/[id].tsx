import { useLocalSearchParams } from 'expo-router';
import { PatternEditor } from '../../../features/patterns/PatternEditor';
export default function EditPattern() { const { id } = useLocalSearchParams<{ id: string }>(); return <PatternEditor id={id} />; }
