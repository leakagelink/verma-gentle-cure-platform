import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MEDICINES, type Medicine } from "@/lib/shop-data";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentMethod = "online" | "upi" | "cod";

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: "default",
  cod_enabled: true,
  online_payment_enabled: false,
  upi_enabled: false,
  delivery_fee: 49,
  free_delivery_over: 799,
  cod_min_order: 0,
  cod_max_order: 10000,
  updated_at: new Date().toISOString(),
};

export function toMedicine(row: ProductRow): Medicine {
  return {
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    mrp: row.mrp,
    rating: Number(row.rating),
    reviews: row.reviews,
    stock: row.stock,
    pack: row.pack,
    description: row.description,
    ingredients: row.ingredients,
    usage: row.usage_instructions,
  };
}

async function fetchProducts(): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toMedicine);
}

/** Live catalogue from the database, falling back to the bundled list while loading. */
export function useProducts() {
  const query = useQuery({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 60_000 });
  return {
    products: query.data ?? MEDICINES,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function useProduct(slug: string) {
  const { products, isLoading, isError } = useProducts();
  return { product: products.find((p) => p.slug === slug) ?? null, isLoading, isError };
}

async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return data ?? DEFAULT_STORE_SETTINGS;
}

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ["store-settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });
  return { settings: query.data ?? DEFAULT_STORE_SETTINGS, isLoading: query.isLoading };
}

export const COUPON_STORAGE_KEY = "vgc.coupon.v1";

export const COUPONS: Record<string, number> = { GENTLE10: 0.1, WELCOME5: 0.05 };

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  placed: "bg-mint text-forest",
  confirmed: "bg-mint text-forest",
  packed: "bg-[color-mix(in_oklab,var(--lime)_28%,white)] text-forest",
  shipped: "bg-[color-mix(in_oklab,var(--teal)_18%,white)] text-teal",
  delivered: "bg-[color-mix(in_oklab,var(--forest)_18%,white)] text-forest",
  cancelled: "bg-destructive/10 text-destructive",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  online: "Online payment",
  upi: "UPI",
  cod: "Cash on delivery",
};

export function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
