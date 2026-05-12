import { useEffect, useMemo, useState } from 'react';
import { Phone, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import { deleteUser, listUsers } from '../api/endpoints';
import { errorMessage } from '../api/client';
import { formatDate } from '../lib/format';
import type { User } from '../types';

export function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<User | null>(null);
  const [q, setQ] = useState('');

  async function reload() {
    setLoading(true);
    try {
      setItems(await listUsers());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  async function remove(u: User) {
    try {
      await deleteUser(u.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(t) ||
        (u.phone || '').includes(t),
    );
  }, [items, q]);

  return (
    <>
      <Topbar
        icon={<Users size={20} className="text-gold" />}
        title="Foydalanuvchilar"
        right={
          <div className="chip bg-cardHi border border-border py-1.5">
            Jami: <span className="text-white font-semibold ml-1">{items.length}</span>
          </div>
        }
      />
      <div className="p-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            className="input pl-9"
            placeholder="Telefon yoki ism..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users size={36} />} title="Foydalanuvchilar yo'q" />
        ) : (
          <div className="card divide-y divide-border">
            {filtered.map((u) => (
              <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 text-gold flex items-center justify-center font-semibold shrink-0">
                  {(u.name?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{u.name || '—'}</div>
                  <div className="text-sm text-sub flex items-center gap-1.5">
                    <Phone size={12} />
                    <a href={`tel:${u.phone}`} className="hover:text-white">
                      {u.phone}
                    </a>
                  </div>
                </div>
                <div className="text-xs text-muted hidden sm:block">
                  {formatDate(u.created_at)}
                </div>
                <button
                  className="btn-danger text-xs"
                  onClick={() => setConfirm(u)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        title="Foydalanuvchini o'chirish"
        message={`${confirm?.name || confirm?.phone} foydalanuvchisi o'chiriladi.`}
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
