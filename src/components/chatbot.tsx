import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/chess-mascot.png";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Re-seed greeting on language change
  useEffect(() => {
    setMessages([{ role: "assistant", content: t("chatbot.greeting") }]);
  }, [i18n.language, t]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: i18n.language,
          messages: next.map((m, i) => ({
            id: `m${i}`,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "text-delta" && typeof parsed.delta === "string") {
              assistant += parsed.delta;
              setMessages((m) => { const copy = [...m]; copy[copy.length - 1] = { role: "assistant", content: assistant }; return copy; });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("chatbot.error") }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant transition hover:scale-110"
        aria-label={t("chatbot.openLabel")}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[540px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border bg-card shadow-elegant animate-scale-in">
          <div className="flex items-center gap-3 border-b bg-primary p-3 text-primary-foreground">
            <img src={mascot} alt="" className="h-10 w-10 shrink-0" width={40} height={40} />
            <div className="min-w-0">
              <div className="truncate font-display font-bold">{t("chatbot.companion")}</div>
              <div className="truncate text-xs opacity-80">{t("chatbot.languages")}</div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[85%] whitespace-pre-wrap text-sm text-foreground"}>
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />{t("chatbot.thinking")}</div>
            )}
          </div>
          <div className="flex items-end gap-2 border-t p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t("chatbot.placeholder")}
              rows={1}
              className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="icon" onClick={send} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
