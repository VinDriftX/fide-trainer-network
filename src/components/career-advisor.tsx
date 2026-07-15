import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, Trophy, TrendingUp, AlertCircle, ArrowRight, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCareerAdvice, type CareerAdvice } from "@/lib/career-advisor.functions";

export function CareerAdvisor() {
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
      setError("Exam score must be between 0 and 1000.");
      return;
    }
    if (!Number.isFinite(fide) || fide < 0 || fide > 3500) {
      setError("FIDE rating must be between 0 and 3500.");
      return;
    }
    setLoading(true);
    try {
      const advice = await advise({ data: { examScore: exam, fideRating: fide, goal: goal.trim() || undefined } });
      setResult(advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-3 bg-gold text-gold-foreground hover:bg-gold/90">
            <Sparkles className="mr-1 h-3 w-3" /> AI Career Advisor
          </Badge>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What Title Do You Want To Be?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Enter your seminar exam score and FIDE rating. Our AI will recommend the right trainer title, explain the fit, and guide your next steps.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Seminar Exam Score (0–1000)</label>
                  <input
                    type="number" min={0} max={1000} required value={examScore}
                    onChange={(e) => setExamScore(e.target.value)}
                    placeholder="e.g. 650"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">FIDE Rating</label>
                  <input
                    type="number" min={0} max={3500} required value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="e.g. 2050"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Your Goal (optional)</label>
                  <textarea
                    value={goal} onChange={(e) => setGoal(e.target.value)} rows={3}
                    placeholder="e.g. Coach junior players and pursue FIDE Trainer certification."
                    className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="rounded-lg border bg-background/50 p-3 text-xs text-muted-foreground">
                  <div className="mb-1 font-semibold text-foreground">Title Requirements</div>
                  <ul className="space-y-0.5">
                    <li>DI · Exam 200–399 · No rating requirement</li>
                    <li>NI · Exam 400–599 · Min 1700</li>
                    <li>FI · Exam 600–799 · Min 2000</li>
                    <li>FT · Exam 800–1000 · Min 2300</li>
                    <li>FST · Awarded by merit · 2450+</li>
                  </ul>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <Button type="submit" size="lg" variant="hero" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</> : <>Get My Recommendation <ArrowRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display">AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !loading && (
                <div className="grid h-full min-h-[280px] place-items-center text-center text-sm text-muted-foreground">
                  <div>
                    <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary/60" />
                    Fill in your details to see a personalized title recommendation.
                  </div>
                </div>
              )}
              {loading && (
                <div className="grid h-full min-h-[280px] place-items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Consulting the AI Career Advisor…</div>
                </div>
              )}
              {result && (
                <div className="space-y-5 animate-scale-in">
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/10 p-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Recommended Title</div>
                      <div className="font-display text-2xl font-bold text-primary">{result.recommendedTitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Match</div>
                      <div className="font-display text-2xl font-bold">{Math.round(result.matchScore)}%</div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground">{result.explanation}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Section icon={Trophy} title="Strengths" items={result.strengths} />
                    <Section icon={TrendingUp} title="Areas to Improve" items={result.areasToImprove} />
                    <Section icon={ArrowRight} title="Next Steps" items={result.nextSteps} />
                    <Section icon={Calendar} title="Suggested Seminars" items={result.suggestedSeminars} />
                    <div className="sm:col-span-2">
                      <Section icon={Users} title="Suggested Trainers" items={result.suggestedTrainers} />
                    </div>
                  </div>

                  <div className="rounded-lg border border-muted-foreground/20 bg-background p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> These AI recommendations are for guidance only and are not official FIDE decisions. Final titles are awarded exclusively by FIDE based on their certification process.
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
