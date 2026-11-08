import type { CrochetProject } from '@/types/cozy';
export function homeProjects(projects: CrochetProject[]): CrochetProject[] {
  return projects.filter(project => !project.deletedAt).sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}
