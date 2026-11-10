import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'expo-router';
import { closeConfirmation, getConfirmation, subscribeConfirmation } from '@/utils/confirm';
import { ConfirmationDialog } from './ConfirmationDialog';

export function ConfirmationHost() {
  const request = useSyncExternalStore(subscribeConfirmation, getConfirmation, getConfirmation);
  const pathname = usePathname();
  useEffect(() => () => {
    const current = getConfirmation();
    if (current) closeConfirmation(current);
  }, [pathname]);
  if (!request) return null;
  const actionLabel = request.destructive ? (/^discard/i.test(request.title) ? 'Discard' : 'Delete') : /^restore/i.test(request.title) ? 'Restore' : /^replace/i.test(request.title) ? 'Replace' : /^finish/i.test(request.title) ? 'Finish' : 'Confirm';
  return <ConfirmationDialog title={request.title} message={request.message} actionLabel={actionLabel} destructive={request.destructive}
    onCancel={() => { closeConfirmation(request); }} onConfirm={() => {
      if (closeConfirmation(request)) request.action();
    }} />;
}
