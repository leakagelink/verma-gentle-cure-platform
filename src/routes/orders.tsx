import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/ui-kit/PageHero";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  formatOrderDate,
  type OrderItemRow,
  type OrderRow,
} from "@/lib/products";
import { formatINR } from "@/lib/shop-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | Verma Gentle Cure" },
      {
        name: "description",
        content: "Track your homeopathic medicine orders, delivery status and payment status.",
      },
      { property: "og:title", content: "My Orders | Verma Gentle Cure" },
      { property: "og:description", content: "Track your medicine orders and deliveries." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/orders" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/orders" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemRow[]>>({});
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      setBusy(true);
      const { data: orderRows } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
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
  }, [user]);

  return (
    <>
      <PageHero
        eyebrow="My orders"
        title="Order history & delivery status"
        description="Every medicine order placed from your account, with its current delivery and payment status."
      />
      <section className="container-page py-6 sm:py-12">
        {busy ? (
          <p className="text-sm text-muted-foreground">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <Package className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-semibold text-navy">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the shop and your orders will appear here.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/medicines">Browse medicines</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="card-premium p-4 sm:p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl text-navy">{order.order_no}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Placed on {formatOrderDate(order.created_at)} ·{" "}
                      {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method} · Payment{" "}
                      {order.payment_status}
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

                <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                  {(itemsByOrder[order.id] ?? []).map((item) => (
                    <li key={item.id} className="flex justify-between gap-4">
                      <span className="min-w-0 text-muted-foreground">
                        {item.name} {item.pack ? `(${item.pack})` : ""} × {item.qty}
                      </span>
                      <span className="font-medium text-navy">{formatINR(item.line_total)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-4 grid gap-2 border-t border-border pt-4 text-sm sm:grid-cols-4">
                  <Cell k="Subtotal" v={formatINR(order.subtotal)} />
                  <Cell k="Discount" v={order.discount ? `− ${formatINR(order.discount)}` : "—"} />
                  <Cell k="Delivery" v={order.delivery_fee ? formatINR(order.delivery_fee) : "Free"} />
                  <Cell k="Total" v={formatINR(order.total)} />
                </dl>

                <p className="mt-4 text-xs text-muted-foreground">
                  Deliver to: {order.customer_name}, {order.address}, {order.city}, {order.state} —{" "}
                  {order.pincode} · {order.phone}
                </p>
                {order.tracking_note && (
                  <p className="mt-3 rounded-2xl border border-border surface-ivory p-4 text-sm text-navy">
                    {order.tracking_note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        <p className="mt-10 rounded-2xl border border-border surface-ivory p-5 text-xs leading-relaxed text-muted-foreground">
          Orders are private to your account. Medicines should be taken only as advised by a
          qualified homeopathic practitioner.
        </p>
      </section>
    </>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{k}</dt>
      <dd className="font-medium text-navy">{v}</dd>
    </div>
  );
}
