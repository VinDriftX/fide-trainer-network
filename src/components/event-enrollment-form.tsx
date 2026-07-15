import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/payment-method-picker";
import type { Event } from "@/lib/data";

const schema = z.object({
  nrc: z.string().trim().min(3).max(50),
  ratingStandard: z.coerce.number().int().min(0).max(3500).optional(),
  ratingRapid: z.coerce.number().int().min(0).max(3500).optional(),
  ratingBlitz: z.coerce.number().int().min(0).max(3500).optional(),
  ratingBullet: z.coerce.number().int().min(0).max(3500).optional(),
});
type Values = z.infer<typeof schema>;

export function EventEnrollmentForm({ event, onSuccess }: { event: Event; onSuccess: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [method, setMethod] = useState<PaymentMethod>("MMQR");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    if (!user) { toast.error(t("enroll.loginPrompt")); return; }
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
    toast.success(t("enroll.submitted"));
    onSuccess();
  };

  if (!user) {
    return <p className="text-sm text-muted-foreground">{t("enroll.loginToRegister", { link: t("enroll.logIn") })} <a href="/auth" className="text-primary underline">{t("enroll.logIn")}</a></p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-1.5">
        <Label>{t("enroll.nrcLabel")}</Label>
        <Input {...form.register("nrc")} placeholder="e.g. 12/AAA(N)000000" />
        {form.formState.errors.nrc && <p className="text-xs text-destructive">{t("registrant.nrcReq")}</p>}
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-1.5">
          <Label>{t("enroll.standardRating")}</Label>
          <Input type="number" {...form.register("ratingStandard")} placeholder="1850" />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("enroll.rapidRating")}</Label>
          <Input type="number" {...form.register("ratingRapid")} placeholder="1900" />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("enroll.blitzRating")}</Label>
          <Input type="number" {...form.register("ratingBlitz")} placeholder="1950" />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("enroll.bulletRating")}</Label>
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
        <Label htmlFor="event-screenshot">{t("enroll.uploadScreenshot")}</Label>
        <Input id="event-screenshot" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <Button type="submit" variant="hero" disabled={submitting}>
        {submitting ? t("enroll.submitting") : t("enroll.submit")}
      </Button>
    </form>
  );
}
