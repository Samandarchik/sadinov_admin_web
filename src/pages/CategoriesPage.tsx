import { useEffect, useState } from 'react';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import type { Category } from '../types';

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [confirm, setConfirm] = useState<Category | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setItems(await listCategories());
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
    if (!editing.name_uz || !editing.name_ru) {
      toast.error("Nomlarni kiriting (uz & ru)");
      return;
    }
    try {
      const data = {
        name_uz: editing.name_uz,
        name_ru: editing.name_ru,
        image: editing.image || null,
        position: editing.position ?? 0,
      };
      if (editing.id) await updateCategory(editing.id, data);
      else await createCategory(data);
      toast.success('Saqlandi');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(c: Category) {
    try {
      await deleteCategory(c.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <Topbar
        icon={<Layers size={20} className="text-gold" />}
        title="Kategoriyalar"
        right={
          <button className="btn-gold" onClick={() => setEditing({ position: 0 })}>
            <Plus size={16} /> Yangi
          </button>
        }
      />
      <div className="p-4 lg:p-8">
        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Layers size={36} />}
            title="Hozircha kategoriyalar yo'q"
            description="Birinchi kategoriyani qo'shing"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="aspect-video rounded-lg bg-panel overflow-hidden mb-3 flex items-center justify-center">
                  {c.image ? (
                    <img src={absUrl(c.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="text-muted" size={40} />
                  )}
                </div>
                <div className="font-semibold mb-0.5">{c.name_uz}</div>
                <div className="text-xs text-sub mb-3">{c.name_ru}</div>
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 justify-center text-xs" onClick={() => setEditing(c)}>
                    <Pencil size={13} /> Tahrir
                  </button>
                  <button className="btn-danger text-xs" onClick={() => setConfirm(c)}>
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
        title={editing?.id ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        footer={
          <>
            <button className="btn-outline" onClick={() => setEditing(null)}>Bekor</button>
            <button className="btn-gold" onClick={save}>Saqlash</button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
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
            <ImageUpload
              label="Kategoriya rasmi"
              value={editing.image ?? ''}
              onChange={(v) => setEditing({ ...editing, image: v })}
            />
            <div>
              <label className="label">Tartib</label>
              <input
                className="input"
                type="number"
                value={editing.position ?? ''}
                placeholder="0"
                onChange={(e) => setEditing({ ...editing, position: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Kategoriyani o'chirish"
        message={`"${confirm?.name_uz}" kategoriyasi o'chiriladi. Davom etamizmi?`}
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
