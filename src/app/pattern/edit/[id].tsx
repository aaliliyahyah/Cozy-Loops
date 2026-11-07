import { useLocalSearchParams } from 'expo-router';
import { PatternEditorScreen } from '@/features/patterns/screens/PatternEditorScreen';
export default function EditPattern() { const { id } = useLocalSearchParams<{ id: string }>(); return <PatternEditorScreen id={id} />; }
