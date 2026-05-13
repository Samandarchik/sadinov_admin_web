export interface Category {
  id: number;
  name_uz: string;
  name_ru: string;
  image: string | null;
  position: number;
}

export interface Product {
  id: number;
  name: string;
  name_uz?: string;
  name_ru?: string;
  description?: string;
  description_uz?: string;
  description_ru?: string;
  price: number;
  currency: string;
  images: string[];
  sizes: Array<{ name: string; price: number }>;
  category_id: number;
  category_name: string;
  position: number;
  in_stock: boolean;
  quantity: number;
}

export interface Banner {
  id: number;
  image_uz: string;
  image_ru: string;
  position: number;
}

export interface Service {
  id: number;
  name: string;
  name_uz?: string;
  name_ru?: string;
  description?: string;
  description_uz?: string;
  description_ru?: string;
  image?: string;
  price: number;
  time?: string;
  time_uz?: string;
  time_ru?: string;
  possibilities?: string[];
  possibilities_uz?: string[];
  possibilities_ru?: string[];
}

export interface OrderItem {
  product_id?: number;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  order_id: string;
  user_id?: number;
  user_name?: string;
  user_phone?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  comment?: string;
  items: OrderItem[];
  service_ids?: number[];
  total: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: number;
  phone: string;
  name?: string;
  created_at?: string;
}

export interface Stats {
  total_orders?: number;
  total_users?: number;
  total_products?: number;
  total_revenue?: number;
  pending_orders?: number;
  [k: string]: number | undefined;
}
