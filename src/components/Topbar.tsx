import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from './Layout';

interface TopbarProps {
  icon?: ReactNode;
  title: string;
  right?: ReactNode;
}

export function Topbar({ icon, title, right }: TopbarProps) {
  const { toggle } = useSidebar();
  return (
    <div className="flex items-center justify-between gap-2 px-4 lg:px-8 py-4 lg:py-5 border-b border-border bg-bg/60 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-3 text-white min-w-0">
        <button
          type="button"
          onClick={toggle}
          aria-label="Menyu"
          className="lg:hidden -ml-1 p-2 rounded-lg text-white/80 hover:bg-cardHi"
        >
          <Menu size={20} />
        </button>
        {icon}
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}
