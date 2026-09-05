import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  formatOrderDate,
  useStoreSettings,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
} from "@/lib/products";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Store Admin | Verma Gentle Cure" },
      {
        name: "description",
        content: "Manage medicine orders, delivery status and payment options for the clinic store.",
      },
      { property: "og:title", content: "Store Admin | Verma Gentle Cure" },
      { property: "og:description", content: "Order management and store settings." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/admin" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

const PAYMENT_STATES = ["pending", "paid", "refunded", "failed"] as const;

function AdminPage() {
  const { user, loading, isCareTeam, role } = useAuth();
  const navigate = useNavigate();
  const { settings } = useStoreSettings();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemRow[]>>({});
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [busy, setBusy] = useState(true);
  const [config, setConfig] = useState(settings);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => setConfig(settings), [settings]);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user || !isCareTeam) return;
    let active = true;
    void (async () => {
      setBusy(true);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      const list = orderRows ?? [];
      const { data: itemRows } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", list.length > 0 ? list.map((o) => o.id) : ["00000000-0000-0000-0000-000000000000"]);
      if (!active) return;
      const grouped: Record<string, OrderItemRow[]> = {};
      for (const item of itemRows ?? []) {
        (grouped[item.order_id] ??= []).push(item);
      }
      setOrders(list);
      setItemsByOrder(grouped);
      setBusy(false);
    })();
    return () => {
      active = false;
    };
  }, [user, isCareTeam]);

  async function updateOrder(id: string, patch: Partial<OrderRow>) {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) {
      toast.error("Could not update this order.");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    toast.success("Order updated");
  }

  async function saveConfig() {
    setSavingConfig(true);
    const { error } = await supabase
      .from("store_settings")
      .update({
        cod_enabled: config.cod_enabled,
        online_payment_enabled: config.online_payment_enabled,
        upi_enabled: config.upi_enabled,
        delivery_fee: config.delivery_fee,
        free_delivery_over: config.free_delivery_over,
        cod_min_order: config.cod_min_order,
        cod_max_order: config.cod_max_order,
      })
      .eq("id", "default");
    setSavingConfig(false);
    if (error) {
      toast.error("Only an admin account can change store settings.");
      return;
    }
    toast.success("Store settings saved");
  }

  if (loading) {
    return <p className="container-page py-20 text-sm text-muted-foreground">Loading…</p>;
  }

  if (user && !isCareTeam) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-2xl text-navy">This area is for the clinic team</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account role is {role ?? "patient"}. Visit your orders instead.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/orders">My orders</Link>
        </Button>
      </section>
    );
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <PageHero
        eyebrow="Store admin"
        title="Orders & store settings"
        description="Update delivery progress, payment status and the payment options offered at checkout."
      />
      <section className="container-page space-y-10 py-12">
        <div className="card-premium p-6">
          <h2 className="text-lg text-navy">Payment & delivery options</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These controls decide what customers can choose at checkout. Only admin accounts can save
            changes.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Toggle
              label="Cash on delivery"
              checked={config.cod_enabled}
              onChange={(v) => setConfig({ ...config, cod_enabled: v })}
            />
            <Toggle
              label="Online payment"
              checked={config.online_payment_enabled}
              onChange={(v) => setConfig({ ...config, online_payment_enabled: v })}
            />
            <Toggle
              label="UPI"
              checked={config.upi_enabled}
              onChange={(v) => setConfig({ ...config, upi_enabled: v })}
            />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <NumberField
              label="Delivery fee (₹)"
              value={config.delivery_fee}
              onChange={(v) => setConfig({ ...config, delivery_fee: v })}
            />
            <NumberField
              label="Free delivery over (₹)"
              value={config.free_delivery_over}
              onChange={(v) => setConfig({ ...config, free_delivery_over: v })}
            />
            <NumberField
              label="COD minimum (₹)"
              value={config.cod_min_order}
              onChange={(v) => setConfig({ ...config, cod_min_order: v })}
            />
            <NumberField
              label="COD maximum (₹)"
              value={config.cod_max_order}
              onChange={(v) => setConfig({ ...config, cod_max_order: v })}
            />
          </div>
          <Button
            className="mt-6 rounded-full"
            disabled={savingConfig}
            onClick={() => void saveConfig()}
          >
            {savingConfig ? "Saving…" : "Save settings"}
          </Button>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {(["all", ...ORDER_STATUS_FLOW] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "min-h-9 rounded-full border px-4 text-sm transition-colors",
                  filter === key ? "border-leaf bg-mint text-forest" : "border-border text-muted-foreground",
                )}
              >
                {key === "all" ? "All orders" : ORDER_STATUS_LABEL[key]}
              </button>
            ))}
          </div>

          {busy ? (
            <p className="mt-8 text-sm text-muted-foreground">Loading orders…</p>
          ) : visible.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center">
              <p className="font-semibold text-navy">No orders in this view</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {visible.map((order) => (
                <article key={order.id} className="card-premium p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl text-navy">{order.order_no}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatOrderDate(order.created_at)} · {order.customer_name} · {order.phone}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        ORDER_STATUS_CLASS[order.status],
                      )}
                    >
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                    {(itemsByOrder[order.id] ?? []).map((item) => (
                      <li key={item.id} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          {item.name} × {item.qty}
                        </span>
                        <span className="text-navy">{formatINR(item.line_total)}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-4 text-xs text-muted-foreground">
                    {order.address}, {order.city}, {order.state} — {order.pincode} ·{" "}
                    {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method} ·{" "}
                    {formatINR(order.total)}
                    {order.coupon ? ` · Coupon ${order.coupon}` : ""}
                  </p>
                  {order.notes && (
                    <p className="mt-2 text-xs text-muted-foreground">Notes: {order.notes}</p>
                  )}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-navy">Order status</Label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          void updateOrder(order.id, { status: e.target.value as OrderStatus })
                        }
                        className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
                      >
                        {ORDER_STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-navy">Payment status</Label>
                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          void updateOrder(order.id, {
                            payment_status: e.target.value as OrderRow["payment_status"],
                          })
                        }
                        className="min-h-10 w-full rounded-full border border-border bg-card px-4 text-sm text-navy"
                      >
                        {PAYMENT_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <TrackingNote
                    initial={order.tracking_note ?? ""}
                    onSave={(note) => void updateOrder(order.id, { tracking_note: note || null })}
                  />
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function TrackingNote({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (note: string) => void;
}) {
  const [note, setNote] = useState(initial);
  return (
    <div className="mt-4 space-y-1.5">
      <Label className="text-sm text-navy">Update for the customer</Label>
      <Textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Dispatched via courier, expected in 3 days…"
      />
      <Button variant="outline" className="rounded-full" onClick={() => onSave(note.trim())}>
        Save update
      </Button>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border p-4 text-sm text-navy">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--leaf)]"
      />
      {label}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-navy">{label}</Label>
      <Input
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
      />
    </div>
  );
}
