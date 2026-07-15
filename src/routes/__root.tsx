import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Chatbot } from "@/components/chatbot";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n-provider";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{t("common.pageNotFound")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.pageNotFoundDesc")}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("common.goHome")}</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{t("common.pageDidntLoad")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("common.somethingWrong")}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{t("common.tryAgain")}</button>
          <a href="/" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">{t("common.goHome")}</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FIDE Trainer Network - Global Community of Chess Trainer" },
      { name: "description", content: "Join a global network of FIDE-certified chess trainers, instructors, and educators. Access seminars, exams, and professional development." },
      { property: "og:title", content: "FIDE Trainer Network - Global Community of Chess Trainer" },
      { property: "og:description", content: "Join a global network of FIDE-certified chess trainers, instructors, and educators. Access seminars, exams, and professional development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FIDE Trainer Network - Global Community of Chess Trainer" },
      { name: "twitter:description", content: "Join a global network of FIDE-certified chess trainers, instructors, and educators. Access seminars, exams, and professional development." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0ebe0848-88bb-4585-8661-6ea41c2f98ec/id-preview-2161ee06--7e0e75a8-b271-4b6f-a0ea-76ba9c058fd1.lovable.app-1783932624445.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0ebe0848-88bb-4585-8661-6ea41c2f98ec/id-preview-2161ee06--7e0e75a8-b271-4b6f-a0ea-76ba9c058fd1.lovable.app-1783932624445.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Myanmar:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <div className="flex min-h-screen w-full flex-col">
                  <AppHeader />
                  <main className="flex-1"><Outlet /></main>
                </div>
                <Chatbot />
                <Toaster richColors position="top-right" />
              </SidebarInset>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
