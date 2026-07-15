import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode } from "lucide-react";

export const paymentMethods = ["MMQR", "PayPal", "Mobile Banking", "MPU"] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const KBZ_ACCOUNT = "12345678901234567";
export const AYA_ACCOUNT = "98765432109876543";

export function PaymentMethodPicker({
  value, onChange, paypalEmail, onPaypalEmailChange, transactionId, onTransactionIdChange,
  cardNumber, onCardNumberChange,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  paypalEmail: string;
  onPaypalEmailChange: (v: string) => void;
  transactionId: string;
  onTransactionIdChange: (v: string) => void;
  cardNumber: string;
  onCardNumberChange: (v: string) => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=MMQR-FTN-PAYMENT-${KBZ_ACCOUNT}`;

  return (
    <div className="grid gap-3">
      <Label>Payment Method</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => {
          const m = v as PaymentMethod;
          onChange(m);
          if (m === "MMQR") setQrOpen(true);
        }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {paymentMethods.map((m) => (
          <label key={m} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-card p-3 text-sm transition hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value={m} />{m}
          </label>
        ))}
      </RadioGroup>

      {value === "MMQR" && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div className="text-sm">
            <div className="font-medium">MMQR Payment</div>
            <div className="text-muted-foreground">Scan the QR code with your MMQR-enabled banking app.</div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-1 h-4 w-4" />View QR
          </Button>
        </div>
      )}

      {value === "PayPal" && (
        <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>PayPal Email</Label>
            <Input type="email" value={paypalEmail} onChange={(e) => onPaypalEmailChange(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="grid gap-1.5">
            <Label>Transaction ID</Label>
            <Input value={transactionId} onChange={(e) => onTransactionIdChange(e.target.value)} placeholder="TXN..." />
          </div>
        </div>
      )}

      {value === "Mobile Banking" && (
        <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
          <div className="font-medium">Transfer to one of these accounts:</div>
          <div className="grid gap-1 font-mono text-base tracking-wider">
            <div><span className="text-muted-foreground text-xs font-sans mr-2">KBZ Bank:</span>{KBZ_ACCOUNT}</div>
            <div><span className="text-muted-foreground text-xs font-sans mr-2">AYA Bank:</span>{AYA_ACCOUNT}</div>
          </div>
          <div className="text-xs text-muted-foreground">After transfer, upload the payment screenshot below.</div>
        </div>
      )}

      {value === "MPU" && (
        <div className="grid gap-1.5 rounded-lg border bg-muted/30 p-4">
          <Label>Credit Card Number</Label>
          <Input
            inputMode="numeric"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => onCardNumberChange(e.target.value.replace(/[^\d ]/g, ""))}
            placeholder="•••• •••• •••• ••••"
          />
          <p className="text-xs text-muted-foreground">Your MPU card will be charged after submission.</p>
        </div>
      )}

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan MMQR to Pay</DialogTitle>
            <DialogDescription>Open your bank app and scan this QR code to complete payment.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img src={qrUrl} alt="MMQR payment QR code" width={280} height={280} className="rounded-lg border bg-white p-2" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
