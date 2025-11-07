"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  X,
  Sparkles,
  Send,
  Loader2,
  RefreshCcw,
  Lightbulb,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

interface QuickNavProps {
  currentDay?: number;
  userName?: string;
}

const SUGGESTIONS = [
  "Que arquetipo puedo trabajar hoy?",
  "Ayudame a crear una intencion para mi ritual",
  "Recuentame como alinear mi energia con la luna",
  "Necesito un respiro consciente ahora mismo",
];

const uniqueId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const buildIntro = (userName?: string, currentDay?: number) => {
  const greeting = userName ? `Hola ${userName}, soy Samari.` : "Hola, soy Samari.";
  const cycleNote = currentDay
    ? ` Hoy acompanio tu dia ${currentDay} del ciclo.`
    : " Estoy aqui para guiar tu camino ciclico.";
  return `${greeting}${cycleNote} Preguntame lo que necesites y elaborare una guia personalizada.`;
};

const createAssistantMessage = (content: string): ChatMessage => ({
  id: uniqueId(),
  role: "assistant",
  content,
  timestamp: new Date().toISOString(),
});

const createUserMessage = (content: string): ChatMessage => ({
  id: uniqueId(),
  role: "user",
  content,
  timestamp: new Date().toISOString(),
});

const QuickNav = ({ currentDay, userName }: QuickNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createAssistantMessage(buildIntro(userName, currentDay)),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const introMessage = useMemo(
    () => createAssistantMessage(buildIntro(userName, currentDay)),
    [userName, currentDay]
  );

  useEffect(() => {
    setMessages((prev) => {
      const onlyIntro = prev.length === 1 && prev[0].role === "assistant";
      return onlyIntro ? [introMessage] : prev;
    });
  }, [introMessage]);

  useEffect(() => {
    if (!isOpen || !bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createUserMessage(trimmed);
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
          context: { currentDay, userName },
        }),
      });

      if (!response.ok) {
        throw new Error("Respuesta no valida");
      }

      const data = await response.json();
      if (!data.reply) {
        throw new Error("Respuesta vacia");
      }

      setMessages((prev) => [...prev, createAssistantMessage(data.reply)]);
    } catch (err) {
      console.error("chat error", err);
      setError("No pude conectar con el oraculo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      sendMessage(input);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    if (loading) return;
    setInput(suggestion);
    sendMessage(suggestion);
  };

  const resetChat = () => {
    setMessages([createAssistantMessage(buildIntro(userName, currentDay))]);
    setInput("");
    setError(null);
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-3 text-rose-600 shadow-lg ring-1 ring-rose-100 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        aria-expanded={isOpen}
        aria-controls="samari-chat-panel"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{isOpen ? "Cerrar guia" : "Habla con Samari"}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="samari-chat-panel"
            className="absolute bottom-16 right-0 w-[320px] sm:w-[360px] rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-2xl backdrop-blur"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-3 flex items-start justify-between gap-4 border-b border-rose-100 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-rose-400">
                  Chat sagrado
                </p>
                <p className="flex items-center gap-2 text-lg font-semibold text-rose-700">
                  <Sparkles className="h-4 w-4" />
                  Samari guia
                </p>
                <p className="text-xs text-rose-500">
                  {currentDay
                    ? `Dia ${currentDay} del ciclo`
                    : "Disponible para tu ciclo"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-full border border-rose-200 p-1 text-rose-500 hover:bg-rose-50"
                  aria-label="Reiniciar chat"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-rose-200 p-1 text-rose-500 hover:bg-rose-50"
                  aria-label="Cerrar chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl border px-3 py-2 text-sm leading-relaxed ${
                    message.role === "assistant"
                      ? "self-start border-rose-100 bg-rose-50/80 text-rose-900"
                      : "self-end border-rose-200 bg-white text-rose-700"
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-rose-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Samari esta escribiendo...
                </div>
              )}

              {error && (
                <p className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-rose-600">
                  {error}
                </p>
              )}
              <div ref={bottomRef} />
            </div>

            {!loading && (
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="flex items-center gap-1 rounded-full border border-rose-100 px-3 py-1 text-xs text-rose-600 transition hover:bg-rose-50"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <label htmlFor="samari-chat-input" className="sr-only">
                Escribe tu mensaje
              </label>
              <input
                id="samari-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Comparte lo que sientes..."
                className="flex-1 rounded-2xl border border-rose-200 px-3 py-2 text-sm text-rose-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                disabled={loading}
              />
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-white shadow focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickNav;
