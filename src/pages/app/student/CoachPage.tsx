import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  Brain,
  ChevronRight,
  LoaderCircle,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { coachesService } from "../../../services/coachesService";
import { chatService } from "../../../services/chatService";
import { errorMessage } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import type { Coach } from "../../../types/coach";
import { lastMessageText, type ChatMessage, type Conversation } from "../../../types/chat";

export function CoachPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [coachList, convList] = await Promise.allSettled([
        coachesService.list().catch(() => []),
        chatService.listConversations({ type: "coach" }).catch(() => []),
      ]);

      if (coachList.status === "fulfilled") {
        setCoaches(coachList.value);
      }
      if (convList.status === "fulfilled") {
        const convs = convList.value;
        setConversations(convs);
        if (convs.length > 0 && !activeConv) {
          setActiveConv(convs[0]);
        }
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [activeConv]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMessages = useCallback(async (convId: number) => {
    setMessagesLoading(true);
    try {
      const msgs = await chatService.listMessages(convId);
      setMessages(msgs);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      void loadMessages(activeConv.id);
    }
  }, [activeConv, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartConversation = async (coach?: Coach) => {
    setSending(true);
    try {
      const newConv = await chatService.createConversation({
        title: coach ? `Session avec ${coach.name}` : "Conseils d’études Mina",
        type: "coach",
        recipient_id: coach?.id,
      });
      setConversations((prev) => [newConv, ...prev]);
      setActiveConv(newConv);
      setMessages([]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");

    if (!activeConv) {
      // Create conv first
      setSending(true);
      try {
        const conv = await chatService.createConversation({
          title: "Conseils d’études Mina",
          type: "coach",
          initial_message: text,
        });
        setConversations((prev) => [conv, ...prev]);
        setActiveConv(conv);
        setMessages([
          {
            id: Date.now(),
            conversation_id: conv.id,
            is_me: true,
            sender_name: currentUser?.name ?? "Moi",
            body: text,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setSending(false);
      }
      return;
    }

    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: activeConv.id,
      is_me: true,
      sender_name: currentUser?.name ?? "Moi",
      body: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const savedMsg = await chatService.sendMessage(activeConv.id, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? savedMsg : m)),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coach IA & Copilote"
        title="Ton copilote d’études Mina"
        description="Pose tes questions médicales, perfectionne ta méthode de révision et analyse tes blocages."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleStartConversation()}
            disabled={sending}
          >
            <Plus size={14} className="mr-1.5" />
            Nouvelle session
          </Button>
        }
      />

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column: Coaches / Past Conversations */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Coaches disponibles
            </h3>
            <div className="mt-3 space-y-2">
              {coaches.length === 0 ? (
                <div
                  onClick={() => void handleStartConversation()}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-line p-3 transition hover:border-mina dark:border-white/10"
                >
                  <div className="rounded-lg bg-mina/10 p-2 text-mina">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold">Mina AI Coach</p>
                    <p className="text-[10px] text-slate-400">Tuteur intelligent 24/7</p>
                  </div>
                </div>
              ) : (
                coaches.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => void handleStartConversation(c)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-line p-3 transition hover:border-mina dark:border-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-mina/10 p-2 text-mina">
                        <Bot size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.specialty ?? "Coach Mina"}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Historique des échanges
            </h3>
            <div className="mt-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-3">
                  Aucune conversation archivée
                </p>
              ) : (
                conversations.map((conv) => {
                  const preview = lastMessageText(conv);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        activeConv?.id === conv.id
                          ? "border-mina bg-mina/5 dark:bg-mina/10"
                          : "border-line hover:border-slate-300 dark:border-white/10"
                      }`}
                    >
                      <p className="text-xs font-extrabold truncate">
                        {conv.title ?? `Conversation #${conv.id}`}
                      </p>
                      {preview && (
                        <p className="mt-1 text-[11px] text-slate-400 truncate">
                          {preview}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[600px] p-0 overflow-hidden">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-tr from-mina to-teal-400 p-2 text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold">
                    {activeConv?.title ?? "Mina Copilote IA"}
                  </h3>
                  <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                    En ligne · Prêt à t’aider
                  </p>
                </div>
              </div>
              <Badge tone="teal">Connecté</Badge>
            </div>

            {/* Chat Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-panel/40"
            >
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderCircle size={24} className="animate-spin text-mina" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="rounded-2xl bg-mina/10 p-3 text-mina">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="text-sm font-extrabold">Que souhaites-tu travailler aujourd’hui ?</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Pose une question sur une pathologie, un traitement, ou demande une explication détaillée d'un mécanisme biologique.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {[
                      "Explique-moi l'insuffisance cardiaque",
                      "Méthode pour retenir les antibiotiques",
                      "Conseils pour gérer le stress avant l'épreuve",
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputText(prompt)}
                        className="rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-mina dark:border-white/10 dark:bg-panel dark:text-slate-300"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.is_me ?? m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div className="flex-shrink-0 rounded-xl bg-mina/10 p-2 text-mina h-8 w-8 flex items-center justify-center">
                          <Bot size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isMe
                            ? "bg-mina text-white rounded-br-sm"
                            : "bg-white border border-line text-slate-800 dark:border-white/10 dark:bg-panel dark:text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        <p>{m.body}</p>
                        <span
                          className={`mt-1.5 block text-[9px] font-bold ${
                            isMe ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {m.created_at
                            ? new Date(m.created_at).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      {isMe && (
                        <div className="flex-shrink-0 rounded-xl bg-slate-200 p-2 text-slate-700 h-8 w-8 flex items-center justify-center dark:bg-white/10 dark:text-slate-300">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-line p-3 dark:border-white/10 bg-white dark:bg-panel"
            >
              <input
                type="text"
                placeholder="Pose ta question au coach Mina…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                className="flex-1 rounded-xl border border-line bg-transparent px-4 py-2.5 text-xs font-semibold outline-none focus:border-mina dark:border-white/10"
              />
              <Button type="submit" variant="primary" size="sm" disabled={!inputText.trim() || sending}>
                {sending ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
