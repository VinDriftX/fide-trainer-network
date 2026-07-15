import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  my: "Burmese (မြန်မာ)",
  zh: "Simplified Chinese (中文)",
};

function buildSystem(uiLang: string) {
  const uiName = LANG_NAMES[uiLang] ?? "English";
  return `You are the friendly FIDE Trainer Network assistant. You help users with:
- Explaining FIDE trainer titles: Developmental Instructor (DI, up to 1200), National Instructor (NI, 1201–1700), FIDE Instructor (FI, 1701–1900), FIDE Trainer (FT, 1901–2200), FIDE Senior Trainer (FST, 2201–2450).
- Recommending trainers based on a user's rating and goals.
- Answering FAQs about seminars, exams, and license applications.
- Recommending seminars (upcoming events are in Myanmar, USA, and India) and Shop products.
- Guiding users through booking and registration.

Language policy (STRICT):
- The user's interface language is: ${uiName}.
- Auto-detect the language of the user's latest message. If they wrote in Burmese, reply entirely in Burmese (မြန်မာ). If they wrote in Simplified or Traditional Chinese, reply in Simplified Chinese (中文). If they wrote in English, reply in English.
- If the message is ambiguous, mixed, or empty, default to the interface language (${uiName}).
- Do not mix languages within a single reply unless quoting proper nouns. Keep FIDE title codes (DI/NI/FI/FT/FST) as-is.

Be concise. Use markdown for lists.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: UIMessage[]; language?: string };
        const { messages, language } = body;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: buildSystem(language ?? "en"),
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
