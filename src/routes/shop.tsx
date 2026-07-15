import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { getProducts, getProductCategories, type Product } from "@/lib/data";
import { RegistrantForm } from "@/components/registrant-form";
import { SuccessCard } from "@/components/success-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — FIDE Trainer Network" },
      { name: "description", content: "Chess sets, boards, pieces, and accessories for trainers and players." },
    ],
  }),
  component: ShopPage,
});

function QuantitySelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onChange(Math.max(1, value - 1))}><Minus className="h-3 w-3" /></Button>
      <Input value={value} readOnly className="h-8 w-12 border-0 bg-transparent text-center" />
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onChange(value + 1)}><Plus className="h-3 w-3" /></Button>
    </div>
  );
}

function ShopPage() {
  const { t } = useTranslation();
  const products = getProducts(t);
  const productCategories = getProductCategories(t);
  const [category, setCategory] = useState<string>("all");
  const [buying, setBuying] = useState<{ product: Product; qty: number } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<null | { number: string; product: Product; qty: number; method: string; total: number }>(null);

  const filtered = useMemo(
    () => products.filter((p) => category === "all" || p.categoryKey === category),
    [category, products],
  );

  const getQty = (id: string) => quantities[id] ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-display text-4xl font-bold sm:text-5xl">{t("shop.title")}</h1>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader><CardTitle className="text-sm">{t("shop.categoriesLabel")}</CardTitle></CardHeader>
            <CardContent className="grid gap-1 p-2">
              <button onClick={() => setCategory("all")} className={cn("rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent", category === "all" && "bg-primary text-primary-foreground hover:bg-primary")}>{t("shop.allProducts")}</button>
              {productCategories.map((c) => (
                <button key={c.key} onClick={() => setCategory(c.key)} className={cn("rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent", category === c.key && "bg-primary text-primary-foreground hover:bg-primary")}>{c.label}</button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const qty = getQty(p.id);
            return (
              <Card key={p.id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="chessboard-bg grid h-40 place-items-center bg-muted/40">
                  <div className="text-6xl">{p.emoji}</div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">{p.name}</h3>
                    <div className="font-display text-xl font-bold text-primary">${p.price}</div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.category}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <QuantitySelector value={qty} onChange={(n) => setQuantities((q) => ({ ...q, [p.id]: n }))} />
                    <Button size="sm" variant="hero" onClick={() => setBuying({ product: p, qty })}>{t("shop.buy")}</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!buying} onOpenChange={(o) => !o && setBuying(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("shop.purchase")} — {buying?.product.name}</DialogTitle>
            <DialogDescription>{t("shop.qtyLabel")} {buying?.qty} • {t("shop.totalLabel")} ${(buying ? buying.product.price * buying.qty : 0).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {buying && (
            <RegistrantForm
              submitLabel={t("shop.confirmOrder")}
              onSubmit={async (v) => {
                const total = buying.product.price * buying.qty;
                setOrder({ number: `ORD-${Date.now().toString().slice(-8)}`, product: buying.product, qty: buying.qty, method: v.paymentMethod, total });
                setBuying(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!order} onOpenChange={(o) => !o && setOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="sr-only">{t("shop.orderConfirmed")}</DialogTitle></DialogHeader>
          {order && (
            <SuccessCard
              title={t("shop.orderConfirmed")}
              rows={[
                { label: t("shop.orderNumber"), value: order.number },
                { label: t("shop.product"), value: order.product.name },
                { label: t("shop.quantity"), value: order.qty },
                { label: t("shop.totalPrice"), value: `$${order.total.toLocaleString()}` },
                { label: t("shop.paymentMethod"), value: order.method },
                { label: t("shop.deliveryStatus"), value: t("shop.processing") },
                { label: t("shop.orderDate"), value: new Date().toLocaleDateString() },
              ]}
              footer={t("shop.orderFooter")}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
