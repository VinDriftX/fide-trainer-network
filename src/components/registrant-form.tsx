import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

export const paymentMethods = ["MMQR", "PayPal", "Mobile Banking", "MPU"] as const;

export const registrantSchema = z.object({
  fideId: z.string().trim().min(3, "FIDE ID required").max(20),
  fullName: z.string().trim().min(2, "Full name required").max(100),
  age: z.coerce.number().int().min(5, "Invalid").max(120),
  phone: z.string().trim().min(6, "Phone required").max(30),
  nrc: z.string().trim().min(3, "NRC/Passport required").max(50),
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
  const form = useForm<RegistrantValues>({
    resolver: zodResolver(registrantSchema),
    defaultValues: { paymentMethod: "MMQR", paypalEmail: "", transactionId: "" },
  });
  const paymentMethod = form.watch("paymentMethod");

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
        <Field label="FIDE ID" error={form.formState.errors.fideId?.message}>
          <Input {...form.register("fideId")} placeholder="e.g. 12345678" />
        </Field>
        <Field label="Full Name" error={form.formState.errors.fullName?.message}>
          <Input {...form.register("fullName")} placeholder="Your full name" />
        </Field>
        <Field label="Age" error={form.formState.errors.age?.message}>
          <Input type="number" {...form.register("age")} placeholder="25" />
        </Field>
        <Field label={showPhoneWithCode ? "Phone Number (with country code)" : "Phone Number"} error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} placeholder="+95 9 123 456 789" />
        </Field>
      </div>
      <Field label="NRC / Passport Number" error={form.formState.errors.nrc?.message}>
        <Input {...form.register("nrc")} placeholder="e.g. 12/AAA(N)000000" />
      </Field>

      {extraFields}

      <div className="grid gap-2">
        <Label>Payment Method</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(v) => form.setValue("paymentMethod", v as typeof paymentMethods[number])}
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {paymentMethods.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card p-3 text-sm transition hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <RadioGroupItem value={m} />{m}
            </label>
          ))}
        </RadioGroup>
      </div>

      {paymentMethod === "PayPal" && (
        <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
          <Field label="PayPal Email" error={form.formState.errors.paypalEmail?.message}>
            <Input type="email" {...form.register("paypalEmail")} placeholder="you@example.com" />
          </Field>
          <Field label="Transaction ID" error={form.formState.errors.transactionId?.message}>
            <Input {...form.register("transactionId")} placeholder="TXN..." />
          </Field>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="payment-screenshot">Upload Payment Screenshot</Label>
        <Input id="payment-screenshot" type="file" accept="image/*" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="hero" disabled={form.formState.isSubmitting}>{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => form.reset()}>Reset</Button>
      </div>
    </form>
  );
}
