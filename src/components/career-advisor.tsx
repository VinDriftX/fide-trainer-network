import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, Trophy, TrendingUp, AlertCircle, ArrowRight, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCareerAdvice, type CareerAdvice } from "@/lib/career-advisor.functions";

export function CareerAdvisor() {
  const { t, i18n } = useTranslation();
  const advise = useServerFn(getCareerAdvice);
  const [examScore, setExamScore] = useState("");
  const [rating, setRating] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerAdvice | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const exam = Number(examScore);
    const fide = Number(rating);
    if (!Number.isFinite(exam) || exam < 0 || exam > 1000) {
      setError(t("advisor.errExam"));
      return;
    }
    if (!Number.isFinite(fide) || fide < 0 || fide > 3500) {
      setError(t("advisor.errRating"));
      return;
    }
    setLoading(true);
    try {
      const lang = (i18n.language as "en" | "my" | "zh") ?? "en";
      const advice = await advise({ data: { examScore: exam, fideRating: fide, goal: goal.trim() || undefined, language: lang } });
      setResult(advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("advisor.errGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3 bg-gold text-gold-foreground hover:bg-gold/90">
            <Sparkles className="mr-1 h-3 w-3" /> {t("advisor.badge")}
          </Badge>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("advisor.heading")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("advisor.subhead")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display">{t("advisor.yourProfile")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("advisor.examScore")}</label>
                  <input
                    type="number" min={0} max={1000} required value={examScore}
                    onChange={(e) => setExamScore(e.target.value)}
                    placeholder="650"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("advisor.fideRating")}</label>
                  <input
                    type="number" min={0} max={3500} required value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="2050"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("advisor.goal")}</label>
                  <textarea
                    value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
                    placeholder={t("advisor.goalPlaceholder")}
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="rounded-lg border bg-background/50 p-3 text-xs text-muted-foreground">
                  <div className="mb-1 font-semibold text-foreground">{t("advisor.titleReq")}</div>
                  <ul className="space-y-0.5">
                    <li>{t("advisor.req.di")}</li>
                    <li>{t("advisor.req.ni")}</li>
                    <li>{t("advisor.req.fi")}</li>
                    <li>{t("advisor.req.ft")}</li>
                    <li>{t("advisor.req.fst")}</li>
                  </ul>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <Button type="submit" size="lg" variant="hero" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("advisor.analyzing")}</> : <>{t("advisor.getRec")} <ArrowRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display">{t("advisor.aiRec")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="grid h-full min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
                  <div>
                    <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary/60" />
                    {t("advisor.emptyHint")}
                  </div>
                </div>
              )}
              {loading && (
                <div className="grid h-full min-h-[280px] place-items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("advisor.consulting")}</div>
                </div>
              )}
              {result && (
                <div className="space-y-5 animate-scale-in">
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/10 p-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("advisor.recommendedTitle")}</div>
                      <div className="font-display text-2xl font-bold text-primary">{result.recommendedTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("advisor.match")}</div>
                      <div className="font-display text-2xl font-bold">{Math.round(result.matchScore)}%</div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground">{result.explanation}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Section icon={Trophy} title={t("advisor.strengths")} items={result.strengths} />
                    <Section icon={TrendingUp} title={t("advisor.areasToImprove")} items={result.areasToImprove} />
                    <Section icon={ArrowRight} title={t("advisor.nextSteps")} items={result.nextSteps} />
                    <Section icon={Calendar} title={t("advisor.suggestedSeminars")} items={result.suggestedSeminars} />
                    <div className="sm:col-span-2">
                      <Section icon={Users} title={t("advisor.suggestedTrainers")} items={result.suggestedTrainers} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-muted-foreground/20 bg-background p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">{t("advisor.disclaimer")}</strong> {t("advisor.disclaimerText")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Section({ icon: Icon, title, items }: { icon: React.ComponentType<{ className?: string }>; title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />{it}</li>
        ))}
      </ul>
    </div>
  );
}
