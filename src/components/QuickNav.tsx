"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, MessageCircle, RefreshCcw, Square, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./QuickNav.module.css";

interface QuickNavProps {
  currentDay?: number;
  userName?: string;
}

const uniqueId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const buildIntro = (userName?: string, currentDay?: number) => {
  const greeting = userName ? `Hola, ${userName}.` : "Hola.";
  const day = currentDay ? ` Hoy es tu día ${currentDay}.` : "";
  return `${greeting}${day} ¿Cómo te sientes?`;
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
  const messagesRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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
    if (!isOpen || !messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [isOpen, messages, status]);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  const closeChat = () => {
    setIsOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

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
    <div className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls="samari-chat-panel"
        aria-label={isOpen ? "Cerrar chat de Samari" : "Abrir chat de Samari"}
      >
        <MessageCircle size={18} aria-hidden="true" />
        Samari
      </button>

      {isOpen && (
        <section
          ref={panelRef}
          id="samari-chat-panel"
          role="dialog"
          aria-labelledby="samari-chat-title"
          tabIndex={-1}
          className={styles.panel}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              closeChat();
            }
          }}
        >
          <header className={styles.header}>
            <h2 id="samari-chat-title">Samari <span>IA</span></h2>
            <button
              type="button"
              onClick={resetChat}
              className={styles.iconButton}
              aria-label="Nueva conversación"
              title="Nueva conversación"
              disabled={isWorking}
            >
              <RefreshCcw size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={closeChat}
              className={styles.iconButton}
              aria-label="Cerrar chat"
              title="Cerrar chat"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div ref={messagesRef} className={styles.messages} role="log" aria-label="Conversación con Samari" aria-live="polite">
            {messages.map((message) => {
              const content = getMessageText(message);
              if (!content) return null;

              return (
                <p
                  key={message.id}
                  className={message.role === "assistant" ? styles.reply : styles.userMessage}
                >
                  <span className="sr-only">{message.role === "assistant" ? "Samari: " : "Tú: "}</span>
                  {content}
                </p>
              );
            })}
            {status === "submitted" && (
              <p className={styles.status} role="status">Samari está escribiendo…</p>
            )}
            {error && (
              <p className={styles.error} role="alert">
                No se pudo obtener una respuesta. Inténtalo de nuevo.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.composer}>
            <div className={styles.inputRow}>
              <label htmlFor="samari-chat-input" className="sr-only">Mensaje para Samari</label>
              <textarea
                id="samari-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    submitMessage(input);
                  }
                }}
                placeholder="Escribe a Samari…"
                maxLength={1500}
                rows={1}
                disabled={isWorking}
              />
              {isWorking ? (
                <button type="button" onClick={() => void stop()} className={styles.sendButton} aria-label="Detener respuesta" title="Detener respuesta">
                  <Square size={16} aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" className={styles.sendButton} aria-label="Enviar mensaje" title="Enviar mensaje" disabled={!input.trim()}>
                  <ArrowUp size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <p className={styles.note}>Para reflexionar. No sustituye atención profesional.</p>
          </form>
        </section>
      )}
    </div>
  );
};

export default QuickNav;
