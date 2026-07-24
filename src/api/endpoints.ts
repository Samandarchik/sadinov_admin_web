import { http, API_BASE } from './client';
import type {
  Banner,
  Category,
  Order,
  OrderStatus,
  Product,
  PromoCode,
  Service,
  Stats,
  User,
} from '../types';

// --- Auth ---
export async function login(username: string, password: string): Promise<string> {
  const r = await http.post('/admin/login/', { username, password });
  return r.data.token as string;
}
export async function logout(): Promise<void> {
  try {
    await http.post('/admin/logout/');
  } catch {}
}
export async function me(): Promise<any> {
  const r = await http.get('/admin/me/');
  return r.data;
}

// --- Stats ---
export async function getStats(): Promise<Stats> {
  const r = await http.get('/admin/stats/');
  return r.data;
}

// --- Orders ---
export async function listOrders(): Promise<Order[]> {
  const r = await http.get('/admin/orders/');
  return (r.data as any[]).map((o) => ({
    ...o,
    order_id: o.order_id ?? o.id,
    total: o.total ?? o.price,
    currency: o.currency ?? "so'm",
    items: (o.items ?? []).map((it: any) => ({
      ...it,
      price: it.price ?? it.unit_price,
    })),
    service_ids: o.service_ids ?? [],
  }));
}
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await http.patch(`/admin/orders/${orderId}/status/`, { status });
}
export async function deleteOrder(orderId: string): Promise<void> {
  await http.delete(`/admin/orders/${orderId}/`);
}

// --- Users ---
export async function listUsers(): Promise<User[]> {
  const r = await http.get('/admin/users/');
  return r.data;
}
export async function deleteUser(id: number): Promise<void> {
  await http.delete(`/admin/users/${id}/`);
}

// --- Banners ---
export async function listBanners(): Promise<Banner[]> {
  const r = await http.get('/banners/');
  return r.data;
}
export async function createBanner(data: Partial<Banner>): Promise<Banner> {
  const r = await http.post('/banners/', data);
  return r.data;
}
export async function updateBanner(id: number, data: Partial<Banner>): Promise<Banner> {
  const r = await http.put(`/banners/${id}`, data);
  return r.data;
}
export async function deleteBanner(id: number): Promise<void> {
  await http.delete(`/banners/${id}`);
}

// --- Categories ---
export async function listCategories(): Promise<Category[]> {
  const r = await http.get('/categories/');
  return r.data;
}
export async function createCategory(data: Partial<Category>): Promise<Category> {
  const r = await http.post('/categories/', data);
  return r.data;
}
export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const r = await http.put(`/categories/${id}`, data);
  return r.data;
}
export async function deleteCategory(id: number): Promise<void> {
  await http.delete(`/categories/${id}`);
}

// --- Products ---
export async function listProducts(): Promise<Product[]> {
  const r = await http.get('/products/');
  return r.data;
}
export async function createProduct(data: Partial<Product>): Promise<Product> {
  const r = await http.post('/products/', data);
  return r.data;
}
export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const r = await http.put(`/products/${id}`, data);
  return r.data;
}
export async function deleteProduct(id: number): Promise<void> {
  await http.delete(`/products/${id}`);
}

// --- Services ---
export async function listServices(): Promise<Service[]> {
  const r = await http.get('/services/');
  return r.data;
}
export async function createService(data: Partial<Service>): Promise<Service> {
  const r = await http.post('/services/', data);
  return r.data;
}
export async function updateService(id: number, data: Partial<Service>): Promise<Service> {
  const r = await http.put(`/services/${id}`, data);
  return r.data;
}
export async function deleteService(id: number): Promise<void> {
  await http.delete(`/services/${id}`);
}

// --- Promo codes ---
export async function listPromoCodes(): Promise<PromoCode[]> {
  const r = await http.get('/admin/promo-codes/');
  return r.data;
}
export async function createPromoCode(data: Partial<PromoCode>): Promise<PromoCode> {
  const r = await http.post('/admin/promo-codes/', data);
  return r.data;
}
export async function updatePromoCode(id: number, data: Partial<PromoCode>): Promise<PromoCode> {
  const r = await http.put(`/admin/promo-codes/${id}`, data);
  return r.data;
}
export async function deletePromoCode(id: number): Promise<void> {
  await http.delete(`/admin/promo-codes/${id}`);
}

// --- Uploads ---
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const r = await http.post('/uploads/image/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url: string = r.data.url;
  // Server returns relative; we keep relative in DB and resolve on render.
  if (/^https?:\/\//i.test(url)) return url;
  return API_BASE + url;
}
