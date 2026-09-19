import { supabase } from "@/integrations/supabase/client";

export const STORE_NAME = "HIMORA";
export const STORE_TAGLINE = "Crafted for Winter";

export function formatINR(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function discountPercent(mrp: number | null | undefined, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export type Variant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  price_delta: number | string;
  sku: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  sku: string | null;
  price: number | string;
  mrp: number | string | null;
  material: string | null;
  weight: string | null;
  images: string[];
  specs: Record<string, unknown> | null;
  rating: number | string;
  review_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
  product_variants?: Variant[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(onlyActive = true) {
  let q = supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: false });
  if (onlyActive) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Product | null;
}

export async function fetchSettings() {
  const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export function totalStock(p: Product) {
  return (p.product_variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ORDER_STATUSES = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
] as const;
