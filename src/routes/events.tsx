import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import { EventEnrollmentForm } from "@/components/event-enrollment-form";
import { SuccessCard } from "@/components/success-card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/lib/data";
import mascot from "@/assets/chess-mascot.png";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — FIDE Trainer Network" },
      { name: "description", content: "Upcoming FIDE trainer seminars and courses." },
    ],
  }),
  component: EventsPage,
});

type DbEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  location: string | null;
  country: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  price: number | null;
  currency: string | null;
  cover_url: string | null;
  is_published: boolean | null;
};

const COUNTRY_FLAGS: Record<string, string> = {
  Myanmar: "🇲🇲", "United States": "🇺🇸", USA: "🇺🇸", India: "🇮🇳",
  China: "🇨🇳", Thailand: "🇹🇭", Singapore: "🇸🇬", Japan: "🇯🇵",
};

function toEvent(row: DbEvent): Event {
  const d = new Date(row.starts_at);
  const country = row.country || "Other";
  return {
    id: row.id,
    country,
    countryKey: country,
    flag: COUNTRY_FLAGS[country] ?? "🌐",
    name: row.title,
    date: d.toLocaleDateString(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    venue: row.location || "TBA",
    trainers: [],
    description: row.description || "",
    examDate: row.ends_at ? new Date(row.ends_at).toLocaleDateString() : "TBA",
    zoomLink: "",
    meetingId: "",
    passcode: "",
  };
}

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
        {event.trainers.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground"><Users className="mt-0.5 h-4 w-4 text-primary" /><span className="text-foreground">{event.trainers.join(", ")}</span></div>
        )}
        {event.description && <p className="text-muted-foreground">{event.description}</p>}
        {event.examDate !== "TBA" && (
          <div className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-secondary">{t("events.examDate")} {event.examDate}</div>
        )}
        <Button onClick={onBook} variant="hero" className="mt-2">{t("events.enrollButton")}</Button>
      </CardContent>
    </Card>
  );
}

function EventsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [selected, setSelected] = useState<Event | null>(null);
  const [success, setSuccess] = useState<Event | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data as DbEvent[]).map(toEvent);
    },
  });

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

      {isLoading && <p className="text-sm text-muted-foreground">Loading events…</p>}
      {!isLoading && events.length === 0 && (
        <p className="text-sm text-muted-foreground">No events available yet. Check back soon.</p>
      )}

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
              ]}
              footer={t("events.footerNote")}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
