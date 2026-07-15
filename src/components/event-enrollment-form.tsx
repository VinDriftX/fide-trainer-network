import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/payment-method-picker";
import type { Event } from "@/lib/data";

const schema = z.object({
  nrc: z.string().trim().min(3, "NRC/Passport required").max(50),
  ratingStandard: z.coerce.number().int().min(0).max(3500).optional(),
  ratingRapid: z.coerce.number().int().min(0).max(3500).optional(),
  ratingBlitz: z.coerce.number().int().min(0).max(3500).optional(),
  ratingBullet: z.coerce.number().int().min(0).max(3500).optional(),
});
type Values = z.infer<typeof schema>;

export function EventEnrollmentForm({ event, onSuccess }: { event: Event; onSuccess: () => void }) {
  const { user } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>("MMQR");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    if (!user) { toast.error("Please log in to enroll"); return; }
    setSubmitting(true);
    let screenshotUrl: string | null = null;
    if (file) {
      const path = `${user.id}/${event.id}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("payment-screenshots").upload(path, file);
      if (upErr) { toast.error(upErr.message); setSubmitting(false); return; }
      screenshotUrl = path;
    }
    const { error } = await supabase.from("event_enrollments").insert({
      user_id: user.id,
      event_id: event.id,
      event_name: event.name,
      nrc: v.nrc,
      payment_method: method,
      screenshot_url: screenshotUrl,
      rating_standard: v.ratingStandard ?? null,
      rating_rapid: v.ratingRapid ?? null,
      rating_blitz: v.ratingBlitz ?? null,
      rating_bullet: v.ratingBullet ?? null,
      status: "pending",
    });
    if (!error) {
      await supabase.from("payment_history").insert({
        user_id: user.id,
        category: "Event Enrollment",
        description: event.name,
        amount: 0,
        currency: "USD",
        payment_method: method,
        reference_id: transactionId || null,
        status: "pending",
        metadata: { event_id: event.id, screenshot_url: screenshotUrl },
      });
    }
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Enrollment submitted!");
    onSuccess();
  };

  if (!user) {
    return <p className="text-sm text-muted-foreground">Please <a href="/auth" className="text-primary underline">log in</a> to register interest in this event.</p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label>NRC or Passport ID</Label>
        <Input {...form.register("nrc")} placeholder="e.g. 12/AAA(N)000000" />
        {form.formState.errors.nrc && <p className="text-xs text-destructive">{form.formState.errors.nrc.message}</p>}
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label>Standard Rating</Label>
          <Input type="number" {...form.register("ratingStandard")} placeholder="1850" />
        </div>
        <div className="grid gap-1.5">
          <Label>Rapid Rating</Label>
          <Input type="number" {...form.register("ratingRapid")} placeholder="1900" />
        </div>
        <div className="grid gap-1.5">
          <Label>Blitz Rating</Label>
          <Input type="number" {...form.register("ratingBlitz")} placeholder="1950" />
        </div>
        <div className="grid gap-1.5">
          <Label>Bullet Rating</Label>
          <Input type="number" {...form.register("ratingBullet")} placeholder="2000" />
        </div>
      </div>

      <PaymentMethodPicker
        value={method} onChange={setMethod}
        paypalEmail={paypalEmail} onPaypalEmailChange={setPaypalEmail}
        transactionId={transactionId} onTransactionIdChange={setTransactionId}
        cardNumber={cardNumber} onCardNumberChange={setCardNumber}
      />

      <div className="grid gap-1.5">
        <Label htmlFor="event-screenshot">Payment Screenshot (Upload)</Label>
        <Input id="event-screenshot" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <Button type="submit" variant="hero" disabled={submitting}>
        {submitting ? "Submitting…" : "Register Interest"}
      </Button>
    </form>
  );
}
