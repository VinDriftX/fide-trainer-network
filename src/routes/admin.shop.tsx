import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/shop")({
  head: () => ({ meta: [{ title: "Chess Shop — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><ShopAdmin /></AdminGuard>,
});

type Product = {
  id: string; name: string; description: string | null; category: string | null;
  price: number; currency: string | null; image_url: string | null;
  stock: number | null; is_active: boolean | null;
};

const empty = (): Partial<Product> => ({
  name: "", description: "", category: "", price: 0, currency: "USD",
  image_url: "", stock: 0, is_active: true,
});

function ShopAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const payload = {
        name: editing.name!, description: editing.description || null,
        category: editing.category || null, price: Number(editing.price ?? 0),
        currency: editing.currency || "USD", image_url: editing.image_url || null,
        stock: Number(editing.stock ?? 0), is_active: !!editing.is_active,
      };
      if (editing.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Chess Shop</h1>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-1 h-4 w-4" />Add Product</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {data.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex gap-3 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-2xl">♟</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display font-bold">{p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}</div>
                  <div className="font-display font-bold text-primary">{p.currency ?? "USD"} {Number(p.price).toLocaleString()}</div>
                </div>
                <div className="text-sm text-muted-foreground">{p.category ?? "—"} • stock: {p.stock ?? 0}</div>
                {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">No products yet.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name</Label><Input required value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Boards, Pieces..." /></div>
                <div><Label>Currency</Label><Input value={editing.currency ?? "USD"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} /></div>
                <div><Label>Price</Label><Input type="number" step="0.01" required value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label>Image URL</Label><Input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
                <div className="col-span-2"><Label>Description</Label><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
