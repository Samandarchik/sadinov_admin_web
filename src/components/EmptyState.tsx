import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-sub">
      {icon && <div className="mb-3 flex justify-center text-muted">{icon}</div>}
      <div className="text-white font-medium mb-1">{title}</div>
      {description && <div className="text-sm text-sub mb-4">{description}</div>}
      {action}
    </div>
  );
}
