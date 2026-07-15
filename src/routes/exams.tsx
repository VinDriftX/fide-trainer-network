import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { RegistrantForm } from "@/components/registrant-form";
import { SuccessCard } from "@/components/success-card";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Exams — FIDE Trainer Network" },
      { name: "description", content: "Register for the FIDE trainer certification examinations." },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const [regNumber, setRegNumber] = useState<string | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">Exam Registration</h1>
          <p className="text-muted-foreground">Register for the FIDE Trainer Certification Exam.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-sm text-muted-foreground">
          The FIDE trainer certification exam evaluates your knowledge of chess theory, pedagogy, and tournament rules. Exams follow each seminar by one week. Complete the form below and upload your payment confirmation to secure your seat.
        </CardContent>
      </Card>

      {regNumber ? (
        <SuccessCard
          title="✅ Exam Registration Received"
          rows={[
            { label: "Registration No.", value: regNumber },
            { label: "Candidate", value: name },
            { label: "Status", value: "Pending payment verification" },
          ]}
          footer="You will receive an email with exam scheduling details within 3 business days."
        />
      ) : (
        <Card><CardContent className="p-6">
          <RegistrantForm
            submitLabel="Register"
            onSubmit={async (v) => {
              setName(v.fullName);
              setRegNumber(`EXAM-${Date.now().toString().slice(-8)}`);
            }}
          />
        </CardContent></Card>
      )}
    </div>
  );
}
