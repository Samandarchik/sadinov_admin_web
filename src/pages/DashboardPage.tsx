import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  Home,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Topbar } from '../components/Topbar';
import { PageSpinner } from '../components/Spinner';
import { getStats } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { formatPrice } from '../lib/format';
import toast from 'react-hot-toast';
import type { Stats } from '../types';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: 'gold' | 'green' | 'blue' | 'purple' | 'red';
}

const tones: Record<StatCardProps['tone'], string> = {
  gold: 'from-gold/25 to-gold/5 border-gold/40 text-gold',
  green: 'from-emerald-500/25 to-emerald-500/5 border-emerald-500/40 text-emerald-400',
  blue: 'from-blue-500/25 to-blue-500/5 border-blue-500/40 text-blue-400',
  purple: 'from-violet-500/25 to-violet-500/5 border-violet-500/40 text-violet-400',
  red: 'from-red-500/25 to-red-500/5 border-red-500/40 text-red-400',
};

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className={`card p-5 border bg-gradient-to-br ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-sub mb-1 uppercase tracking-wider">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${tones[tone].split(' ').pop()}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await getStats();
        if (mounted) setData(d);
      } catch (err) {
        toast.error(errorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Topbar icon={<Home size={20} className="text-gold" />} title="Dashboard" />
      <div className="p-4 lg:p-8">
        {loading ? (
          <PageSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Jami buyurtmalar"
              value={String(data?.total_orders ?? 0)}
              icon={ShoppingCart}
              tone="gold"
            />
            <StatCard
              label="Kutilmoqda"
              value={String(data?.pending_orders ?? 0)}
              icon={TrendingUp}
              tone="purple"
            />
            <StatCard
              label="Foydalanuvchilar"
              value={String(data?.total_users ?? 0)}
              icon={Users}
              tone="blue"
            />
            <StatCard
              label="Mahsulotlar"
              value={String(data?.total_products ?? 0)}
              icon={Package}
              tone="green"
            />
            <StatCard
              label="Tushum"
              value={formatPrice(data?.total_revenue ?? 0)}
              icon={DollarSign}
              tone="green"
            />
          </div>
        )}
      </div>
    </>
  );
}
