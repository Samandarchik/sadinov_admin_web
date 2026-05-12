import { ReactNode } from 'react';

interface TopbarProps {
  icon?: ReactNode;
  title: string;
  right?: ReactNode;
}

export function Topbar({ icon, title, right }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-bg/60 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3 text-white">
        {icon}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
