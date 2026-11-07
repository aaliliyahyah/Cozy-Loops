import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Copy, Photo, Screen } from '../../../components/cozy-ui';
import { useApp } from '../../../contexts/AppContext';
export default function ProjectComplete() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { data } = useApp();
  const p = data.projects.find(p => p.id === id);
  return <Screen title={p?.status === 'completed' ? 'Made with patience & love' : 'Project details'}>
    {p?.status === 'completed' ? <><Photo uri={p.patternSnapshot.imageUri} /><Card><Copy style={{ fontSize: 25 }}>{p.name}</Copy><Copy>Completed</Copy><Copy>{p.rows.filter(r => r.completed).length} {p.patternSnapshot.rowType}s completed</Copy><Copy>{p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}</Copy><Copy>Pattern: {p.patternSnapshot.title}</Copy></Card>{p.rows.map((r, i) => <Copy key={i}>{p.patternSnapshot.rowType} {i + 1}: {r.count} recorded stitches</Copy>)}</> : <Copy>This project has not been completed.</Copy>}
    <Button title="Return to Projects" onPress={() => router.replace('/projects')} />
  </Screen>;
}
