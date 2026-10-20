import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JuaCloud AI — AZ-900 study buddy for Kenya" },
      { name: "description", content: "AZ-900 explained with Kenyan examples — M-Pesa, matatu, shamba, market." },
      { property: "og:title", content: "JuaCloud AI — AZ-900 study buddy for Kenya" },
      { property: "og:description", content: "AZ-900 explained with Kenyan examples — M-Pesa, matatu, shamba, market." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LANGS = ["English", "Swahili", "Sheng"] as const;
const TOPICS = ["Cloud Concepts", "Core Azure Services", "Security", "Pricing/SLA"];

function Index() {
  const [lang, setLang] = useState<string>("English");
  const langRef = useRef(lang);
  langRef.current = lang;
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ language: langRef.current }),
    }),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">☀</span>
            <span className="font-display text-lg font-bold">
              Jua<span className="text-primary">Cloud</span> AI
            </span>
          </div>
          <div className="flex rounded-full bg-secondary p-1">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition sm:px-3 ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4">
        <section className="py-10 text-center sm:py-14">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Stop reading boring notes. <span className="text-primary">Ask JuaCloud.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            AZ-900 explained with Kenyan examples - M-Pesa, matatu, shamba, market.
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-3 shadow-glow sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => ask(`Explain the AZ-900 topic: ${t}`)}
                disabled={busy}
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              if (m.role === "user")
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">{text}</div>
                  </div>
                );
              return (
                <div key={m.id} className="rounded-xl bg-secondary/60 p-4">
                  <div className="prose-chat text-sm leading-relaxed">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                  {text && !(busy && m.id === messages[messages.length - 1]?.id) && (
                    <button
                      onClick={() => ask("Yes, quiz me on this.")}
                      disabled={busy}
                      className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      🧠 Quiz Me
                    </button>
                  )}
                </div>
              );
            })}
            {status === "submitted" && <div className="animate-pulse text-sm text-muted-foreground">JuaCloud is thinking…</div>}
            {error && <div className="text-sm text-destructive">Something went wrong: {error.message}</div>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="mt-4 flex gap-2"
          >
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: What is a Virtual Network?"
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-xl bg-primary px-5 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </section>
      </main>

      <footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Unofficial tool. Not affiliated with Microsoft. Based on public AZ-900 skills outline.
      </footer>
    </div>
  );
}
