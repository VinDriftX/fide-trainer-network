import { useEffect, type ReactNode } from "react";
import "@/lib/i18n";
import i18n from "@/lib/i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const onChange = (lng: string) => { document.documentElement.lang = lng; };
    i18n.on("languageChanged", onChange);
    return () => { i18n.off("languageChanged", onChange); };
  }, []);
  return <>{children}</>;
}
