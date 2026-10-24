import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const orderSchema = z.object({
 customer_name: z.string().trim().min(3).max(120), phone: z.string().regex(/^[6-9]\d{9}$/), email: z.string().email().max(254),
 address: z.string().trim().min(8).max(1000), city: z.string().trim().min(1).max(120), state: z.string().trim().min(1).max(120),
 pincode: z.string().regex(/^\d{6}$/), payment_method: z.enum(["online", "upi", "cod"]), coupon: z.string().max(30).nullable(), notes: z.string().max(1000),
 items: z.array(z.object({ slug: z.string().min(1).max(100), qty: z.number().int().min(1).max(20) })).min(1).max(8),
});
const resultSchema = z.object({ id: z.string().uuid(), order_no: z.string(), total: z.number().int().positive() });
export const createOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
 .inputValidator((input: unknown) => orderSchema.parse(input)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc("create_trusted_order", { payload: data });
  if (result.error) throw new Error("Could not place the order. Check product availability and delivery details.");
  return resultSchema.parse(result.data);
 });
