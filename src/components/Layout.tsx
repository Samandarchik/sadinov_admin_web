import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface SidebarCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarCtx | null>(null);

export function useSidebar(): SidebarCtx {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within Layout');
  return ctx;
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      <div className="flex bg-bg min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          <Outlet />
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
