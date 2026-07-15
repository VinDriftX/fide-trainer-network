import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, ShieldCheck, ScrollText, HandCoins } from "lucide-react";
import { SuccessCard } from "@/components/success-card";
import { PaymentMethodPicker, type PaymentMethod } from "@/components/payment-method-picker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/tax-support")({
  head: () => ({
    meta: [
      { title: "Tax Support — FIDE Trainer Network" },
      { name: "description", content: "License application and tax support for FIDE-certified trainers." },
    ],
  }),
  component: TaxSupport,
});

const infoCards = [
  { icon: FileCheck, title: "Simplified Filing", desc: "Guided FIDE Trainer License applications for all certification levels." },
  { icon: ShieldCheck, title: "Compliance Support", desc: "Ensure your trainer activity is compliant with local tax regulations." },
  { icon: ScrollText, title: "Document Templates", desc: "Access official FIDE forms, income declarations, and receipts." },
  { icon: HandCoins, title: "Fee Advice", desc: "Understand license fees, renewal costs, and eligible deductions." },
];

type ServiceType = "first_time" | "yearly";
const PRICING: Record<ServiceType, Record<string, number>> = {
  first_time: { DI: 57, NI: 57, FI: 114, FT: 228, FST: 342 },
  yearly:     { DI: 672, NI: 1200, FI: 1740, FT: 2268, FST: 4008 },
};
const LEVELS = ["DI", "NI", "FI", "FT", "FST"] as const;

function TaxSupport() {
  const { user } = useAuth();
  const [appNumber, setAppNumber] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType>("first_time");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("DI");
  const [method, setMethod] = useState<PaymentMethod>("MMQR");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [form, setForm] = useState({ fideId: "", fullName: "", phone: "", nrc: "", ratingStd: "", ratingRapid: "", ratingBlitz: "" });

  const price = PRICING[serviceType][level];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Tax Support & License</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Apply for or renew your FIDE Trainer License with guided support.</p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {infoCards.map((c) => (
          <Card key={c.title} className="transition hover:-translate-y-1 hover:shadow-elegant">
            <CardHeader>
              <div className="mb-2 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
              <CardTitle className="font-display text-lg">{c.title}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{c.desc}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="font-display text-2xl">License Application</CardTitle></CardHeader>
        <CardContent>
          {appNumber ? (
            <SuccessCard
              title="✅ Application Submitted"
              rows={[
                { label: "Application No.", value: appNumber },
                { label: "Service", value: serviceType === "first_time" ? "First Time Title" : "Yearly Payment" },
                { label: "Level", value: level },
                { label: "Amount", value: `$${price}` },
                { label: "Status", value: "Under review" },
              ]}
              footer="Our team will contact you within 5–7 business days regarding your license."
            />
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const ref = `LIC-${Date.now().toString().slice(-8)}`;
                if (user) {
                  const { error } = await supabase.from("payment_history").insert({
                    user_id: user.id,
                    category: "License Application",
                    description: `${serviceType === "first_time" ? "First Time Title" : "Yearly Payment"} — ${level}`,
                    amount: price,
                    currency: "USD",
                    payment_method: method,
                    reference_id: ref,
                    status: "pending",
                    metadata: { service_type: serviceType, level, paypal_email: paypalEmail, transaction_id: transactionId },
                  });
                  if (error) { toast.error(error.message); return; }
                } else {
                  toast.message("Sign in to save this payment to your history.");
                }
                setAppNumber(ref);
              }}
              className="grid gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label>FIDE ID</Label><Input required value={form.fideId} onChange={(e) => setForm({ ...form, fideId: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Full Name</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>NRC / Passport</Label><Input required value={form.nrc} onChange={(e) => setForm({ ...form, nrc: e.target.value })} /></div>
              </div>

              <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-3">
                <div className="grid gap-1.5"><Label>Standard Rating</Label><Input type="number" value={form.ratingStd} onChange={(e) => setForm({ ...form, ratingStd: e.target.value })} placeholder="1850" /></div>
                <div className="grid gap-1.5"><Label>Rapid Rating</Label><Input type="number" value={form.ratingRapid} onChange={(e) => setForm({ ...form, ratingRapid: e.target.value })} placeholder="1900" /></div>
                <div className="grid gap-1.5"><Label>Blitz Rating</Label><Input type="number" value={form.ratingBlitz} onChange={(e) => setForm({ ...form, ratingBlitz: e.target.value })} placeholder="1950" /></div>
              </div>

              <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Service Type</Label>
                  <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first_time">First Time Title</SelectItem>
                      <SelectItem value="yearly">Yearly Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Trainer Level</Label>
                  <Select value={level} onValueChange={(v) => setLevel(v as typeof LEVELS[number])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>{l} — ${PRICING[serviceType][l]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 rounded-md bg-gold/10 px-4 py-3 text-sm">
                  <div className="font-medium">Total: <span className="font-display text-xl text-secondary">${price}</span></div>
                  <div className="text-xs text-muted-foreground">{serviceType === "first_time" ? "First Time Title fee" : "Annual renewal fee"} for {level}</div>
                </div>
              </div>

              <PaymentMethodPicker
                value={method} onChange={setMethod}
                paypalEmail={paypalEmail} onPaypalEmailChange={setPaypalEmail}
                transactionId={transactionId} onTransactionIdChange={setTransactionId}
                cardNumber={cardNumber} onCardNumberChange={setCardNumber}
              />

              <div className="grid gap-1.5">
                <Label htmlFor="tax-screenshot">Upload Payment Screenshot</Label>
                <Input id="tax-screenshot" type="file" accept="image/*" />
              </div>

              <Button type="submit" variant="hero" className="w-fit">Submit Application</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
