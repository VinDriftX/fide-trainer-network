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
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Official Partners — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><PartnersAdmin /></AdminGuard>,
});

type Partner = {
  id: string; name: string; country: string | null; title: string | null;
  rating: number | null; bio: string | null; expertise: string[] | null;
  languages: string[] | null; contact_email: string | null; contact_phone: string | null;
  avatar_url: string | null; display_order: number; is_active: boolean;
};

const empty = (): Partial<Partner> => ({
  name: "", country: "", title: "", rating: null, bio: "",
  expertise: [], languages: [], contact_email: "", contact_phone: "",
  avatar_url: "", display_order: 0, is_active: true,
});

function PartnersAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [expertiseText, setExpertiseText] = useState("");
  const [languagesText, setLanguagesText] = useState("");

  const { data = [] } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("official_partners").select("*").order("display_order").order("name");
      if (error) throw error;
      return data as Partner[];
    },
  });

  const openEdit = (p: Partial<Partner>) => {
    setEditing(p);
    setExpertiseText((p.expertise ?? []).join(", "));
    setLanguagesText((p.languages ?? []).join(", "));
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const payload = {
        name: editing.name!, country: editing.country || null, title: editing.title || null,
        rating: editing.rating ? Number(editing.rating) : null, bio: editing.bio || null,
        expertise: expertiseText.split(",").map((s) => s.trim()).filter(Boolean),
        languages: languagesText.split(",").map((s) => s.trim()).filter(Boolean),
        contact_email: editing.contact_email || null, contact_phone: editing.contact_phone || null,
        avatar_url: editing.avatar_url || null,
        display_order: Number(editing.display_order ?? 0),
        is_active: !!editing.is_active,
      };
      if (editing.id) {
        const { error } = await supabase.from("official_partners").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("official_partners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-partners"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("official_partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-partners"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Official Partners</h1>
        <Button onClick={() => openEdit(empty())}><Plus className="mr-1 h-4 w-4" />Add Partner</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {data.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex gap-3 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-lg font-bold">{p.name.slice(0, 2)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold">{p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}</div>
                <div className="text-sm text-muted-foreground">{p.title} • {p.country} • {p.rating ?? "—"}</div>
                {p.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>}
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="text-sm text-muted-foreground">No partners yet.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Partner" : "Add Partner"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input required value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="GM / IM / FT..." /></div>
                <div><Label>Country</Label><Input value={editing.country ?? ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
                <div><Label>Rating</Label><Input type="number" value={editing.rating ?? ""} onChange={(e) => setEditing({ ...editing, rating: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className="col-span-2"><Label>Bio</Label><Textarea rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></div>
                <div className="col-span-2"><Label>Expertise (comma separated)</Label><Input value={expertiseText} onChange={(e) => setExpertiseText(e.target.value)} placeholder="Openings, Endgames" /></div>
                <div className="col-span-2"><Label>Languages (comma separated)</Label><Input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} placeholder="English, Burmese" /></div>
                <div><Label>Contact email</Label><Input type="email" value={editing.contact_email ?? ""} onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })} /></div>
                <div><Label>Contact phone</Label><Input value={editing.contact_phone ?? ""} onChange={(e) => setEditing({ ...editing, contact_phone: e.target.value })} /></div>
                <div className="col-span-2"><Label>Photo URL</Label><Input value={editing.avatar_url ?? ""} onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })} /></div>
                <div><Label>Display order</Label><Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={!!editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />Active</label>
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
