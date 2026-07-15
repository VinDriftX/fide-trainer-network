import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [regNumber, setRegNumber] = useState<string | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-elegant">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold">{t("exams.title")}</h1>
          <p className="text-muted-foreground">{t("exams.subtitle")}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-sm text-muted-foreground">{t("exams.info")}</CardContent>
      </Card>

      {regNumber ? (
        <SuccessCard
          title={t("exams.received")}
          rows={[
            { label: t("exams.regNo"), value: regNumber },
            { label: t("exams.candidate"), value: name },
            { label: t("common.status"), value: t("exams.pendingPayment") },
          ]}
          footer={t("exams.footerNote")}
        />
      ) : (
        <Card><CardContent className="p-6">
          <RegistrantForm
            submitLabel={t("exams.registerButton")}
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
