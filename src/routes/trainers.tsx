import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import mascot from "@/assets/chess-mascot.png";

export const Route = createFileRoute("/trainers")({
  head: () => ({
    meta: [
      { title: "Official Partners — FIDE Trainer Network" },
      { name: "description", content: "Our official partners and certified FIDE trainers." },
    ],
  }),
  component: TrainersPage,
});

type Partner = {
  id: string; name: string; country: string | null; title: string | null;
  rating: number | null; bio: string | null; expertise: string[] | null;
  languages: string[] | null; contact_email: string | null;
  avatar_url: string | null; is_active: boolean;
};

const COLORS = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
];

function TrainersPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["public-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("official_partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order")
        .order("name");
      if (error) throw error;
      return data as Partner[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("trainers.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("trainers.subtitle")}</p>
        </div>
        {isAdmin && (
          <Button asChild variant="hero">
            <Link to="/admin/partners"><Plus className="mr-1 h-4 w-4" />Manage Partners</Link>
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading partners…</p>}
      {!isLoading && partners.length === 0 && (
        <p className="text-sm text-muted-foreground">No partners yet.</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {partners.map((p, idx) => {
          const initials = p.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
          const color = COLORS[idx % COLORS.length];
          return (
            <Card key={p.id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
              <div className={`relative h-40 bg-gradient-to-br ${color} flex items-center justify-center`}>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} className="h-24 w-24 rounded-full object-cover shadow-elegant" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-white/95 font-display text-3xl font-bold text-primary shadow-elegant">{initials}</div>
                )}
                <img src={mascot} alt="" width={800} height={800} className="absolute bottom-2 right-2 h-16 w-16 opacity-90" loading="lazy" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.country ?? "—"}</p>
                  </div>
                  {p.rating != null && <Badge variant="secondary" className="bg-gold text-gold-foreground">{p.rating}</Badge>}
                </div>
                {p.title && <p className="mt-1 text-sm font-medium text-primary">{p.title}</p>}
                {p.bio && <p className="mt-3 text-sm text-muted-foreground">{p.bio}</p>}
                <dl className="mt-4 grid gap-2 text-sm">
                  {p.expertise && p.expertise.length > 0 && (
                    <div><dt className="font-medium inline">{t("trainers.expertise")}</dt> <dd className="inline text-muted-foreground">{p.expertise.join(", ")}</dd></div>
                  )}
                  {p.languages && p.languages.length > 0 && (
                    <div><dt className="font-medium inline">{t("trainers.languages")}</dt> <dd className="inline text-muted-foreground">{p.languages.join(", ")}</dd></div>
                  )}
                </dl>
                <div className="mt-5 flex gap-2">
                  {p.contact_email ? (
                    <Button asChild size="sm" variant="hero" className="flex-1">
                      <a href={`mailto:${p.contact_email}`}><Mail className="mr-1 h-4 w-4" />{t("trainers.contact")}</a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="hero" className="flex-1" disabled><Mail className="mr-1 h-4 w-4" />{t("trainers.contact")}</Button>
                  )}
                  {isAdmin ? (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link to="/admin/partners"><Pencil className="mr-1 h-4 w-4" />Edit</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1"><User className="mr-1 h-4 w-4" />{t("trainers.viewProfile")}</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
