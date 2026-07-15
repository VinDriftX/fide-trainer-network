import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, User } from "lucide-react";
import { getTrainers } from "@/lib/data";
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

function TrainersPage() {
  const { t } = useTranslation();
  const trainers = getTrainers(t);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("trainers.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("trainers.subtitle")}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {trainers.map((tr) => (
          <Card key={tr.id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
            <div className={`relative h-40 bg-gradient-to-br ${tr.color} flex items-center justify-center`}>
              <div className="grid h-24 w-24 place-items-center rounded-full bg-white/95 font-display text-3xl font-bold text-primary shadow-elegant">{tr.initials}</div>
              <img src={mascot} alt="" width={800} height={800} className="absolute bottom-2 right-2 h-16 w-16 opacity-90" loading="lazy" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-bold">{tr.name}</h3>
                  <p className="text-sm text-muted-foreground">{tr.country}</p>
                </div>
                <Badge variant="secondary" className="bg-gold text-gold-foreground">{tr.rating}</Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-primary">{tr.title}</p>
              <p className="mt-3 text-sm text-muted-foreground">{tr.bio}</p>
              <dl className="mt-4 grid gap-2 text-sm">
                <div><dt className="font-medium">{t("trainers.experience")}</dt> <dd className="inline text-muted-foreground">{tr.experience}</dd></div>
                <div><dt className="font-medium">{t("trainers.expertise")}</dt> <dd className="inline text-muted-foreground">{tr.expertise.join(", ")}</dd></div>
                <div><dt className="font-medium">{t("trainers.languages")}</dt> <dd className="inline text-muted-foreground">{tr.languages.join(", ")}</dd></div>
              </dl>
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="hero" className="flex-1"><Mail className="mr-1 h-4 w-4" />{t("trainers.contact")}</Button>
                <Button size="sm" variant="outline" className="flex-1"><User className="mr-1 h-4 w-4" />{t("trainers.viewProfile")}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
