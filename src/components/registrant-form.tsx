import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentMethodPicker, paymentMethods } from "@/components/payment-method-picker";

export { paymentMethods };

export const registrantSchema = z.object({
  fideId: z.string().trim().min(3).max(20),
  fullName: z.string().trim().min(2).max(100),
  age: z.coerce.number().int().min(5).max(120),
  phone: z.string().trim().min(6).max(30),
  nrc: z.string().trim().min(3).max(50),
  paymentMethod: z.enum(paymentMethods),
  paypalEmail: z.string().trim().email().optional().or(z.literal("")),
  transactionId: z.string().trim().max(80).optional().or(z.literal("")),
});

export type RegistrantValues = z.infer<typeof registrantSchema>;

type FieldProps = { label: string; error?: string; children: React.ReactNode };
function Field({ label, error, children }: FieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RegistrantForm({
  onSubmit, submitLabel, showPhoneWithCode = true, extraFields,
}: {
  onSubmit: (values: RegistrantValues, screenshot: File | null) => void | Promise<void>;
  submitLabel: string;
  showPhoneWithCode?: boolean;
  extraFields?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const form = useForm<RegistrantValues>({
    resolver: zodResolver(registrantSchema),
    defaultValues: { paymentMethod: "MMQR", paypalEmail: "", transactionId: "" },
  });
  const paymentMethod = form.watch("paymentMethod");
  const [cardNumber, setCardNumber] = useState("");

  const errFideId = form.formState.errors.fideId ? t("registrant.fideIdReq") : undefined;
  const errFullName = form.formState.errors.fullName ? t("registrant.fullNameReq") : undefined;
  const errAge = form.formState.errors.age ? t("registrant.invalidAge") : undefined;
  const errPhone = form.formState.errors.phone ? t("registrant.phoneReq") : undefined;
  const errNrc = form.formState.errors.nrc ? t("registrant.nrcReq") : undefined;

  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        const input = document.getElementById("payment-screenshot") as HTMLInputElement | null;
        const file = input?.files?.[0] ?? null;
        await onSubmit(v, file);
      })}
      className="grid gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("registrant.fideId")} error={errFideId}>
          <Input {...form.register("fideId")} placeholder="e.g. 12345678" />
        </Field>
        <Field label={t("registrant.fullName")} error={errFullName}>
          <Input {...form.register("fullName")} />
        </Field>
        <Field label={t("registrant.age")} error={errAge}>
          <Input type="number" {...form.register("age")} placeholder="25" />
        </Field>
        <Field label={showPhoneWithCode ? t("registrant.phoneWithCode") : t("registrant.phone")} error={errPhone}>
          <Input {...form.register("phone")} placeholder="+95 9 123 456 789" />
        </Field>
      </div>
      <Field label={t("registrant.nrc")} error={errNrc}>
        <Input {...form.register("nrc")} placeholder="e.g. 12/AAA(N)000000" />
      </Field>

      {extraFields}

      <PaymentMethodPicker
        value={paymentMethod}
        onChange={(m) => form.setValue("paymentMethod", m)}
        paypalEmail={form.watch("paypalEmail") ?? ""}
        onPaypalEmailChange={(v) => form.setValue("paypalEmail", v)}
        transactionId={form.watch("transactionId") ?? ""}
        onTransactionIdChange={(v) => form.setValue("transactionId", v)}
        cardNumber={cardNumber}
        onCardNumberChange={setCardNumber}
      />


      <div className="grid gap-1.5">
        <Label htmlFor="payment-screenshot">{t("registrant.uploadScreenshot")}</Label>
        <Input id="payment-screenshot" type="file" accept="image/*" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="hero" disabled={form.formState.isSubmitting}>{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>{t("registrant.reset")}</Button>
      </div>
    </form>
  );
}
