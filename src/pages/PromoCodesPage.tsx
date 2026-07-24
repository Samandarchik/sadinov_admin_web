import { useEffect, useState } from 'react';
import { Pencil, Plus, Ticket, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import {
  createPromoCode,
  deletePromoCode,
  listPromoCodes,
  updatePromoCode,
} from '../api/endpoints';
import { errorMessage } from '../api/client';
import { formatDate, formatPrice } from '../lib/format';
import type { PromoCode } from '../types';

const emptyForm: Partial<PromoCode> = {
  discount_type: 'percent',
  discount_value: undefined,
  min_order: 0,
  active: true,
};

export function PromoCodesPage() {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PromoCode> | null>(null);
  const [confirm, setConfirm] = useState<PromoCode | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setItems(await listPromoCodes());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  async function save() {
    if (!editing) return;
    const code = (editing.code || '').trim().toUpperCase();
    if (!code) {
      toast.error('Promo kodni kiriting');
      return;
    }
    if (!editing.discount_value || editing.discount_value <= 0) {
      toast.error("Chegirma qiymatini kiriting");
      return;
    }
    if (editing.discount_type === 'percent' && editing.discount_value > 100) {
      toast.error("Foizli chegirma 100% dan oshmasin");
      return;
    }
    try {
      const data: Partial<PromoCode> = {
        code,
        discount_type: editing.discount_type ?? 'percent',
        discount_value: Number(editing.discount_value),
        min_order: Number(editing.min_order ?? 0),
        max_discount:
          editing.discount_type === 'percent' && editing.max_discount
            ? Number(editing.max_discount)
            : null,
        usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
        expires_at: editing.expires_at || null,
        active: editing.active ?? true,
      };
      if (editing.id) await updatePromoCode(editing.id, data);
      else await createPromoCode(data);
      toast.success('Saqlandi');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(p: PromoCode) {
    try {
      await deletePromoCode(p.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const isPercent = editing?.discount_type === 'percent';

  return (
    <>
      <Topbar
        icon={<Ticket size={20} className="text-gold" />}
        title="Promo kodlar"
        right={
          <button className="btn-gold" onClick={() => setEditing({ ...emptyForm })}>
            <Plus size={16} /> Yangi
          </button>
        }
      />
      <div className="p-4 lg:p-8">
        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Ticket size={36} />}
            title="Hozircha promo kodlar yo'q"
            description="Birinchi promo kodni qo'shing"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((p) => {
              const limitReached =
                p.usage_limit != null && p.used_count >= p.usage_limit;
              return (
                <div key={p.id} className="card p-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="font-mono font-bold text-lg tracking-wider text-gold break-all">
                      {p.code}
                    </div>
                    <span
                      className={[
                        'chip border text-[11px] shrink-0',
                        p.active && !limitReached
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                          : 'bg-red-500/15 text-red-400 border-red-500/40',
                      ].join(' ')}
                    >
                      {!p.active
                        ? "O'chiq"
                        : limitReached
                        ? 'Tugagan'
                        : 'Faol'}
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold mb-3">
                    {p.discount_type === 'percent'
                      ? `${p.discount_value}%`
                      : formatPrice(p.discount_value)}
                    <span className="text-xs font-normal text-sub ml-2">
                      chegirma
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-sub flex-1">
                    {p.min_order > 0 && (
                      <div className="flex justify-between">
                        <span>Min. buyurtma</span>
                        <span className="text-white/80">
                          {formatPrice(p.min_order)}
                        </span>
                      </div>
                    )}
                    {p.discount_type === 'percent' && p.max_discount ? (
                      <div className="flex justify-between">
                        <span>Maks. chegirma</span>
                        <span className="text-white/80">
                          {formatPrice(p.max_discount)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span>Ishlatilgan</span>
                      <span className="text-white/80">
                        {p.used_count}
                        {p.usage_limit != null ? ` / ${p.usage_limit}` : ' / ∞'}
                      </span>
                    </div>
                    {p.expires_at && (
                      <div className="flex justify-between">
                        <span>Muddat</span>
                        <span className="text-white/80">
                          {formatDate(p.expires_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      className="btn-outline flex-1 justify-center text-xs"
                      onClick={() => setEditing(p)}
                    >
                      <Pencil size={13} /> Tahrir
                    </button>
                    <button
                      className="btn-danger text-xs"
                      onClick={() => setConfirm(p)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Promo kodni tahrirlash' : 'Yangi promo kod'}
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditing(null)}>
              Bekor
            </button>
            <button className="btn-gold" onClick={save}>
              Saqlash
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label">Promo kod *</label>
              <input
                className="input font-mono uppercase tracking-wider"
                placeholder="SADINOV10"
                value={editing.code ?? ''}
                onChange={(e) =>
                  setEditing({ ...editing, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Chegirma turi</label>
                <select
                  className="input"
                  value={editing.discount_type ?? 'percent'}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      discount_type: e.target.value as 'percent' | 'fixed',
                    })
                  }
                >
                  <option value="percent">Foiz (%)</option>
                  <option value="fixed">Summa (so'm)</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {isPercent ? 'Foiz (%)*' : "Summa (so'm)*"}
                </label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  placeholder={isPercent ? '10' : '20000'}
                  value={editing.discount_value ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      discount_value:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Min. buyurtma (so'm)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={editing.min_order ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      min_order:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              {isPercent && (
                <div>
                  <label className="label">Maks. chegirma (so'm)</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    placeholder="cheksiz"
                    value={editing.max_discount ?? ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        max_discount:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ishlatish limiti</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  placeholder="cheksiz"
                  value={editing.usage_limit ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      usage_limit:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Amal qilish muddati</label>
                <input
                  className="input"
                  type="date"
                  value={(editing.expires_at ?? '').slice(0, 10)}
                  onChange={(e) =>
                    setEditing({ ...editing, expires_at: e.target.value || null })
                  }
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-gold"
                checked={editing.active ?? true}
                onChange={(e) =>
                  setEditing({ ...editing, active: e.target.checked })
                }
              />
              <span className="text-sm">Faol (mijozlar ishlatishi mumkin)</span>
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Promo kodni o'chirish"
        message={`"${confirm?.code}" promo kodi o'chiriladi. Davom etamizmi?`}
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
