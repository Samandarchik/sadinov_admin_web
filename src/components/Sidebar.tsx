import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  Home,
  Layers,
  LayoutGrid,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: 'asosiy' | 'katalog' | 'savdo' | 'foydalanuvchi';
}

const items: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home, group: 'asosiy' },
  { to: '/categories', label: 'Kategoriyalar', icon: Layers, group: 'katalog' },
  { to: '/products', label: 'Mahsulotlar', icon: Package, group: 'katalog' },
  { to: '/banners', label: 'Bannerlar', icon: LayoutGrid, group: 'katalog' },
  { to: '/services', label: 'Servislar', icon: Wrench, group: 'katalog' },
  { to: '/orders', label: 'Buyurtmalar', icon: ShoppingCart, group: 'savdo' },
  { to: '/users', label: 'Foydalanuvchilar', icon: Users, group: 'foydalanuvchi' },
];

const groupLabels: Record<NavItem['group'], string> = {
  asosiy: 'ASOSIY',
  katalog: 'KATALOG',
  savdo: 'SAVDO',
  foydalanuvchi: 'FOYDALANUVCHI',
};

export function Sidebar() {
  const { signOut } = useAuth();
  const grouped = items.reduce<Record<string, NavItem[]>>((acc, it) => {
    (acc[it.group] ||= []).push(it);
    return acc;
  }, {});

  return (
    <aside className="w-64 bg-panel border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-6 py-6 text-center border-b border-border">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center mb-3">
          <Boxes className="text-gold" size={32} />
        </div>
        <div className="text-gold font-bold text-sm tracking-widest">SADINOV</div>
        <div className="text-white text-xs tracking-widest opacity-80">STORE</div>
        <div className="mt-1 text-[11px] text-sub">Admin boshqaruv</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {(Object.keys(grouped) as NavItem['group'][]).map((g) => (
          <div key={g}>
            <div className="section-title">{groupLabels[g]}</div>
            {grouped[g].map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-4 py-2.5 mx-2 my-0.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-gold/15 text-gold border border-gold/30'
                      : 'text-white/80 hover:bg-cardHi hover:text-white',
                  ].join(' ')
                }
              >
                <it.icon size={18} />
                <span className="font-medium">{it.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-white/80 hover:bg-cardHi transition-colors"
        >
          <LogOut size={16} /> Chiqish
        </button>
        <div className="text-center text-[10px] text-muted">v1.0 · Sadinov Store</div>
      </div>
    </aside>
  );
}
