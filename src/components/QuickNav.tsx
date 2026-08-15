"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  CircleStop,
  Lightbulb,
  Loader2,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface QuickNavProps {
  currentDay?: number;
  userName?: string;
}

const SUGGESTIONS = [
  "¿Qué necesita mi energía hoy?",
  "Ayúdame a ver un patrón en mis registros",
  "Crea una intención breve para mi ritual",
  "Necesito una pausa consciente ahora",
];

const uniqueId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const buildIntro = (userName?: string, currentDay?: number) => {
  const greeting = userName ? `Hola, ${userName}. Soy Samari.` : "Hola, soy Samari.";
  const cycleNote = currentDay
    ? ` Estoy leyendo contigo el día ${currentDay} de tu ciclo.`
    : " Estoy aquí para acompañar tu camino cíclico.";

  return `${greeting}${cycleNote} Puedes traerme una emoción, una pregunta o algo que se esté repitiendo.`;
};

const createIntroMessage = (userName?: string, currentDay?: number): UIMessage => ({
  id: uniqueId(),
  role: "assistant",
  parts: [{ type: "text", text: buildIntro(userName, currentDay) }],
});

const getMessageText = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

const QuickNav = ({ currentDay, userName }: QuickNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const introMessage = useMemo(
    () => createIntroMessage(userName, currentDay),
    [currentDay, userName],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages }) => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const headers = new Headers();

          if (session?.access_token) {
            headers.set("Authorization", `Bearer ${session.access_token}`);
          }

          return {
            body: { messages },
            headers,
          };
        },
      }),
    [],
  );

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    clearError,
    stop,
  } = useChat({
    id: "samari-cycle-guide",
    messages: [introMessage],
    transport,
    throttle: 40,
  });

  const isWorking = status === "submitted" || status === "streaming";

  useEffect(() => {
    setMessages((previous) => {
      const isOnlyIntro =
        previous.length === 1 && previous[0]?.role === "assistant";
      return isOnlyIntro ? [introMessage] : previous;
    });
  }, [introMessage, setMessages]);

  useEffect(() => {
    if (!isOpen || !bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, messages, status]);

  const submitMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isWorking) return;

    clearError();
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(input);
  };

  const resetChat = () => {
    void stop();
    clearError();
    setMessages([createIntroMessage(userName, currentDay)]);
    setInput("");
  };

  return (
    <motion.div
      className="fixed bottom-[calc(var(--nav-height)+1.25rem+env(safe-area-inset-bottom))] right-3 z-40 sm:bottom-[calc(var(--nav-height)+1.75rem+env(safe-area-inset-bottom))] sm:right-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <motion.button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className="glass flex min-h-11 items-center gap-2 rounded-full px-4 py-3 font-semibold text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        aria-expanded={isOpen}
        aria-controls="samari-chat-panel"
        aria-label={isOpen ? "Cerrar guía de Samari" : "Abrir guía de Samari"}
      >
        <span className="relative">
          <Sparkles className="h-5 w-5" />
          {!isOpen && (
            <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          )}
        </span>
        <span>{isOpen ? "Cerrar guía" : "Habla con Samari"}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="samari-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="samari-chat-title"
            className="glass-shell absolute bottom-16 right-0 flex max-h-[min(680px,calc(100svh-var(--nav-height)-7rem))] w-[min(390px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[28px] border border-white/65 shadow-[0_24px_80px_rgba(94,32,57,0.22)]"
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 14 }}
            transition={{ duration: 0.22 }}
          >
            <header className="border-b border-white/55 bg-gradient-to-br from-rose-100/80 via-white/35 to-amber-50/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-pink-700 text-white shadow-lg shadow-rose-300/40">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-rose-400">
                      Guía cíclica con IA
                    </p>
                    <h2
                      id="samari-chat-title"
                      className="font-[family-name:var(--font-display)] text-xl font-semibold text-rose-950"
                    >
                      Samari
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={resetChat}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/45 text-rose-600 transition hover:bg-white/80"
                    aria-label="Iniciar una conversación nueva"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/45 text-rose-600 transition hover:bg-white/80"
                    aria-label="Cerrar chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                {currentDay && (
                  <span className="rounded-full bg-white/55 px-2.5 py-1">Día {currentDay}</span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1">
                  <ShieldCheck className="h-3 w-3" />
                  contexto privado
                </span>
                <span className="rounded-full bg-white/55 px-2.5 py-1">memoria reciente</span>
              </div>
            </header>

            <div
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
            >
              {messages.map((message) => {
                const content = getMessageText(message);
                if (!content) return null;

                return (
                  <motion.div
                    key={message.id}
                    className={`max-w-[88%] rounded-[20px] border px-3.5 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "assistant"
                        ? "self-start rounded-bl-md border-rose-100/80 bg-rose-50/78 text-rose-950"
                        : "self-end rounded-br-md border-rose-500/20 bg-gradient-to-br from-rose-500 to-pink-600 text-white"
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message.role === "assistant" && (
                      <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-[0.18em] text-rose-400">
                        Samari
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{content}</p>
                  </motion.div>
                );
              })}

              {status === "submitted" && (
                <div className="flex items-center gap-2 text-xs text-rose-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Leyendo tu momento y tus registros…
                </div>
              )}

              {status === "streaming" && (
                <button
                  type="button"
                  onClick={() => void stop()}
                  className="flex min-h-11 w-fit items-center gap-2 rounded-full border border-rose-200 bg-white/60 px-3 text-xs font-semibold text-rose-600"
                >
                  <CircleStop className="h-4 w-4" />
                  Detener respuesta
                </button>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/85 px-3 py-2 text-xs leading-relaxed text-red-700">
                  Samari no pudo responder ahora. Revisa tu conexión e inténtalo de nuevo.
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && !isWorking && (
              <div className="border-t border-white/55 px-4 py-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-rose-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Puedes comenzar por aquí
                </p>
                <div className="grid gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="min-h-11 rounded-2xl border border-white/70 bg-white/45 px-3 py-2 text-left text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-white/80"
                      onClick={() => submitMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-white/60 bg-white/38 p-3">
              <div className="flex gap-2">
                <label htmlFor="samari-chat-input" className="sr-only">
                  Escribe tu mensaje para Samari
                </label>
                <textarea
                  id="samari-chat-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, 1_500))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitMessage(input);
                    }
                  }}
                  placeholder="Comparte lo que estás sintiendo…"
                  className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-white/70 bg-white/70 px-3.5 py-3 text-sm text-rose-900 placeholder:text-rose-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  rows={1}
                  disabled={isWorking}
                />
                <button
                  type="submit"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-300/35 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Enviar mensaje"
                  disabled={!input.trim() || isWorking}
                >
                  {isWorking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] leading-relaxed text-rose-400">
                Samari acompaña tu reflexión; no sustituye atención médica o psicológica.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickNav;
