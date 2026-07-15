import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { getEvents, type Event } from "@/lib/data";
import { EventEnrollmentForm } from "@/components/event-enrollment-form";
import { SuccessCard } from "@/components/success-card";
import { useAuth } from "@/lib/auth-context";
import mascot from "@/assets/chess-mascot.png";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — FIDE Trainer Network" },
      { name: "description", content: "Upcoming FIDE trainer seminars in Myanmar, United States, and India." },
    ],
  }),
  component: EventsPage,
});

function EventCard({ event, onBook }: { event: Event; onBook: () => void }) {
  const { t } = useTranslation();
  return (
    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="chessboard-bg flex items-center gap-3 border-b bg-muted/30 p-4">
        <span className="text-3xl">{event.flag}</span>
        <div className="flex-1"><div className="font-display text-lg font-bold">{event.country}</div></div>
        <img src={mascot} alt="" className="h-12 w-12" width={800} height={800} loading="lazy" />
      </div>
      <CardHeader><CardTitle className="font-display text-xl">{event.name}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" />{t("events.seminar")} <span className="font-medium text-foreground">{event.date}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" /><span className="font-medium text-foreground">{event.time}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /><span className="font-medium text-foreground">{event.venue}</span></div>
        <div className="flex items-start gap-2 text-muted-foreground"><Users className="mt-0.5 h-4 w-4 text-primary" /><span className="text-foreground">{event.trainers.join(", ")}</span></div>
        <p className="text-muted-foreground">{event.description}</p>
        <div className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-secondary">{t("events.examDate")} {event.examDate}</div>
        <Button onClick={onBook} variant="hero" className="mt-2">{t("events.enrollButton")}</Button>
      </CardContent>
    </Card>
  );
}

function EventsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const events = getEvents(t);
  const [selected, setSelected] = useState<Event | null>(null);
  const [success, setSuccess] = useState<Event | null>(null);

  const grouped = events.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[e.country] ??= []).push(e); return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{t("events.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("events.subtitle")}</p>
        </div>
        {isAdmin && (
          <Button asChild variant="hero">
            <Link to="/admin/events"><Plus className="mr-1 h-4 w-4" />Create Event</Link>
          </Button>
        )}
      </div>

      {Object.entries(grouped).map(([c, arr]) => (
        <section key={c} className="mb-16">
          <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">{c}</h2>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {arr.map((e) => <EventCard key={e.id} event={e} onBook={() => setSelected(e)} />)}
          </div>
        </section>
      ))}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("events.registerInterest")}</DialogTitle>
            <DialogDescription>{selected?.name} — {selected?.date}</DialogDescription>
          </DialogHeader>
          {selected && (
            <EventEnrollmentForm
              event={selected}
              onSuccess={() => { setSuccess(selected); setSelected(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!success} onOpenChange={(o) => !o && setSuccess(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="sr-only">{t("events.submitted")}</DialogTitle></DialogHeader>
          {success && (
            <SuccessCard
              title={t("events.submitted")}
              rows={[
                { label: t("events.eventLabel"), value: success.name },
                { label: t("common.status"), value: t("events.pendingConfirmation") },
                { label: t("events.zoomLink"), value: <a href={success.zoomLink} className="text-primary underline" target="_blank" rel="noreferrer">{success.zoomLink}</a> },
                { label: t("events.meetingId"), value: success.meetingId },
              ]}
              footer={t("events.footerNote")}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
