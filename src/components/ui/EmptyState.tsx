import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { CraftArt } from '@/components/ui/Photo';
import { Copy, Heading } from '@/components/ui/Typography';

export function Empty({ title, detail, children }: { title: string; detail: string; children?: ReactNode }) {
  return <Card><View style={{ alignItems: 'center' }}><CraftArt /></View><Heading>{title}</Heading><Copy>{detail}</Copy>{children}</Card>;
}
