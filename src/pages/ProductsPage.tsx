import { useEffect, useMemo, useState } from 'react';
import { Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import {
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  updateProduct,
} from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import { formatPrice } from '../lib/format';
import type { Category, Product } from '../types';

interface ProductDraft extends Partial<Product> {
  sizes?: Array<{ name: string; price: number }>;
}

const empty: ProductDraft = {
  name: '',
  name_uz: '',
  name_ru: '',
  description: '',
  description_uz: '',
  description_ru: '',
  currency: "so'm",
  images: [''],
  sizes: [],
  category_id: 0,
  category_name: '',
  in_stock: true,
};

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductDraft | null>(null);
  const [confirm, setConfirm] = useState<Product | null>(null);
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState<number | 'all'>('all');

  async function reload() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([listProducts(), listCategories()]);
      setItems(p);
      setCats(c);
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
    return items.filter((p) => {
      if (filterCat !== 'all' && p.category_id !== filterCat) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.name_uz ?? '').toLowerCase().includes(needle) ||
        (p.name_ru ?? '').toLowerCase().includes(needle)
      );
    });
  }, [items, q, filterCat]);

  function open(p?: Product) {
    if (p) {
      setEditing({
        ...p,
        images: p.images.length ? [...p.images] : [''],
        sizes: p.sizes
          ? p.sizes.map((s: any) => ({
              name: s.name ?? s.label ?? '',
              price: Number(s.price) || 0,
            }))
          : [],
      });
    } else {
      setEditing({ ...empty, images: [''], sizes: [] });
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name_uz || !editing.name_ru || !editing.category_id) {
      toast.error("Nom (uz & ru) va kategoriyani kiriting");
      return;
    }
    const imgs = (editing.images ?? []).map((s) => s.trim()).filter(Boolean);
    if (imgs.length === 0) {
      toast.error('Kamida 1 ta rasm kerak');
      return;
    }
    const cat = cats.find((c) => c.id === editing.category_id);
    const data: Partial<Product> = {
      name: editing.name?.trim() || editing.name_uz,
      name_uz: editing.name_uz,
      name_ru: editing.name_ru,
      description: editing.description ?? '',
      description_uz: editing.description_uz ?? '',
      description_ru: editing.description_ru ?? '',
      price: Number(editing.price) || 0,
      currency: editing.currency || "so'm",
      images: imgs,
      sizes: (editing.sizes ?? [])
        .filter((s) => s.name && Number(s.price) > 0)
        .map((s) => ({ name: s.name, price: Number(s.price) })),
      category_id: editing.category_id,
      category_name: cat?.name_uz || editing.category_name || '',
      position: editing.position ?? 0,
      in_stock: !!editing.in_stock,
      quantity: Number(editing.quantity) || 0,
    };
    try {
      if (editing.id) await updateProduct(editing.id, data);
      else await createProduct(data);
      toast.success('Saqlandi');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(p: Product) {
    try {
      await deleteProduct(p.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <Topbar
        icon={<Package size={20} className="text-gold" />}
        title="Mahsulotlar"
        right={
          <button className="btn-gold" onClick={() => open()}>
            <Plus size={16} /> Yangi mahsulot
          </button>
        }
      />
      <div className="p-4 lg:p-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              className="input pl-9"
              placeholder="Mahsulot nomi..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="input max-w-xs"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Barcha kategoriyalar</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name_uz}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <PageSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Package size={36} />}
            title="Mahsulot topilmadi"
            description={q ? 'Boshqa so\'rov bilan urinib ko\'ring' : "Birinchi mahsulotni qo'shing"}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div key={p.id} className="card p-3 flex flex-col">
                <div className="aspect-square rounded-lg bg-panel overflow-hidden mb-3 relative">
                  {p.images[0] ? (
                    <img src={absUrl(p.images[0])} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-muted absolute inset-0 m-auto" size={48} />
                  )}
                  {!p.in_stock && (
                    <span className="absolute top-2 left-2 chip bg-red-500/80 text-white">
                      Mavjud emas
                    </span>
                  )}
                </div>
                <div className="text-xs text-sub mb-0.5">{p.category_name}</div>
                <div className="font-semibold text-sm mb-0.5 line-clamp-2">{p.name_uz || p.name}</div>
                {p.name_ru && (
                  <div className="text-xs text-sub mb-1 line-clamp-1">{p.name_ru}</div>
                )}
                <div className="text-gold font-bold text-sm mb-3">
                  {formatPrice(p.price, p.currency)}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button className="btn-outline flex-1 justify-center text-xs" onClick={() => open(p)}>
                    <Pencil size={13} /> Tahrir
                  </button>
                  <button className="btn-danger text-xs" onClick={() => setConfirm(p)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        size="xl"
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditing(null)}>Bekor</button>
            <button className="btn-gold" onClick={save}>Saqlash</button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nom (uz) *</label>
                <input
                  className="input"
                  value={editing.name_uz ?? ''}
                  onChange={(e) => setEditing({ ...editing, name_uz: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Nom (ru) *</label>
                <input
                  className="input"
                  value={editing.name_ru ?? ''}
                  onChange={(e) => setEditing({ ...editing, name_ru: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Kategoriya *</label>
              <select
                className="input"
                value={editing.category_id || 0}
                onChange={(e) => setEditing({ ...editing, category_id: Number(e.target.value) })}
              >
                <option value={0} disabled>Kategoriya tanlang</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_uz}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tavsif (uz)</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={editing.description_uz ?? ''}
                  onChange={(e) => setEditing({ ...editing, description_uz: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Tavsif (ru)</label>
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={editing.description_ru ?? ''}
                  onChange={(e) => setEditing({ ...editing, description_ru: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Narx</label>
                <input
                  className="input"
                  type="number"
                  value={editing.price ?? ''}
                  placeholder="0"
                  onChange={(e) => setEditing({ ...editing, price: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Valyuta</label>
                <input
                  className="input"
                  value={editing.currency ?? "so'm"}
                  onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Miqdor</label>
                <input
                  className="input"
                  type="number"
                  value={editing.quantity ?? ''}
                  placeholder="0"
                  onChange={(e) => setEditing({ ...editing, quantity: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="in-stock"
                type="checkbox"
                checked={!!editing.in_stock}
                onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })}
                className="w-4 h-4 accent-gold"
              />
              <label htmlFor="in-stock" className="text-sm">Mavjud (in stock)</label>
              <div className="flex-1" />
              <label className="text-xs text-sub">Tartib:</label>
              <input
                className="input max-w-[100px]"
                type="number"
                value={editing.position ?? ''}
                placeholder="0"
                onChange={(e) => setEditing({ ...editing, position: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">Rasmlar</label>
                <button
                  type="button"
                  className="btn-outline text-xs"
                  onClick={() => setEditing({ ...editing, images: [...(editing.images ?? []), ''] })}
                >
                  <Plus size={13} /> Qo'shish
                </button>
              </div>
              <div className="space-y-3">
                {(editing.images ?? []).map((url, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-1">
                      <ImageUpload
                        label={`Rasm ${i + 1}`}
                        value={url}
                        onChange={(v) => {
                          const next = [...(editing.images ?? [])];
                          next[i] = v;
                          setEditing({ ...editing, images: next });
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...(editing.images ?? [])];
                        next.splice(i, 1);
                        setEditing({ ...editing, images: next.length ? next : [''] });
                      }}
                      className="btn-danger text-xs mt-7"
                      disabled={(editing.images ?? []).length <= 1}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">O'lchamlar / Variantlar</label>
                <button
                  type="button"
                  className="btn-outline text-xs"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      sizes: [...(editing.sizes ?? []), { name: '', price: 0 }],
                    })
                  }
                >
                  <Plus size={13} /> Qo'shish
                </button>
              </div>
              {(editing.sizes ?? []).length === 0 ? (
                <div className="text-xs text-sub bg-panel rounded-lg p-3 border border-border">
                  O'lcham/variantlar yo'q. Asosiy narx ishlatiladi.
                </div>
              ) : (
                <div className="space-y-2">
                  {(editing.sizes ?? []).map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className="input flex-1"
                        placeholder="Nom (M, L, ...)"
                        value={s.name}
                        onChange={(e) => {
                          const next = [...(editing.sizes ?? [])];
                          next[i] = { ...next[i], name: e.target.value };
                          setEditing({ ...editing, sizes: next });
                        }}
                      />
                      <input
                        className="input flex-1"
                        type="number"
                        placeholder="Narx"
                        value={s.price || ''}
                        onChange={(e) => {
                          const next = [...(editing.sizes ?? [])];
                          next[i] = { ...next[i], price: e.target.value === '' ? 0 : Number(e.target.value) };
                          setEditing({ ...editing, sizes: next });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...(editing.sizes ?? [])];
                          next.splice(i, 1);
                          setEditing({ ...editing, sizes: next });
                        }}
                        className="btn-danger text-xs"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Mahsulotni o'chirish"
        message={`"${confirm?.name_uz || confirm?.name}" mahsuloti o'chiriladi.`}
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
