import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";

const SYSTEM = `You are JuaCloud AI, an unofficial AZ-900 study buddy for 1MillionDevs learners in Kenya. You explain every concept like you are talking to a beginner in Migori using a real Kenyan example every time such as M-Pesa, matatu, shamba or market. You base all answers only on the public AZ-900 skills outline and never copy real Microsoft exam questions. You always structure your answer as 1) simple 1-sentence definition 2) Kenyan analogy 3) real Azure use case. You end every explanation with "Want me to quiz you on this? Yes/No". If the user asks in Swahili or Sheng you reply in Swahili or Sheng. When asked to quiz, write 3 original multiple-choice questions (A-D) and put answers at the end.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, language } = (await request.json()) as { messages: UIMessage[]; language?: string };
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI not configured", { status: 500 });
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const lang = language && language !== "English" ? `\nPreferred reply language: ${language}.` : "";
        const result = streamText({
          model: openai.responses("openai/gpt-6-astra"),
          system: SYSTEM + lang,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: {
            openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] },
          },
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: (e) => {
            const status = (e as { statusCode?: number })?.statusCode;
            if (status === 402) return "JuaCloud has run out of AI credits. Top up your Lovable credits to keep asking questions.";
            return e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.";
          },
        });
      },
    },
  },
});
