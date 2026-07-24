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
  /** Aksiya: eski (chizib tashlanadigan) narx. price — hozirgi/aksiya narxi. */
  old_price?: number | null;
  /** Serverda hisoblanadi; aksiya bo'lmasa null. */
  discount_percent?: number | null;
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
  /** Banner bosilganda ochiladigan mahsulot (ixtiyoriy). */
  product_id?: number | null;
  /** Banner ustida "AKSIYA" belgisi ko'rsatiladimi. */
  is_sale?: boolean;
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
  /** Qo'llanilgan promo kod chegirmasi (so'm); yo'q bo'lsa 0. */
  discount?: number;
  /** Qo'llanilgan promo kod matni. */
  promo_code?: string | null;
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

export type DiscountType = 'percent' | 'fixed';

export interface PromoCode {
  id: number;
  code: string;
  /** 'percent' — foizli chegirma; 'fixed' — qat'iy summa (so'm). */
  discount_type: DiscountType;
  /** percent uchun 1..100, fixed uchun so'm miqdori. */
  discount_value: number;
  /** Chegirma qo'llanishi uchun minimal buyurtma summasi. */
  min_order: number;
  /** Foizli chegirma uchun eng ko'p chegirma (so'm); yo'q bo'lsa null. */
  max_discount?: number | null;
  /** Umumiy foydalanish limiti; null — cheksiz. */
  usage_limit?: number | null;
  used_count: number;
  active: boolean;
  /** Amal qilish muddati (ISO sana); null — muddatsiz. */
  expires_at?: string | null;
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
