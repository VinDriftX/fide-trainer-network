import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminListUsers, adminSetUserRole, adminBanUser, adminDeleteUser } from "@/lib/admin.functions";
import { Shield, ShieldOff, Ban, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Admin Settings — FIDE Trainer Network" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><SettingsAdmin /></AdminGuard>,
});

function SettingsAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetUserRole);
  const ban = useServerFn(adminBanUser);
  const del = useServerFn(adminDeleteUser);

  const { data = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: "admin"; grant: boolean }) => setRole({ data: v }),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const banMut = useMutation({
    mutationFn: (v: { userId: string; durationHours: number }) => ban({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (v: { userId: string }) => del({ data: v }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (data as any[]).filter((u) =>
    !q || (u.email?.toLowerCase().includes(q.toLowerCase()) || u.profile?.full_name?.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">Users & Access</h1>
      <p className="mb-6 text-sm text-muted-foreground">Manage administrators, ban suspicious accounts, and view sign-in activity.</p>

      <div className="mb-4 flex items-center gap-3">
        <Input placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <span className="text-sm text-muted-foreground">{filtered.length} users</span>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid gap-2">
        {filtered.map((u: any) => {
          const isAdmin = u.roles.includes("admin");
          const isBanned = u.banned_until && new Date(u.banned_until) > new Date();
          return (
            <Card key={u.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{u.profile?.full_name || u.email}</span>
                    {isAdmin && <Badge>Admin</Badge>}
                    {isBanned && <Badge variant="destructive">Banned</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.email} • Joined {new Date(u.created_at).toLocaleDateString()} • Last sign-in {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "never"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? (
                    <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ userId: u.id, role: "admin", grant: false })}><ShieldOff className="mr-1 h-4 w-4" />Revoke admin</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => roleMut.mutate({ userId: u.id, role: "admin", grant: true })}><Shield className="mr-1 h-4 w-4" />Grant admin</Button>
                  )}
                  {isBanned ? (
                    <Button size="sm" variant="outline" onClick={() => banMut.mutate({ userId: u.id, durationHours: 0 })}>Unban</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { const h = Number(prompt("Ban for how many hours? (e.g. 24, or 8760 for a year)", "24")); if (h > 0) banMut.mutate({ userId: u.id, durationHours: h }); }}><Ban className="mr-1 h-4 w-4" />Ban</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm(`Delete ${u.email}? This cannot be undone.`)) delMut.mutate({ userId: u.id }); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Sign-in activity is derived from Supabase Auth (last sign-in per user). For live active sessions and complete auth logs, use the Supabase dashboard.
      </p>
    </div>
  );
}
