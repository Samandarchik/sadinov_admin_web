import axios, { AxiosError } from 'axios';

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string) || '';

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 30_000,
});

http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      if (!location.pathname.endsWith('/login')) {
        location.href = (import.meta.env.VITE_BASE_HREF || '/') + 'login';
      }
    }
    return Promise.reject(err);
  },
);

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    // DRF ValidationError string bilan chaqirilsa top-level massiv qaytadi.
    if (Array.isArray(d)) {
      const msgs = d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(', ');
      if (msgs) return msgs;
    }
    if (d && typeof d === 'object') {
      if (typeof (d as any).detail === 'string') return (d as any).detail;
      if (Array.isArray((d as any).detail)) {
        const msgs = (d as any).detail
          .map((x: any) => x?.msg || JSON.stringify(x))
          .join(', ');
        if (msgs) return msgs;
      }
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

// Resolve relative API paths (e.g. /static/uploads/xxx.jpg) to absolute URL.
export function absUrl(u?: string | null): string {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return API_BASE + u;
  return u;
}
