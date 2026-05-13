import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Wrench, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { Modal } from '../components/Modal';
import { ImageUpload } from '../components/ImageUpload';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { PageSpinner } from '../components/Spinner';
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import { formatPrice } from '../lib/format';
import type { Service } from '../types';

type ServiceDraft = Partial<Service>;

const empty: ServiceDraft = {
  name: '',
  name_uz: '',
  name_ru: '',
  description: '',
  description_uz: '',
  description_ru: '',
  image: '',
  price: 0,
  time: '',
  time_uz: '',
  time_ru: '',
  possibilities: [],
  possibilities_uz: [],
  possibilities_ru: [],
};

export function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceDraft | null>(null);
  const [confirm, setConfirm] = useState<Service | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setItems(await listServices());
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    reload();
  }, []);

  function open(s?: Service) {
    if (s) {
      setEditing({
        ...s,
        possibilities: s.possibilities ? [...s.possibilities] : [],
        possibilities_uz: s.possibilities_uz ? [...s.possibilities_uz] : [],
        possibilities_ru: s.possibilities_ru ? [...s.possibilities_ru] : [],
      });
    } else {
      setEditing({ ...empty });
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name_uz || !editing.name_ru) {
      toast.error('Nomlarni kiriting (uz & ru)');
      return;
    }
    try {
      const data: Partial<Service> = {
        name: (editing.name ?? '').trim() || editing.name_uz,
        name_uz: editing.name_uz,
        name_ru: editing.name_ru,
        description: editing.description ?? '',
        description_uz: editing.description_uz ?? '',
        description_ru: editing.description_ru ?? '',
        image: editing.image?.trim() || undefined,
        price: Number(editing.price) || 0,
        time: editing.time ?? '',
        time_uz: editing.time_uz ?? '',
        time_ru: editing.time_ru ?? '',
        possibilities: (editing.possibilities ?? []).map((s) => s.trim()).filter(Boolean),
        possibilities_uz: (editing.possibilities_uz ?? []).map((s) => s.trim()).filter(Boolean),
        possibilities_ru: (editing.possibilities_ru ?? []).map((s) => s.trim()).filter(Boolean),
      };
      if (editing.id) await updateService(editing.id, data);
      else await createService(data);
      toast.success('Saqlandi');
      setEditing(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(s: Service) {
    try {
      await deleteService(s.id);
      toast.success("O'chirildi");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  function updatePossibility(
    field: 'possibilities' | 'possibilities_uz' | 'possibilities_ru',
    i: number,
    value: string,
  ) {
    if (!editing) return;
    const next = [...(editing[field] ?? [])];
    next[i] = value;
    setEditing({ ...editing, [field]: next });
  }

  function removePossibility(
    field: 'possibilities' | 'possibilities_uz' | 'possibilities_ru',
    i: number,
  ) {
    if (!editing) return;
    const next = [...(editing[field] ?? [])];
    next.splice(i, 1);
    setEditing({ ...editing, [field]: next });
  }

  function addPossibility(
    field: 'possibilities' | 'possibilities_uz' | 'possibilities_ru',
  ) {
    if (!editing) return;
    setEditing({ ...editing, [field]: [...(editing[field] ?? []), ''] });
  }

  function PossibilityList({
    label,
    field,
  }: {
    label: string;
    field: 'possibilities' | 'possibilities_uz' | 'possibilities_ru';
  }) {
    if (!editing) return null;
    const list = editing[field] ?? [];
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label !mb-0">{label}</label>
          <button
            type="button"
            className="btn-outline text-xs"
            onClick={() => addPossibility(field)}
          >
            <Plus size={13} /> Qo'shish
          </button>
        </div>
        {list.length === 0 ? (
          <div className="text-xs text-sub bg-panel rounded-lg p-3 border border-border">
            Bo'sh
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className="input flex-1"
                  value={v}
                  onChange={(e) => updatePossibility(field, i, e.target.value)}
                />
                <button
                  type="button"
                  className="btn-danger text-xs"
                  onClick={() => removePossibility(field, i)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Topbar
        icon={<Wrench size={20} className="text-gold" />}
        title="Servislar"
        right={
          <button className="btn-gold" onClick={() => open()}>
            <Plus size={16} /> Yangi servis
          </button>
        }
      />
      <div className="p-4 lg:p-8">
        {loading ? (
          <PageSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Wrench size={36} />}
            title="Servislar yo'q"
            description="Birinchi servisni qo'shing"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="aspect-video rounded-lg bg-panel overflow-hidden mb-3">
                  {s.image && (
                    <img src={absUrl(s.image)} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="font-semibold mb-0.5">{s.name_uz || s.name}</div>
                <div className="text-xs text-sub mb-2">{s.name_ru}</div>
                {s.price ? (
                  <div className="text-gold font-bold text-sm mb-1">{formatPrice(s.price)}</div>
                ) : null}
                {s.time_uz && (
                  <div className="text-xs text-sub mb-3">⏱ {s.time_uz}</div>
                )}
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 justify-center text-xs" onClick={() => open(s)}>
                    <Pencil size={13} /> Tahrir
                  </button>
                  <button className="btn-danger text-xs" onClick={() => setConfirm(s)}>
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
        title={editing?.id ? 'Servisni tahrirlash' : 'Yangi servis'}
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
            <ImageUpload
              label="Servis rasmi"
              value={editing.image ?? ''}
              onChange={(v) => setEditing({ ...editing, image: v })}
            />
            <div>
              <label className="label">Narx</label>
              <input
                className="input"
                type="number"
                value={editing.price ?? 0}
                onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Vaqt (default)</label>
                <input
                  className="input"
                  placeholder="30 min"
                  value={editing.time ?? ''}
                  onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Vaqt (uz)</label>
                <input
                  className="input"
                  placeholder="30 daqiqa"
                  value={editing.time_uz ?? ''}
                  onChange={(e) => setEditing({ ...editing, time_uz: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Vaqt (ru)</label>
                <input
                  className="input"
                  placeholder="30 минут"
                  value={editing.time_ru ?? ''}
                  onChange={(e) => setEditing({ ...editing, time_ru: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PossibilityList label="Imkoniyatlar (default)" field="possibilities" />
              <PossibilityList label="Imkoniyatlar (uz)" field="possibilities_uz" />
              <PossibilityList label="Imkoniyatlar (ru)" field="possibilities_ru" />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Servisni o'chirish"
        message={`"${confirm?.name_uz || confirm?.name}" servisi o'chiriladi.`}
        danger
        confirmText="O'chirish"
        onConfirm={() => confirm && remove(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
