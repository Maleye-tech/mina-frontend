import { LockKeyhole, MessageCircle, Send } from "lucide-react";
import { Badge, Button, Card } from "../../../../components/ui/Primitives";

export function CareChat() {
  return (
    <Card className="mx-auto max-w-3xl p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-line p-4 dark:border-white/8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-care p-2.5 text-white">
            <MessageCircle size={17} />
          </div>
          <div>
            <p className="text-xs font-extrabold">Ambassadeur Mina</p>
            <p className="text-[10px] text-green-600">Disponible maintenant</p>
          </div>
        </div>
        <Badge tone="violet">
          <LockKeyhole size={12} className="mr-1" />
          Chiffré de bout en bout
        </Badge>
      </div>
      <div className="min-h-[360px] bg-violet-50/40 p-5 dark:bg-care/5">
        <div className="max-w-[80%] rounded-2xl bg-white p-4 text-sm leading-6 shadow-sm dark:bg-panel">
          Bonjour, je suis là pour t’écouter, sans jugement. Tu peux prendre ton temps.
        </div>
        <div className="mt-4 ml-auto max-w-[80%] rounded-2xl bg-care p-4 text-sm text-white">
          Merci. Je me sens dépassé par les examens qui approchent.
        </div>
      </div>
      <div className="flex gap-2 p-4">
        <input
          className="h-11 flex-1 rounded-xl bg-slate-100 px-4 text-xs dark:bg-white/6"
          placeholder="Écris ton message…"
        />
        <Button variant="care" className="px-4">
          <Send size={16} />
        </Button>
      </div>
    </Card>
  );
}
