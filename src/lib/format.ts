export function formatPrice(v: number | string | undefined, currency = "so'm"): string {
  if (v == null || v === '') return '—';
  const n = typeof v === 'string' ? Number(v) : v;
  if (!Number.isFinite(n)) return String(v);
  const s = new Intl.NumberFormat('en-US').format(Math.round(n)).replaceAll(',', ' ');
  return `${s} ${currency}`;
}

export function formatDate(raw?: string): string {
  if (!raw) return '—';
  try {
    const dt = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return raw;
    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  } catch {
    return raw;
  }
}

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlangan',
  in_progress: 'Yetkazilmoqda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilingan',
};

export const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  in_progress: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
  delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/40',
};
