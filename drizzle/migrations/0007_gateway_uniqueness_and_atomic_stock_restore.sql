CREATE UNIQUE INDEX payments_unique_gateway_payment ON public.payments(gateway_payment_id) WHERE gateway='razorpay' AND gateway_payment_id IS NOT NULL;
CREATE UNIQUE INDEX payments_unique_gateway_order ON public.payments(gateway_order_id) WHERE gateway='razorpay' AND gateway_order_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.restore_cancelled_stock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NEW.status='cancelled' AND OLD.status<>'cancelled' THEN
  UPDATE public.products p SET stock=p.stock+i.qty FROM (SELECT product_id,sum(qty)::integer qty FROM public.order_items WHERE order_id=NEW.id GROUP BY product_id) i WHERE p.id=i.product_id;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.restore_cancelled_stock() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER cancelled_order_stock AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.restore_cancelled_stock();