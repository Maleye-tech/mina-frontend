import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, LockKeyhole, MessageCircle, Send } from "lucide-react";
import { errorMessage } from "../../lib/api";
import { careService } from "../../services/careService";
import type { CareMessage } from "../../types/care";
import { Button } from "../ui/Primitives";
import { EmptyState, ErrorBanner, formatCareDate, formatCareTime } from "./CarePrimitives";

export function ChatWindow({
  role,
  appointmentId,
  canChat,
  canSendMessages,
}: {
  role: "student" | "professional";
  appointmentId: number;
  canChat: boolean;
  canSendMessages: boolean;
}) {
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(canChat);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const next = await careService.getMessages(role, appointmentId);
        setMessages(next);
        setError("");
      } catch (reason) {
        setError(errorMessage(reason));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [role, appointmentId],
  );

  useEffect(() => {
    if (!canChat) return;
    let active = true;
    const refresh = (silent: boolean) => {
      if (active && !document.hidden) void load(silent);
    };
    void load(false);
    const onVisibilityChange = () => {
      if (!document.hidden) void load(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = window.setInterval(() => refresh(true), 7000);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [canChat, load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = body.trim();
    if (!value || sending || !canSendMessages) return;
    setSending(true);
    setError("");
    try {
      const message = await careService.sendMessage(role, appointmentId, value);
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
      setBody("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSending(false);
    }
  };

  if (!canChat) {
    return (
      <EmptyState
        icon={<LockKeyhole size={22} />}
        title="Messagerie verrouillée"
        description="La conversation s’ouvre uniquement après la confirmation du rendez-vous."
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-line bg-white dark:border-white/8 dark:bg-panel">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3 dark:border-white/8">
        <MessageCircle className="text-mina" size={19} />
        <div>
          <h2 className="text-sm font-extrabold text-ink dark:text-white">
            Conversation sécurisée
          </h2>
          <p className="text-[11px] text-slate-400">
            Actualisation automatique toutes les 7 secondes
          </p>
        </div>
      </header>
      <div className="max-h-[420px] min-h-64 space-y-3 overflow-y-auto bg-slate-50/70 p-4 dark:bg-white/[.02]">
        {loading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400"
          >
            <LoaderCircle className="animate-spin" size={18} /> Chargement des messages…
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} />}
            title="Commencer la conversation"
            description="Écris un premier message. Demande toujours le consentement de ton interlocuteur avant d’aborder un sujet personnel."
          />
        ) : (
          messages.map((message) => {
            const mine = message.is_me;
            return (
              <article
                key={message.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-5 ${
                    mine
                      ? "rounded-br-sm bg-mina text-white"
                      : "rounded-bl-sm border border-line bg-white text-ink dark:border-white/10 dark:bg-panel dark:text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <time
                    dateTime={message.created_at ?? undefined}
                    className={`mt-1 block text-[10px] ${mine ? "text-teal-100" : "text-slate-400"}`}
                  >
                    {formatCareDate(message.created_at)} · {formatCareTime(message.created_at)}
                  </time>
                </div>
              </article>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {error && (
        <div className="p-3">
          <ErrorBanner message={error} onRetry={() => void load(true)} />
        </div>
      )}
      <form onSubmit={submit} className="border-t border-line p-3 dark:border-white/8">
        {!canSendMessages && (
          <p className="mb-2 text-xs font-bold text-slate-500">
            La séance est terminée : tu peux consulter l’historique, mais plus envoyer de message.
          </p>
        )}
        <div className="flex items-end gap-2">
          <label className="flex-1">
            <span className="sr-only">Ton message</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={!canSendMessages || sending}
              maxLength={5000}
              rows={2}
              placeholder="Écris un message respectueux…"
              className="max-h-32 min-h-12 w-full resize-y rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none focus:border-mina focus:ring-2 focus:ring-mina/10 disabled:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:disabled:bg-white/[.02]"
            />
          </label>
          <Button
            type="submit"
            loading={sending}
            disabled={!body.trim() || !canSendMessages}
            aria-label="Envoyer le message"
            className="shrink-0 !px-3"
          >
            <Send size={17} />
          </Button>
        </div>
      </form>
    </section>
  );
}
