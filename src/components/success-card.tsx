import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SuccessCard({ title, rows, footer }: {
  title: string;
  rows: { label: string; value: React.ReactNode }[];
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border-primary bg-primary/5 p-6 shadow-elegant animate-scale-in">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl font-bold text-primary">{title}</h3>
      </div>
      <dl className="grid gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[140px_1fr] gap-2 border-b border-primary/10 py-1.5 last:border-0 sm:grid-cols-[180px_1fr]">
            <dt className="font-medium text-muted-foreground">{r.label}</dt>
            <dd className="font-medium text-foreground break-words">{r.value}</dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-4 text-sm text-muted-foreground">{footer}</div>}
    </Card>
  );
}
