import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Users } from "lucide-react";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Manage Events — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><EventsAdmin /></AdminGuard>,
});

type EventRow = {
  id: string; title: string; description: string | null; event_type: string | null;
  location: string | null; country: string | null; starts_at: string; ends_at: string | null;
  capacity: number | null; price: number | null; currency: string | null;
  cover_url: string | null; is_published: boolean | null; organizer_id: string | null;
};

const empty = (): Partial<EventRow> => ({
  title: "", description: "", event_type: "seminar", location: "", country: "",
  starts_at: "", ends_at: "", capacity: null, price: 0, currency: "USD",
  cover_url: "", is_published: true,
});

function EventsAdmin() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState<Partial<EventRow> | null>(null);
  const [viewingEnrollments, setViewingEnrollments] = useState<EventRow | null>(null);

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
      if (error) throw error;
      return data as EventRow[];
    },
  });

  const saveMut = useMutation({
    mutationFn: async (row: Partial<EventRow>) => {
      if (!row.title) throw new Error("Title required");
      const payload = {
        title: row.title,
        description: row.description ?? null,
        event_type: row.event_type ?? null,
        location: row.location ?? null,
        country: row.country ?? null,
        starts_at: row.starts_at ? new Date(row.starts_at).toISOString() : new Date().toISOString(),
        ends_at: row.ends_at ? new Date(row.ends_at).toISOString() : null,
        capacity: row.capacity ? Number(row.capacity) : null,
        price: row.price ? Number(row.price) : 0,
        currency: row.currency || "USD",
        cover_url: row.cover_url || null,
        is_published: !!row.is_published,
      };
      if (row.id) {
        const { error } = await supabase.from("events").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert({ ...payload, organizer_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Events</h1>
        <Button onClick={() => setEditing(empty())}><Plus className="mr-1 h-4 w-4" />New Event</Button>
      </div>

      <div className="grid gap-4">
        {events.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-display text-lg font-bold truncate">{e.title}</div>
                  {e.is_published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(e.starts_at).toLocaleString()} • {e.location || "—"} • {e.country || "—"}
                </div>
                {e.description && <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</div>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setViewingEnrollments(e)}><Users className="mr-1 h-4 w-4" />Enrollments</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing({ ...e, starts_at: e.starts_at.slice(0, 16), ends_at: e.ends_at?.slice(0, 16) ?? "" })}><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete "${e.title}"?`)) delMut.mutate(e.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="text-sm text-muted-foreground">No events yet. Create one to get started.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Event" : "New Event"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(ev) => { ev.preventDefault(); saveMut.mutate(editing); }} className="grid gap-3">
              <div><Label>Title</Label><Input required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label><Input value={editing.event_type ?? ""} onChange={(e) => setEditing({ ...editing, event_type: e.target.value })} placeholder="seminar" /></div>
                <div><Label>Country</Label><Input value={editing.country ?? ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
                <div className="col-span-2"><Label>Venue / Location</Label><Input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></div>
                <div><Label>Starts at</Label><Input required type="datetime-local" value={editing.starts_at ?? ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} /></div>
                <div><Label>Ends at</Label><Input type="datetime-local" value={editing.ends_at ?? ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} /></div>
                <div><Label>Capacity</Label><Input type="number" value={editing.capacity ?? ""} onChange={(e) => setEditing({ ...editing, capacity: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Price</Label><Input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                <div><Label>Currency</Label><Input value={editing.currency ?? "USD"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} /></div>
                <div><Label>Cover URL</Label><Input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />Published</label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingEnrollments} onOpenChange={(o) => !o && setViewingEnrollments(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>Enrollments — {viewingEnrollments?.title}</DialogTitle></DialogHeader>
          {viewingEnrollments && <EnrollmentsList eventId={viewingEnrollments.id} eventName={viewingEnrollments.title} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnrollmentsList({ eventId, eventName }: { eventId: string; eventName: string }) {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-enrollments", eventId, eventName],
    queryFn: async () => {
      // event_enrollments stores event_id as text (e.g. "mm-01") OR uuid string; match by either
      const { data: en, error } = await supabase.from("event_enrollments")
        .select("*")
        .or(`event_id.eq.${eventId},event_name.eq.${eventName}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const ids = [...new Set((en ?? []).map((r) => r.user_id))];
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, full_name, email, fide_id, phone").in("id", ids) : { data: [] };
      return (en ?? []).map((r) => ({ ...r, profile: (profiles ?? []).find((p) => p.id === r.user_id) }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("event_enrollments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-enrollments"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No enrollments yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-2">Name</th><th className="p-2">FIDE</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Ratings</th><th className="p-2">Status</th></tr>
        </thead>
        <tbody>
          {data.map((r: any) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.profile?.full_name ?? "—"}</td>
              <td className="p-2">{r.profile?.fide_id ?? "—"}</td>
              <td className="p-2">{r.profile?.email ?? "—"}</td>
              <td className="p-2">{r.profile?.phone ?? "—"}</td>
              <td className="p-2 text-xs">S:{r.rating_standard ?? "-"} / R:{r.rating_rapid ?? "-"} / B:{r.rating_blitz ?? "-"}</td>
              <td className="p-2">
                <select className="rounded border bg-background px-2 py-1 text-xs" value={r.status} onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value })}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="rejected">rejected</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
