import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  examScore: z.number().min(0).max(1000),
  fideRating: z.number().min(0).max(3500),
  goal: z.string().max(500).optional(),
});

const AdviceSchema = z.object({
  recommendedTitle: z.string(),
  matchScore: z.number(),
  explanation: z.string(),
  strengths: z.array(z.string()),
  areasToImprove: z.array(z.string()),
  nextSteps: z.array(z.string()),
  suggestedSeminars: z.array(z.string()),
  suggestedTrainers: z.array(z.string()),
});

export type CareerAdvice = z.infer<typeof AdviceSchema>;

const SYSTEM = `You are an AI Career Advisor for the FIDE Trainer Network. Recommend a trainer title using BOTH the seminar Exam Score and FIDE Rating.

Title thresholds:
- DI: Exam 200-399, no rating requirement
- NI: Exam 400-599, minimum rating 1700
- FI: Exam 600-799, minimum rating 2000
- FT: Exam 800-1000, minimum rating 2300
- FST: Awarded by merit, rating 2450+

Rules:
- The user must meet BOTH the exam range AND the minimum rating for a title. If exam qualifies but rating is below, recommend the highest qualifying tier and explain the gap.
- matchScore is 0-100 reflecting how well the user fits the recommended title.
- Reference upcoming seminars (Yangon, New York, Chennai) and typical trainer profiles (GM/IM/FT coaches).
- Be encouraging, concise, and specific. Use plain language.`;

export const getCareerAdvice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `Exam Score: ${data.examScore}/1000
FIDE Rating: ${data.fideRating}
Goal: ${data.goal ?? "Become a certified FIDE trainer"}

Return JSON with fields: recommendedTitle, matchScore (0-100), explanation, strengths (list), areasToImprove (list), nextSteps (list), suggestedSeminars (list), suggestedTrainers (list). Keep each list to 2-4 short bullet strings.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt,
        output: Output.object({ schema: AdviceSchema }),
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          return AdviceSchema.parse(JSON.parse(error.text ?? "{}"));
        } catch {
          throw new Error("The AI returned an unexpected response. Please try again.");
        }
      }
      throw error;
    }
  });
