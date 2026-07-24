import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  MapPin,
  Navigation,
  Package,
  Phone,
  Share2,
  Wrench,
  ShoppingBag,
  Ticket,
  Trash2,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Topbar } from '../components/Topbar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageSpinner } from '../components/Spinner';
import {
  deleteOrder,
  listOrders,
  listServices,
  updateOrderStatus,
} from '../api/endpoints';
import { absUrl, errorMessage } from '../api/client';
import { formatDate, formatPrice, STATUS_COLOR, STATUS_LABEL } from '../lib/format';
import type { Order, OrderStatus, Service } from '../types';

const STATUS_STEPS: Array<{ status: OrderStatus; label: string; icon: LucideIcon }> = [
  { status: 'pending', label: 'Kutilmoqda', icon: ClipboardList },
  { status: 'confirmed', label: 'Tasdiqlangan', icon: Check },
  { status: 'in_progress', label: 'Yetkazilmoqda', icon: Truck },
  { status: 'delivered', label: 'Yetkazilgan', icon: CheckCircle2 },
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [all, svcs] = await Promise.all([listOrders(), listServices()]);
      const o = all.find((x) => String(x.id) === String(id) || x.order_id === id);
      if (!o) {
        toast.error('Buyurtma topilmadi');
        nav('/orders');
        return;
      }
      setOrder(o);
      setServices(svcs);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);

  async function changeStatus(s: OrderStatus) {
    if (!order || busy || order.status === s) return;
    setBusy(true);
    try {
      await updateOrderStatus(order.order_id, s);
      setOrder({ ...order, status: s });
      toast.success(`Status: ${STATUS_LABEL[s]}`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!order) return;
    try {
      await deleteOrder(order.order_id);
      toast.success("Buyurtma o'chirildi");
      nav('/orders');
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const mapEmbed = useMemo(() => {
    if (!order) return null;
    const hasCoord = order.latitude != null && order.longitude != null;
    if (hasCoord) {
      const q = `${order.latitude},${order.longitude}`;
      return {
        embed: `https://maps.google.com/maps?q=${q}&hl=uz&z=15&output=embed`,
        open: `https://www.google.com/maps?q=${q}`,
        nav: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      };
    }
    if (order.address) {
      const q = encodeURIComponent(order.address);
      return {
        embed: `https://maps.google.com/maps?q=${q}&hl=uz&z=14&output=embed`,
        open: `https://www.google.com/maps?q=${q}`,
        nav: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      };
    }
    return null;
  }, [order]);

  if (loading) {
    return (
      <>
        <Topbar
          icon={<ShoppingBag size={20} className="text-gold" />}
          title="Buyurtma tafsiloti"
        />
        <PageSpinner />
      </>
    );
  }
  if (!order) return null;

  const statusColor = STATUS_COLOR[order.status] || '';
  const orderedServices = (order.service_ids ?? [])
    .map((sid) => services.find((s) => s.id === sid))
    .filter((s): s is Service => Boolean(s));
  const missingServiceIds = (order.service_ids ?? []).filter(
    (sid) => !services.some((s) => s.id === sid),
  );

  return (
    <>
      <Topbar
        icon={<ShoppingBag size={20} className="text-gold" />}
        title="Buyurtma tafsiloti"
        right={
          <Link to="/orders" className="chip bg-gold/10 text-gold border border-gold/30 py-1.5">
            <Bell size={13} /> Buyurtmalar
          </Link>
        }
      />

      <div className="p-4 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold font-mono break-all">
              Buyurtma #{order.order_id}
            </h2>
            <div className="text-sm text-sub">{formatDate(order.created_at)}</div>
          </div>
          <div className="flex gap-2">
            <Link to="/orders" className="btn-outline">
              <ArrowLeft size={15} /> Ro'yxat
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-gold" size={18} />
              <h3 className="font-semibold">Mijoz ma'lumotlari</h3>
            </div>
            <div className="divide-y divide-border">
              <Row label="Ism" value={order.user_name || '—'} />
              <Row
                label="Telefon"
                value={
                  order.user_phone ? (
                    <a
                      href={`tel:${order.user_phone}`}
                      className="text-blue-400 hover:underline"
                    >
                      {order.user_phone}
                    </a>
                  ) : '—'
                }
              />
              <Row label="Manzil" value={order.address || '—'} />
              {order.comment && <Row label="Izoh" value={order.comment} />}
              <Row
                label="Jami summa"
                value={
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(order.total, order.currency)}
                  </span>
                }
              />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-gold" size={18} />
                <h3 className="font-semibold">Status boshqaruvi</h3>
              </div>
              <span className={`chip border ${statusColor} uppercase font-semibold tracking-wider`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            <div className="text-sm text-sub mb-3">Statusni o'zgartirish uchun bosing:</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {STATUS_STEPS.map(({ status, label, icon: Icon }) => {
                const active = order.status === status;
                return (
                  <button
                    key={status}
                    disabled={busy}
                    onClick={() => changeStatus(status)}
                    className={[
                      'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                      active
                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                        : 'border-border text-white/80 hover:bg-cardHi',
                    ].join(' ')}
                  >
                    <Icon size={15} /> {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => changeStatus('cancelled')}
              disabled={busy || order.status === 'cancelled'}
              className="btn-danger w-full justify-center"
            >
              <XCircle size={15} /> Bekor qilish
            </button>
            <hr className="border-border my-4" />
            <button
              onClick={() => setConfirmDel(true)}
              className="btn-danger w-full justify-center"
            >
              <Trash2 size={15} /> Buyurtmani o'chirish
            </button>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-rose-400" size={18} />
              <h3 className="font-semibold">Mijoz manzili (Xarita)</h3>
            </div>
            <a
              href={mapEmbed?.open ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-sub hover:text-white inline-flex items-center gap-1"
            >
              Google Maps <ExternalLink size={11} />
            </a>
          </div>
          {mapEmbed ? (
            <>
              <div className="relative rounded-xl overflow-hidden border border-border bg-panel">
                <iframe
                  title="map"
                  src={mapEmbed.embed}
                  className="w-full h-[320px] block"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={mapEmbed.open}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium shadow inline-flex items-center gap-1.5"
                >
                  Открыть в Картах <ExternalLink size={11} />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <a
                  href={mapEmbed.nav}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-lg py-3 text-center font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Navigation size={16} /> Boshlash (Navigatsiya)
                </a>
                <button
                  onClick={() => {
                    if (navigator.share && mapEmbed) {
                      navigator
                        .share({
                          title: `Buyurtma #${order.order_id}`,
                          text: order.address,
                          url: mapEmbed.open,
                        })
                        .catch(() => {});
                    } else if (mapEmbed) {
                      navigator.clipboard.writeText(mapEmbed.open);
                      toast.success("Havola nusxalandi");
                    }
                  }}
                  className="bg-cardHi hover:bg-card border border-border rounded-lg py-3 font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Ulashish
                </button>
              </div>
              <div className="text-center text-xs text-sub mt-3 inline-flex items-center justify-center gap-1 w-full">
                <MapPin size={11} className="text-rose-400" /> Manzil: {order.address || '—'}
              </div>
            </>
          ) : (
            <div className="text-sub text-sm py-8 text-center">
              Manzil ma'lumoti yo'q
            </div>
          )}
        </div>

        {order.items.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-pink-400" size={18} />
                <h3 className="font-semibold">Buyurtma mahsulotlari</h3>
              </div>
              <span className="text-xs text-sub">{order.items.length} ta mahsulot</span>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 rounded-lg bg-panel border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {it.image ? (
                      <img src={absUrl(it.image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-muted" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.name}</div>
                    <div className="text-xs text-sub">
                      {formatPrice(it.price, order.currency)} × {it.quantity}
                      {it.size ? ` · ${it.size}` : ''}
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {formatPrice(it.price * it.quantity, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(orderedServices.length > 0 || missingServiceIds.length > 0) && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="text-cyan-400" size={18} />
                <h3 className="font-semibold">Buyurtma xizmatlari</h3>
              </div>
              <span className="text-xs text-sub">
                {(order.service_ids ?? []).length} ta xizmat
              </span>
            </div>
            <div className="divide-y divide-border">
              {orderedServices.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 rounded-lg bg-panel border border-border overflow-hidden flex items-center justify-center shrink-0">
                    {s.image ? (
                      <img src={absUrl(s.image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Wrench className="text-muted" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    {s.time && <div className="text-xs text-sub">{s.time}</div>}
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {formatPrice(s.price, order.currency)}
                  </div>
                </div>
              ))}
              {missingServiceIds.map((sid) => (
                <div key={`missing-${sid}`} className="flex items-center gap-3 py-3">
                  <div className="w-12 h-12 rounded-lg bg-panel border border-border flex items-center justify-center shrink-0">
                    <Wrench className="text-muted" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sub">Xizmat #{sid}</div>
                    <div className="text-xs text-muted">o'chirilgan yoki topilmadi</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-5">
          {order.discount ? (
            <div className="max-w-xs ml-auto space-y-2 mb-3">
              <div className="flex justify-between text-sm text-sub">
                <span>Chegirmagacha</span>
                <span>{formatPrice(order.total + order.discount, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sub inline-flex items-center gap-1.5">
                  <Ticket size={14} className="text-gold" />
                  Promo{order.promo_code ? ` · ${order.promo_code}` : ''}
                </span>
                <span className="text-rose-400 font-medium">
                  −{formatPrice(order.discount, order.currency)}
                </span>
              </div>
            </div>
          ) : null}
          <div className="flex justify-end items-baseline gap-2">
            <span className="text-sub">Jami:</span>
            <span className="text-emerald-400 font-extrabold text-2xl">
              {formatPrice(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Buyurtmani o'chirish"
        message={`#${order.order_id} buyurtmasi butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        danger
        confirmText="O'chirish"
        onConfirm={remove}
        onClose={() => setConfirmDel(false)}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-sub">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
