import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin-guard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Receipt, Users, UserCog } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — FIDE Trainer Network" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGuard><Dashboard /></AdminGuard>,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [ev, en, pay, part] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("event_enrollments").select("id", { count: "exact", head: true }),
        supabase.from("payment_history").select("id", { count: "exact", head: true }).eq("category", "License Application"),
        supabase.from("official_partners").select("id", { count: "exact", head: true }),
      ]);
      return {
        events: ev.count ?? 0,
        enrollments: en.count ?? 0,
        licenses: pay.count ?? 0,
        partners: part.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Events", value: data?.events ?? "—", icon: Calendar },
    { label: "Enrollments", value: data?.enrollments ?? "—", icon: Users },
    { label: "License Applications", value: data?.licenses ?? "—", icon: Receipt },
    { label: "Official Partners", value: data?.partners ?? "—", icon: UserCog },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="font-display text-3xl font-bold">{c.value}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
