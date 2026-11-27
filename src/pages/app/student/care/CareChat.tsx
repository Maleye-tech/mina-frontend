import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Flag,
  HeartHandshake,
  LoaderCircle,
  Lock,
  MessageCircle,
  Plus,
  Send,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";
import { chatService } from "../../../../services/chatService";
import { errorMessage } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { toast } from "../../../../store/toastStore";
import { lastMessageText, type ChatMessage, type Conversation } from "../../../../types/chat";

export function CareChat() {
  const currentUser = useAuthStore((s) => s.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ambassador modal
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [ambassadorTopic, setAmbassadorTopic] = useState("Soutien méthodologique & moral");
  const [ambassadorNotes, setAmbassadorNotes] = useState("");
  const [requestingAmbassador, setRequestingAmbassador] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await chatService.listConversations({ type: "care" });
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [activeConv]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

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

  const handleStartConversation = async () => {
    setSending(true);
    try {
      const newConv = await chatService.createConversation({
        title: "Écoute & Soutien confidentiel",
        type: "care",
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

  const handleRequestAmbassador = async (e: FormEvent) => {
    e.preventDefault();
    setRequestingAmbassador(true);
    try {
      const res = await chatService.requestAmbassador({
        topic: ambassadorTopic,
        notes: ambassadorNotes.trim() || undefined,
      });
      toast.success(res.message || "Demande d'ambassadeur envoyée !");
      setShowAmbassadorModal(false);
      setAmbassadorNotes("");
      await loadConversations();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRequestingAmbassador(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText("");

    if (!activeConv) {
      setSending(true);
      try {
        const conv = await chatService.createConversation({
          title: "Écoute & Soutien confidentiel",
          type: "care",
          initial_message: text,
        });
        setConversations((prev) => [conv, ...prev]);
        setActiveConv(conv);
        setMessages([
          {
            id: Date.now(),
            conversation_id: conv.id,
            is_me: true,
            sender_name: currentUser?.pseudonym ?? "Moi",
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

    const optimistic: ChatMessage = {
      id: Date.now(),
      conversation_id: activeConv.id,
      is_me: true,
      sender_name: currentUser?.pseudonym ?? "Moi",
      body: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setSending(true);

    try {
      const savedMsg = await chatService.sendMessage(activeConv.id, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? savedMsg : m)),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!activeConv || !confirm("Supprimer ce message ?")) return;
    try {
      await chatService.deleteMessage(activeConv.id, msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      toast.success("Message supprimé.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleReportMessage = async (msgId: number) => {
    if (!activeConv) return;
    const reason = prompt("Indique la raison du signalement (propos déplacés, urgence, etc.) :");
    if (!reason) return;
    try {
      const res = await chatService.reportMessage(activeConv.id, msgId, reason);
      toast.success(res.message || "Message signalé à la cellule Mina.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold flex items-center gap-2">
            <HeartHandshake className="text-care" size={20} />
            Espace d'écoute & Chat confidentiel
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Échange de manière sécurisée et anonyme avec nos professionnels et ambassadeurs santé.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAmbassadorModal(true)}
          >
            <Users size={14} className="mr-1.5" />
            Parler à un ambassadeur
          </Button>
          <Button
            variant="care"
            size="sm"
            onClick={() => void handleStartConversation()}
            disabled={sending}
          >
            <Plus size={14} className="mr-1.5" />
            Nouvel échange
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-care-50/50 p-3 text-xs text-care dark:bg-care-950/20">
        <Lock size={14} className="flex-shrink-0" />
        <span>
          Les échanges sont strictement confidentiels et soumis au secret professionnel médical.
        </span>
      </div>

      {error && (
        <Card className="!border-red-200 bg-red-50/50 p-4 dark:!border-red-500/20 dark:bg-red-500/10">
          <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left: Conversations list */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Mes conversations
            </h3>
            <div className="mt-3 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">
                  Aucun fil de discussion actif.
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
                          ? "border-care bg-care/5 dark:bg-care/10"
                          : "border-line hover:border-slate-300 dark:border-white/10"
                      }`}
                    >
                      <p className="text-xs font-extrabold truncate">
                        {conv.title ?? `Discussion #${conv.id}`}
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

        {/* Right: Message panel */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[550px] p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-care-100 p-2 text-care dark:bg-care-950/50">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold">
                    {activeConv?.title ?? "Cellule d'écoute Mina"}
                  </h3>
                  <p className="text-[10px] font-semibold text-care">
                    Canal chiffré · Psychologue ou Écouteur formé
                  </p>
                </div>
              </div>
              <Badge tone="teal">Sécurisé</Badge>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-panel/40"
            >
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <LoaderCircle size={24} className="animate-spin text-care" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                  <div className="rounded-2xl bg-care/10 p-3 text-care">
                    <HeartHandshake size={28} />
                  </div>
                  <h4 className="text-sm font-extrabold">Nous sommes là pour t'écouter</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Partage ce qui te pèse en toute liberté. Cet espace est sans jugement et totalement bienveillant.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.is_me ?? m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`group flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div className="flex-shrink-0 rounded-xl bg-care/10 p-2 text-care h-8 w-8 flex items-center justify-center">
                          <HeartHandshake size={16} />
                        </div>
                      )}

                      {/* Action buttons (report/delete) on hover */}
                      {isMe && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-500"
                          title="Supprimer ce message"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isMe
                            ? "bg-care text-white rounded-br-sm"
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

                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => void handleReportMessage(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-amber-500"
                          title="Signaler ce message"
                        >
                          <Flag size={13} />
                        </button>
                      )}

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

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-line p-3 dark:border-white/10 bg-white dark:bg-panel"
            >
              <input
                type="text"
                placeholder="Écris ton message en toute confiance…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending}
                className="flex-1 rounded-xl border border-line bg-transparent px-4 py-2.5 text-xs font-semibold outline-none focus:border-care dark:border-white/10"
              />
              <Button type="submit" variant="care" size="sm" disabled={!inputText.trim() || sending}>
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

      {/* Ambassador Request Modal */}
      {showAmbassadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="relative w-full max-w-md p-6">
            <button
              onClick={() => setShowAmbassadorModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Users size={18} className="text-care" />
              Échanger avec un étudiant ambassadeur
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Un étudiant d'une promotion supérieure de ta faculté te répondra pour t'épauler.
            </p>

            <form onSubmit={handleRequestAmbassador} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Thématique d'échange
                </label>
                <select
                  value={ambassadorTopic}
                  onChange={(e) => setAmbassadorTopic(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-line bg-transparent px-3 text-xs outline-none focus:border-care dark:border-white/10 dark:bg-panel"
                >
                  <option value="Soutien méthodologique & moral">Soutien méthodologique & moral</option>
                  <option value="Orientation & choix de spécialité">Orientation & choix de spécialité</option>
                  <option value="Conseils examens & concours">Conseils examens & concours</option>
                  <option value="Intégration & vie universitaire">Intégration & vie universitaire</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Précisions (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={ambassadorNotes}
                  onChange={(e) => setAmbassadorNotes(e.target.value)}
                  placeholder="Ex : Je suis en L2 et j'ai du mal à organiser mes fiches d'Anatomie…"
                  className="mt-1.5 w-full rounded-xl border border-line bg-transparent p-3 text-xs outline-none focus:border-care dark:border-white/10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAmbassadorModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="care"
                  size="sm"
                  disabled={requestingAmbassador}
                >
                  {requestingAmbassador ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    "Envoyer la demande"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
