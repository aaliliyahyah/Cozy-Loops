import { createContext, useCallback, useState, type ReactNode } from 'react';
import { useFocusEffect } from 'expo-router';

export const CardActionsContext = createContext<{ activeId: string | null; open: (id: string | null) => void } | null>(null);

export function CardActionsProvider({ children }: { children: ReactNode }) {
  const [activeId, open] = useState<string | null>(null);
  useFocusEffect(useCallback(() => () => open(null), []));
  return <CardActionsContext.Provider value={{ activeId, open }}>{children}</CardActionsContext.Provider>;
}
