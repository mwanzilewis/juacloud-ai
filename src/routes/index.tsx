import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sun, Send, History, X, Menu, Cloud, Server, ShieldCheck, Receipt, Network, Gauge, Layers,
  Brain, CheckCircle2, XCircle, Loader2, Trash2, Languages, MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
const TOPICS = [
  { label: "Cloud Concepts", icon: Cloud },
  { label: "Core Azure Services", icon: Server },
  { label: "Security", icon: ShieldCheck },
  { label: "Pricing/SLA", icon: Receipt },
];
const EXAMPLES = [
  { label: "Explain VNet", q: "Explain Azure Virtual Network (VNet)", icon: Network },
  { label: "What is SLA?", q: "What is an SLA in Azure?", icon: Gauge },
  { label: "Difference between IaaS, PaaS, SaaS", q: "What is the difference between IaaS, PaaS and SaaS?", icon: Layers },
];

type HistoryRow = { id: string; question: string; created_at: string };
type Quiz = { question: string; options: string[]; correctIndex: number; explanation: string };

function getDeviceId() {
  let id = localStorage.getItem("juacloud-device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("juacloud-device", id);
  }
  return id;
}

function Index() {
  const [lang, setLang] = useState<string>("English");
  const langRef = useRef(lang);
  langRef.current = lang;
  const [input, setInput] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const deviceRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat", body: () => ({ language: langRef.current }) }),
  });
  const busy = status === "submitted" || status === "streaming";

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from("chat_history")
      .select("id, question, created_at")
      .eq("device_id", deviceRef.current)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory(data ?? []);
  }, []);

  useEffect(() => {
    deviceRef.current = getDeviceId();
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const ask = async (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
    setSidebar(false);
    inputRef.current?.focus();
    const { error } = await supabase.from("chat_history").insert({ device_id: deviceRef.current, question: text.trim() });
    if (error) console.error("History save failed", error);
    else loadHistory();
  };

  const clearHistory = async () => {
    await supabase.from("chat_history").delete().eq("device_id", deviceRef.current);
    setHistory([]);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      {sidebar && <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebar(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="flex items-center gap-2 font-display text-base font-bold">
            <History className="h-5 w-5 text-primary" /> History
          </h2>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button onClick={clearHistory} aria-label="Clear history" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => setSidebar(false)} aria-label="Close history" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {history.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Your questions will appear here.</p>
          ) : (
            history.map((h) => (
              <button
                key={h.id}
                onClick={() => ask(h.question)}
                disabled={busy}
                className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/90 transition hover:bg-secondary disabled:opacity-50"
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{h.question}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebar(true)} aria-label="Open history" className="rounded-lg p-2 hover:bg-secondary lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <Sun className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold leading-none">
                Jua<span className="text-primary">Cloud</span> AI
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
              <Languages className="ml-1.5 hidden h-4 w-4 text-muted-foreground sm:block" />
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
                    lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "English" ? "EN" : l === "Swahili" ? "SW" : "Sheng"}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-3 sm:px-4">
          <section className="px-2 py-8 text-center sm:py-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Cloud className="h-3.5 w-3.5" /> AZ-900 study buddy
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
              Stop reading boring notes. <span className="text-primary">Ask JuaCloud.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
              AZ-900 explained with Kenyan examples - M-Pesa, matatu, shamba, market.
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-3 shadow-glow sm:p-5">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Try an example</p>
            <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
              {EXAMPLES.map(({ label, q, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => ask(q)}
                  disabled={busy}
                  className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-sm font-medium transition hover:border-primary/50 disabled:opacity-50"
                >
                  <Icon className="h-4 w-4 text-primary" /> {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {messages.map((m) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                if (m.role === "user")
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">{text}</div>
                    </div>
                  );
                const streaming = busy && m.id === messages[messages.length - 1]?.id;
                return (
                  <div key={m.id} className="flex gap-2.5">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Sun className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="prose-chat text-sm leading-relaxed">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                      {text && !streaming && <QuizCard topic={text} language={lang} />}
                    </div>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> JuaCloud is thinking…
                </div>
              )}
              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Something went wrong: {error.message}</div>}
              <div ref={endRef} />
            </div>

            <p className="mb-2 mt-5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topics</p>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {TOPICS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => ask(`Explain the AZ-900 topic: ${label}`)}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex gap-2 rounded-2xl border border-input bg-background p-1.5 focus-within:border-primary"
            >
              <input
                ref={inputRef}
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask: What is a Virtual Network?"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Ask</span>
              </button>
            </form>
          </section>
        </main>

        <footer className="mt-10 border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Unofficial tool. Not affiliated with Microsoft. Based on public AZ-900 skills outline.
        </footer>
      </div>
    </div>
  );
}

function QuizCard({ topic, language }: { topic: string; language: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [picked, setPicked] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setErr("");
    setPicked(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, language }),
      });
      if (!res.ok) throw new Error(await res.text());
      setQuiz(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not make a quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!quiz)
    return (
      <div className="mt-3">
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {loading ? "Making your question…" : "Quiz Me"}
        </button>
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
      </div>
    );

  return (
    <div className="mt-4 rounded-2xl border border-primary/30 bg-secondary/60 p-4">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
        <Brain className="h-3.5 w-3.5" /> Practice question
      </p>
      <p className="mb-3 text-sm font-semibold">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((o, i) => {
          const correct = i === quiz.correctIndex;
          const state = picked === null ? "idle" : correct ? "correct" : picked === i ? "wrong" : "idle";
          return (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => setPicked(i)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                state === "correct"
                  ? "border-success bg-success/15"
                  : state === "wrong"
                    ? "border-destructive bg-destructive/15"
                    : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-secondary text-xs font-bold">{"ABCD"[i]}</span>
              <span className="flex-1">{o}</span>
              {state === "correct" && <CheckCircle2 className="h-4 w-4 text-success" />}
              {state === "wrong" && <XCircle className="h-4 w-4 text-destructive" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 rounded-xl bg-card p-3 text-sm">
          <p className={`font-bold ${picked === quiz.correctIndex ? "text-success" : "text-destructive"}`}>
            {picked === quiz.correctIndex ? "Correct! 🎉" : `Not quite — the answer is ${"ABCD"[quiz.correctIndex]}.`}
          </p>
          <p className="mt-1 text-muted-foreground">{quiz.explanation}</p>
          <button onClick={load} disabled={loading} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />} Another question
          </button>
        </div>
      )}
    </div>
  );
}
