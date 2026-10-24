import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

const schema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});

export const Route = createFileRoute("/api/quiz")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { topic, language } = (await request.json()) as { topic: string; language?: string };
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI not configured", { status: 500 });
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        try {
          const result = streamText({
            model: openai.responses("openai/gpt-6-astra"),
            system: `You are JuaCloud AI, an unofficial AZ-900 study buddy for Kenya. Write ONE original multiple-choice practice question (never copy real Microsoft exam questions) based only on the public AZ-900 skills outline, with exactly 4 options (no letter prefixes), the correct option index, and an explanation of exactly 2 sentences that uses a Kenyan example (M-Pesa, matatu, shamba or market). Write in ${language || "English"}.`,
            prompt: `Topic / previous explanation:\n${String(topic).slice(0, 4000)}`,
            output: Output.object({ schema }),
            abortSignal: request.signal,
            providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false } },
          });
          return Response.json(await result.output);
        } catch (e) {
          const status = (e as { statusCode?: number })?.statusCode;
          if (status === 402) return new Response("JuaCloud has run out of AI credits. Top up your Lovable credits to keep quizzing.", { status: 402 });
          return new Response(e instanceof Error ? e.message : "Quiz failed", { status: 502 });
        }
      },
    },
  },
});
