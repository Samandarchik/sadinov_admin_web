import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Filter, Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import { listOrders } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { formatDate, formatPrice, STATUS_COLOR, STATUS_LABEL } from '../lib/format';
import type { Order, OrderStatus } from '../types';

export function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');

  async function reload() {
    setLoading(true);
    try {
      setItems(await listOrders());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (!q.trim()) return true;
      const t = q.toLowerCase();
      return (
        o.order_id.toLowerCase().includes(t) ||
        (o.user_name || '').toLowerCase().includes(t) ||
        (o.user_phone || '').includes(t)
      );
    });
  }, [items, q, status]);

  const pending = useMemo(
    () => items.filter((o) => o.status === 'pending').length,
    [items],
  );

  return (
    <>
      <Topbar
        icon={<ShoppingCart size={20} className="text-gold" />}
        title="Buyurtmalar"
        right={
          <div className="chip bg-gold/10 text-gold border border-gold/30 py-1.5">
            <Bell size={13} /> Yangi: {pending}
          </div>
        }
      />
      <div className="p-4 lg:p-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              className="input pl-9"
              placeholder="Order ID, mijoz, telefon..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
            <select
              className="input pl-9 pr-8 min-w-[200px]"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}
            >
              <option value="all">Barcha statuslar</option>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart size={36} />}
            title="Buyurtmalar topilmadi"
          />
        ) : (
          <div className="card divide-y divide-border">
            {filtered.map((o) => (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="block px-5 py-4 hover:bg-cardHi transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-semibold">
                        #{o.order_id}
                      </span>
                      <span className={`chip border ${STATUS_COLOR[o.status]}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </div>
                    <div className="text-sm text-sub">
                      {o.user_name || 'Mijoz'} · {o.user_phone || '—'}
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {formatDate(o.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">
                      {formatPrice(o.total, o.currency)}
                    </div>
                    <div className="text-xs text-sub">
                      {o.items.length} ta mahsulot
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
