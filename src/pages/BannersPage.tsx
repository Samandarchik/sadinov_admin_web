import { useEffect, useState } from 'react';
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import {
  createBanner,
  deleteBanner,
  listBanners,
  listProducts,
  updateBanner,
} from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import type { Banner, Product } from '../types';

export function BannersPage() {
  const [items, setItems] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [confirm, setConfirm] = useState<Banner | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([listBanners(), listProducts()]);
      setItems(b);
      setProducts(p);
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
    if (!editing.image_uz || !editing.image_ru) {
      toast.error('UZ va RU rasmlarini kiriting');
      return;
    }
    try {
      const data = {
        image_uz: editing.image_uz,
        image_ru: editing.image_ru,
        position: editing.position ?? 0,
        product_id: editing.product_id || null,
      };
      if (editing.id) await updateBanner(editing.id, data);
      else await createBanner(data);
      toast.success('Saqlandi');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(b: Banner) {
    try {
      await deleteBanner(b.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <Topbar
        icon={<LayoutGrid size={20} className="text-gold" />}
        title="Bannerlar"
        right={
          <button className="btn-gold" onClick={() => setEditing({ position: 0 })}>
            <Plus size={16} /> Yangi banner
          </button>
        }
      />
      <div className="p-4 lg:p-8">
        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<LayoutGrid size={36} />}
            title="Bannerlar yo'q"
            description="Birinchi bannerni qo'shing"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="aspect-video rounded-lg bg-panel overflow-hidden">
                    {b.image_uz && (
                      <img src={absUrl(b.image_uz)} alt="uz" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="aspect-video rounded-lg bg-panel overflow-hidden">
                    {b.image_ru && (
                      <img src={absUrl(b.image_ru)} alt="ru" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-sub">
                    <div>Tartib: {b.position}</div>
                    <div className="mt-0.5">
                      {b.product_id ? (
                        <>
                          Mahsulot:{' '}
                          <span className="text-gold">
                            {products.find((p) => p.id === b.product_id)?.name_uz ??
                              products.find((p) => p.id === b.product_id)?.name ??
                              `#${b.product_id}`}
                          </span>
                        </>
                      ) : (
                        'Mahsulot biriktirilmagan'
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline text-xs" onClick={() => setEditing(b)}>
                      <Pencil size={13} /> Tahrir
                    </button>
                    <button className="btn-danger text-xs" onClick={() => setConfirm(b)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Bannerni tahrirlash' : 'Yangi banner'}
        size="lg"
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
              <ImageUpload
                label="UZ versiya *"
                value={editing.image_uz ?? ''}
                onChange={(v) => setEditing({ ...editing, image_uz: v })}
              />
              <ImageUpload
                label="RU versiya *"
                value={editing.image_ru ?? ''}
                onChange={(v) => setEditing({ ...editing, image_ru: v })}
              />
            </div>
            <div>
              <label className="label">Mahsulot (banner bosilganda ochiladi)</label>
              <select
                className="input"
                value={editing.product_id ?? 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    product_id: Number(e.target.value) || null,
                  })
                }
              >
                <option value={0}>Yo'q (banner bosilmaydi)</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} — {p.name_uz || p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tartib</label>
              <input
                className="input"
                type="number"
                value={editing.position ?? 0}
                onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Bannerni o'chirish"
        message="Banner butunlay o'chiriladi. Davom etamizmi?"
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
