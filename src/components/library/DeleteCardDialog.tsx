import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

export function DeleteCardDialog({ title, onDelete, onCancel }: { title: string; onDelete: () => void; onCancel: () => void }) {
  return <ConfirmationDialog title={`Delete ${title}?`} message="This item will move to Deleted. You can restore it later." actionLabel="Delete" destructive onCancel={onCancel} onConfirm={() => { onCancel(); onDelete(); }} />;
}
