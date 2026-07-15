import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/tax-support")({
  head: () => ({ meta: [{ title: "License Applications — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><TaxAdmin /></AdminGuard>,
});

function TaxAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-licenses"],
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("payment_history")
        .select("*").eq("category", "License Application").order("created_at", { ascending: false });
      if (error) throw error;
      const ids = [...new Set((rows ?? []).map((r) => r.user_id))];
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, full_name, email, fide_id, phone").in("id", ids) : { data: [] };
      return (rows ?? []).map((r) => ({ ...r, profile: (profiles ?? []).find((p) => p.id === r.user_id) }));
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("payment_history").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-licenses"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">License Applications</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid gap-3">
        {data.map((r: any) => (
          <Card key={r.id}>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
              <div className="grid gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-bold">{r.reference_id}</span>
                  <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
                  <span className="text-muted-foreground">{r.description}</span>
                </div>
                <div className="text-muted-foreground">
                  {r.profile?.full_name ?? "—"} • FIDE {r.profile?.fide_id ?? "—"} • {r.profile?.email ?? "—"} • {r.profile?.phone ?? "—"}
                </div>
                <div className="text-muted-foreground">Amount: ${r.amount} {r.currency} • Method: {r.payment_method} • {new Date(r.created_at).toLocaleString()}</div>
                {r.metadata?.transaction_id && <div className="text-xs text-muted-foreground">TXN: {r.metadata.transaction_id}</div>}
              </div>
              <div className="flex gap-2 md:flex-col">
                <Button size="sm" variant="default" onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}><Check className="mr-1 h-4 w-4" />Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}><X className="mr-1 h-4 w-4" />Reject</Button>
                <select className="rounded border bg-background px-2 py-1 text-xs" value={r.status} onChange={(e) => setStatus.mutate({ id: r.id, status: e.target.value })}>
                  <option value="pending">pending</option>
                  <option value="under_review">under review</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && data.length === 0 && <p className="text-sm text-muted-foreground">No license applications yet.</p>}
      </div>
    </div>
  );
}
