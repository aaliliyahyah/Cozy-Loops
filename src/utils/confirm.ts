export interface Confirmation {
  title: string; message: string; action: () => void; destructive: boolean;
}
let pending: Confirmation | null = null;
const listeners = new Set<() => void>();
export const getConfirmation = () => pending;
export function subscribeConfirmation(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function closeConfirmation(request: Confirmation) {
  if (pending !== request) return false;
  pending = null;
  listeners.forEach(listener => listener());
  return true;
}
export function confirm(title: string, message: string, action: () => void, destructive = false) {
  if (pending) return;
  pending = { title, message, action, destructive };
  listeners.forEach(listener => listener());
}
