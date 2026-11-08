import type { Href } from 'expo-router';
const targets: Record<string, Href> = { home: '/(tabs)', patterns: '/(tabs)/patterns', add: '/(tabs)/add', projects: '/(tabs)/count', count: '/(tabs)/count', glossary: '/(tabs)/glossary' };
export function originTarget(from?: string | string[], fallback: Href = '/(tabs)'): Href {
  return targets[Array.isArray(from) ? from[0] : from || ''] || fallback;
}
