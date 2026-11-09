import { useState } from "react";
import { Send, Sparkles, Target } from "lucide-react";
import { Button, Card } from "../../../components/ui/Primitives";
import { ActivityItem, PageHeader } from "../../../components/dashboard/Common";

type Message = { from: "mina" | "me"; text: string };

const INITIAL_MESSAGES: Message[] = [
  {
    from: "mina",
    text: "Bonjour Aïssatou. Tu as progressé en physiologie, mais la biochimie reste à renforcer. Souhaites-tu un planning adapté pour cette semaine ?",
  },
];

const COACH_REPLY =
  "Je te propose 25 minutes de cycle de Krebs demain matin, puis 10 QCM ciblés. J’ai ajouté cette session à ton planning.";

function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-6 ${message.from === "me" ? "ml-auto bg-mina text-white" : "bg-slate-100 dark:bg-white/6"}`}
    >
      {message.text}
    </div>
  );
}

function CoachChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "me", text: input },
      { from: "mina", text: COACH_REPLY },
    ]);
    setInput("");
  };
  return (
    <Card className="flex min-h-[570px] flex-col p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line p-5 dark:border-white/8">
        <div className="rounded-xl bg-mina p-2.5 text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-extrabold">Coach Mina</p>
          <p className="text-[10px] text-mina">Disponible · Réponses simulées</p>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>
      <div className="flex gap-2 border-t border-line p-4 dark:border-white/8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-xs outline-none focus:ring-2 focus:ring-mina/20 dark:bg-white/6"
          placeholder="Pose une question à ton coach…"
        />
        <Button onClick={send} className="px-4" aria-label="Envoyer">
          <Send size={17} />
        </Button>
      </div>
    </Card>
  );
}

function CoachSidebar() {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="font-extrabold">Planning recommandé</h2>
        <div className="mt-4">
          <ActivityItem title="Cycle de Krebs" meta="Demain · 08:00 · 25 min" />
          <ActivityItem title="QCM ciblés" meta="Demain · 18:30 · 15 min" />
          <ActivityItem title="Révision anatomie" meta="Jeudi · 13:00 · 30 min" />
        </div>
      </Card>
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10">
        <Target className="text-amber-600" />
        <h2 className="mt-4 font-extrabold">Point d’attention</h2>
        <p className="mt-2 text-xs leading-5 text-amber-800 dark:text-amber-200">
          Tes résultats sur le métabolisme glucidique sont 12 points sous ta moyenne.
        </p>
      </Card>
    </div>
  );
}

export function CoachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Coach IA"
        title="Ton copilote d’études"
        description="Des recommandations simulées à partir de ta progression et de tes objectifs."
      />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <CoachChat />
        <CoachSidebar />
      </div>
    </>
  );
}
