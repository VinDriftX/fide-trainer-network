import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, Globe2, ArrowRight, Sparkles } from "lucide-react";
import { getTrainerLevels, getStats } from "@/lib/data";
import hero from "@/assets/hero-chess.jpg";
import mascot from "@/assets/chess-mascot.png";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CareerAdvisor } from "@/components/career-advisor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIDE Trainer Network - Global Community of Chess Trainer" },
      { name: "description", content: "Join a global network of FIDE-certified chess trainers, instructors, and educators. Access seminars, exams, and professional development." },
    ],
  }),
  component: Home,
});

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  const n = useCountUp(value);
  return (
    <Card className="text-center transition hover:-translate-y-1 hover:shadow-elegant">
      <CardContent className="p-6">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
        <div className="font-display text-4xl font-bold text-foreground">{n.toLocaleString()}+</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const statIcons = [Trophy, Users, Calendar, Globe2];
  const trainerLevels = getTrainerLevels(t);
  const stats = getStats(t);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-32">
          <div className="text-primary-foreground">
            <Badge variant="secondary" className="mb-4 bg-gold text-gold-foreground hover:bg-gold/90">
              <Sparkles className="mr-1 h-3 w-3" />{t("home.badge")}
            </Badge>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">{t("brand.name")}</h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/90 sm:text-xl">{t("home.heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="gold" asChild><Link to="/register">{t("home.joinNow")} <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-primary-foreground border-primary-foreground/40 backdrop-blur hover:bg-white/20" asChild>
                <Link to="/events">{t("home.upcomingEvents")}</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:flex items-end justify-center">
            <img src={mascot} alt="Chess mascot" className="animate-float h-64 w-64 drop-shadow-2xl" width={800} height={800} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("home.levelsTitle")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("home.levelsSubtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trainerLevels.map((lvl, i) => (
            <Card key={lvl.code} className="group relative overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
              <div className="absolute right-4 top-4 font-display text-6xl font-bold text-primary/10 transition group-hover:text-primary/20">{i + 1}</div>
              <CardHeader>
                <Badge className="w-fit bg-gold text-gold-foreground hover:bg-gold">{lvl.code}</Badge>
                <CardTitle className="font-display text-xl">{lvl.name}</CardTitle>
                <CardDescription className="font-medium text-primary">{t("home.ratingLabel")} {lvl.rating}</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{lvl.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="chessboard-bg border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("home.statsTitle")}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => <StatCard key={s.key} icon={statIcons[i]} label={s.label} value={s.value} />)}
          </div>
        </div>
      </section>

      <CareerAdvisor />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("home.ctaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("home.ctaSubtitle")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" variant="hero" asChild><Link to="/register">{t("home.getStarted")}</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/trainers">{t("home.meetTrainers")}</Link></Button>
        </div>
      </section>
    </div>
  );
}
