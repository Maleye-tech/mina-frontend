import { useCallback, useEffect, useState } from "react";
import { Brain, ChevronLeft, Eye, RotateCcw, Sparkles } from "lucide-react";
import { PageHeader } from "../../../components/dashboard/Common";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Pagination } from "../../../components/ui/Pagination";
import { Badge, Button, Card } from "../../../components/ui/Primitives";
import { errorMessage } from "../../../lib/api";
import { flashcardsService } from "../../../services/flashcardsService";
import { libraryService } from "../../../services/libraryService";
import { toast } from "../../../store/toastStore";
import type { Paginated } from "../../../types/api";
import type { FlashcardCard, FlashcardDeck, FlashcardDeckDetail } from "../../../types/assessment";
import type { Level, Subject } from "../../../types/library";

const QUALITY_LABELS: { value: number; label: string; tone: string }[] = [
  { value: 0, label: "Blackout", tone: "bg-red-600 hover:bg-red-700" },
  { value: 1, label: "Mauvais", tone: "bg-orange-500 hover:bg-orange-600" },
  { value: 2, label: "Difficile", tone: "bg-amber-500 hover:bg-amber-600" },
  { value: 3, label: "Hésitant", tone: "bg-yellow-400 hover:bg-yellow-500" },
  { value: 4, label: "Bon", tone: "bg-teal-500 hover:bg-teal-600" },
  { value: 5, label: "Parfait", tone: "bg-mina hover:bg-mina-dark" },
];

function stateBadge(card: FlashcardCard) {
  if (!card.state) return <Badge tone="violet">Nouvelle</Badge>;
  if (card.state.due_at) {
    const due = new Date(card.state.due_at);
    if (due.getTime() <= Date.now()) return <Badge tone="amber">À réviser</Badge>;
  }
  return <Badge tone="teal">Interval {card.state.interval_days} j</Badge>;
}

export function FlashcardsPage() {
  const [mode, setMode] = useState<"decks" | "deck" | "reviewing" | "done">("decks");
  const [decks, setDecks] = useState<Paginated<FlashcardDeck> | null>(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");

  const [deck, setDeck] = useState<FlashcardDeckDetail | null>(null);
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckError, setDeckError] = useState("");

  const [queue, setQueue] = useState<FlashcardCard[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [subs, lvls] = await Promise.all([
          libraryService.subjects(),
          libraryService.levels(),
        ]);
        if (cancelled) return;
        setSubjects(subs);
        setLevels(lvls);
      } catch (e) {
        if (!cancelled) toast.error(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    const seq = Date.now();
    setLoading(true);
    setLoadError("");
    try {
      const res = await flashcardsService.listDecks({
        subject_id: subjectId ? Number(subjectId) : undefined,
        level_id: levelId ? Number(levelId) : undefined,
        per_page: 15,
        page,
      });
      setDecks(res);
    } catch (e) {
      setDecks(null);
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
    return seq;
  }, [subjectId, levelId, page, reload]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDeck = async (deckId: number) => {
    setDeckLoading(true);
    setDeckError("");
    setDeck(null);
    setMode("deck");
    try {
      const res = await flashcardsService.getDeck(deckId);
      setDeck(res);
    } catch (e) {
      setDeckError(errorMessage(e));
    } finally {
      setDeckLoading(false);
    }
  };

  const startReview = async (deckId: number) => {
    setReviewError("");
    try {
      const cards = await flashcardsService.reviewsToday({ deck_id: deckId });
      if (!cards.length) {
        toast.info("Aucune carte à réviser pour ce paquet aujourd’hui.");
        return;
      }
      setQueue(cards);
      setQueueIndex(0);
      setRevealed(false);
      setReviewedCount(0);
      setMode("reviewing");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const submitQuality = async (quality: number) => {
    const card = queue[queueIndex];
    if (!card) return;
    setReviewBusy(true);
    setReviewError("");
    try {
      await flashcardsService.review(card.id, quality);
      setReviewedCount((c) => c + 1);
      setRevealed(false);
      if (queueIndex >= queue.length - 1) {
        setMode("done");
        setReload((r) => r + 1);
        if (deck) void openDeck(deck.id);
      } else {
        setQueueIndex((i) => i + 1);
      }
    } catch (e) {
      setReviewError(errorMessage(e));
    } finally {
      setReviewBusy(false);
    }
  };

  const selectClass =
    "h-11 rounded-xl border border-line bg-white px-3 text-xs font-bold outline-none focus:border-mina dark:border-white/10 dark:bg-panel";
  const currentCard = queue[queueIndex];

  return (
    <>
      <PageHeader
        eyebrow="Répétition espacée"
        title="Flashcards à réviser"
        description="Mina reprogramme les cartes selon ta mémorisation."
        action={
          mode !== "decks" ? (
            <Button
              variant="secondary"
              onClick={() => {
                setMode("decks");
                setDeck(null);
              }}
            >
              <ChevronLeft size={15} />
              Tous les paquets
            </Button>
          ) : undefined
        }
      />

      {mode === "decks" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Toutes les matières</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={levelId}
              onChange={(e) => {
                setLevelId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">Tous les niveaux</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {loadError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{loadError}</span>
              <Button variant="secondary" onClick={() => void load()}>
                Réessayer
              </Button>
            </div>
          )}

          {loading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              Chargement des paquets…
            </p>
          )}

          {!loading && !loadError && decks && decks.data.length === 0 && (
            <EmptyState
              icon={<Brain size={24} />}
              title="Aucun paquet disponible"
              description="Les paquets de flashcards seront visibles dès qu’ils seront publiés."
            />
          )}

          {!loading && decks && decks.data.length > 0 && (
            <div className="space-y-3">
              {decks.data.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line bg-white px-5 py-4 dark:border-white/8 dark:bg-panel"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold">{d.name}</p>
                      <Badge tone="slate">{d.subject.name}</Badge>
                      <Badge tone="slate">{d.level.name}</Badge>
                      <Badge tone="teal">{d.cards_count} cartes</Badge>
                    </div>
                    {d.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void openDeck(d.id)}>
                      Ouvrir
                    </Button>
                    <Button onClick={() => void startReview(d.id)}>
                      <Sparkles size={15} />
                      Réviser
                    </Button>
                  </div>
                </div>
              ))}
              <Pagination
                page={decks.meta.current_page}
                lastPage={decks.meta.last_page}
                total={decks.meta.total}
                itemLabel="paquet"
                onPage={setPage}
              />
            </div>
          )}
        </>
      )}

      {mode === "deck" && (
        <>
          {deckLoading && (
            <p className="rounded-[22px] border border-dashed border-line p-10 text-center text-sm font-bold text-slate-400 dark:border-white/10">
              Chargement du paquet…
            </p>
          )}
          {deckError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 dark:bg-red-500/10">
              <span>{deckError}</span>
              <Button variant="secondary" onClick={() => setMode("decks")}>
                Retour
              </Button>
            </div>
          )}
          {deck && (
            <div className="space-y-4">
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold">{deck.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="slate">{deck.subject.name}</Badge>
                      <Badge tone="slate">{deck.level.name}</Badge>
                      <Badge tone="teal">{deck.cards.length} cartes</Badge>
                    </div>
                    {deck.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => void startReview(deck.id)}>
                    <Sparkles size={15} />
                    Réviser aujourd’hui
                  </Button>
                </div>
              </Card>
              <div className="grid gap-3 md:grid-cols-2">
                {deck.cards.map((card) => (
                  <Card key={card.id} className="!p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-extrabold leading-6">{card.front}</p>
                      {stateBadge(card)}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {card.back}
                    </p>
                    {card.hint && (
                      <p className="mt-1.5 text-[11px] italic text-slate-400">
                        Indice : {card.hint}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {mode === "reviewing" && currentCard && (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Carte {queueIndex + 1} / {queue.length}
            </span>
            <span>{reviewedCount} révisée(s)</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-care transition-all"
              style={{ width: `${Math.round((queueIndex / queue.length) * 100)}%` }}
            />
          </div>
          {reviewError && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 dark:bg-red-500/10">
              {reviewError}
            </p>
          )}
          <Card className="!p-8 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-care">Recto</p>
            <p className="mt-4 text-xl font-extrabold leading-8">{currentCard.front}</p>
            {revealed ? (
              <>
                <div className="mx-auto my-5 h-px w-24 bg-line dark:bg-white/10" />
                <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-care">
                  Verso
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {currentCard.back}
                </p>
                {currentCard.hint && (
                  <p className="mt-2 text-xs italic text-slate-400">Indice : {currentCard.hint}</p>
                )}
              </>
            ) : (
              <Button className="mt-6" variant="secondary" onClick={() => setRevealed(true)}>
                <Eye size={15} />
                Afficher la réponse
              </Button>
            )}
          </Card>
          {revealed && (
            <div className="rounded-[22px] border border-line bg-white p-4 dark:border-white/8 dark:bg-panel">
              <p className="mb-3 text-center text-xs font-extrabold text-slate-500">
                Comment s’est passée ta mémorisation ?
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {QUALITY_LABELS.map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    disabled={reviewBusy}
                    onClick={() => void submitQuality(q.value)}
                    className={`rounded-xl px-2 py-3 text-[11px] font-extrabold text-white transition disabled:opacity-60 ${q.tone}`}
                  >
                    {q.label}
                    <span className="mt-0.5 block text-[10px] font-bold opacity-80">
                      {q.value}/5
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setMode(deck ? "deck" : "decks")}
              className="text-xs font-bold text-slate-400 transition hover:text-mina"
            >
              Arrêter la révision
            </button>
          </div>
        </div>
      )}

      {mode === "done" && (
        <Card className="mx-auto max-w-lg text-center !p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-care/10 text-care">
            <Sparkles size={24} />
          </div>
          <h2 className="mt-5 text-lg font-extrabold">Révision terminée</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {reviewedCount} carte{reviewedCount > 1 ? "s" : ""} révisée
            {reviewedCount > 1 ? "s" : ""} — Mina a reprogrammé leur prochaine échéance.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setMode("decks");
                setDeck(null);
              }}
            >
              <RotateCcw size={15} />
              Retour aux paquets
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
