import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM = `You are the friendly FIDE Trainer Network assistant. You help users with:
- Explaining FIDE trainer titles: Developmental Instructor (DI, up to 1200), National Instructor (NI, 1201–1700), FIDE Instructor (FI, 1701–1900), FIDE Trainer (FT, 1901–2200), FIDE Senior Trainer (FST, 2201–2450).
- Recommending trainers based on a user's rating and goals.
- Answering FAQs about seminars, exams, and license applications.
- Recommending seminars (upcoming events are in Myanmar, USA, and India) and Shop products.
- Guiding users through booking and registration.

Reply concisely in English by default. If the user writes in Burmese (မြန်မာ), reply in Burmese. Use markdown for lists.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("openai/gpt-5.5"),
          system: SYSTEM,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
