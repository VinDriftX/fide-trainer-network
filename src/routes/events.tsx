import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { events, type Event } from "@/lib/data";
import { EventEnrollmentForm } from "@/components/event-enrollment-form";
import { SuccessCard } from "@/components/success-card";
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
  return (
    <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-elegant">
      <div className="chessboard-bg flex items-center gap-3 border-b bg-muted/30 p-4">
        <span className="text-3xl">{event.flag}</span>
        <div className="flex-1"><div className="font-display text-lg font-bold">{event.country}</div></div>
        <img src={mascot} alt="" className="h-12 w-12" width={800} height={800} loading="lazy" />
      </div>
      <CardHeader><CardTitle className="font-display text-xl">{event.name}</CardTitle></CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" />Seminar: <span className="font-medium text-foreground">{event.date}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" /><span className="font-medium text-foreground">{event.time}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /><span className="font-medium text-foreground">{event.venue}</span></div>
        <div className="flex items-start gap-2 text-muted-foreground"><Users className="mt-0.5 h-4 w-4 text-primary" /><span className="text-foreground">{event.trainers.join(", ")}</span></div>
        <p className="text-muted-foreground">{event.description}</p>
        <div className="rounded-md bg-gold/10 px-3 py-2 text-xs font-medium text-secondary">Exam Date: {event.examDate}</div>
        <Button onClick={onBook} variant="hero" className="mt-2">Enroll / Register Interest</Button>
      </CardContent>
    </Card>
  );
}

function EventsPage() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [success, setSuccess] = useState<Event | null>(null);

  const grouped = events.reduce<Record<string, Event[]>>((acc, e) => {
    (acc[e.country] ??= []).push(e); return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Upcoming Events</h1>
        <p className="mt-2 text-muted-foreground">FIDE trainer seminars around the world. Register your interest below.</p>
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
            <DialogTitle className="font-display text-2xl">Register Interest</DialogTitle>
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
          <DialogHeader><DialogTitle className="sr-only">Enrollment received</DialogTitle></DialogHeader>
          {success && (
            <SuccessCard
              title="✅ Enrollment Submitted"
              rows={[
                { label: "Event", value: success.name },
                { label: "Status", value: "Pending confirmation" },
                { label: "Zoom Link", value: <a href={success.zoomLink} className="text-primary underline" target="_blank" rel="noreferrer">{success.zoomLink}</a> },
                { label: "Meeting ID", value: success.meetingId },
              ]}
              footer="You can view all your enrolled events on your profile page."
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
