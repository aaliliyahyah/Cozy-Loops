import { router } from 'expo-router';
import { LibraryCard } from '@/components/library/LibraryCard';
import { stitchAbbreviation, stitchName, type StitchGuide } from '../data/stitches';
import { StitchIllustration } from './StitchIllustration';

export function StitchCard({ stitch, terminology, from }: { stitch: StitchGuide; terminology: 'US' | 'UK'; from: 'home' | 'glossary' }) {
  const name = stitchName(stitch, terminology);
  return <LibraryCard
    title={name}
    imageAspectRatio={1}
    description={stitch.explanation}
    badge={stitchAbbreviation(stitch, terminology) || 'Technique'}
    label={`Open ${name} guide`}
    onPress={() => router.push({ pathname: '/stitch/[id]', params: { id: stitch.id, from } })}
    art={<StitchIllustration compact id={stitch.id} label={name} />}
  />;
}
