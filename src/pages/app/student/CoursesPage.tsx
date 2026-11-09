import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CloudDownload,
  Search,
} from "lucide-react";
import { Badge, Button, Card, Progress } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { courses } from "../../../data/mocks";

const colorClass: Record<string, string> = {
  teal: "bg-teal-50",
  amber: "bg-amber-50",
  blue: "bg-blue-50",
  violet: "bg-violet-50",
  rose: "bg-rose-50",
  cyan: "bg-cyan-50",
};

function CourseCard({
  course,
  downloaded,
  onToggleDownload,
}: {
  course: (typeof courses)[number];
  downloaded: boolean;
  onToggleDownload: (id: number) => void;
}) {
  return (
    <Card className="group">
      <div
        className={`h-28 rounded-2xl p-4 ${colorClass[course.color] ?? "bg-cyan-50"} dark:bg-white/5`}
      >
        <div className="flex items-start justify-between">
          <Badge tone="slate">{course.level}</Badge>
          <BookOpen className="text-slate-400 transition group-hover:scale-110" size={28} />
        </div>
      </div>
      <p className="mt-5 text-[10px] font-extrabold uppercase tracking-wider text-mina">
        {course.subject}
      </p>
      <h2 className="mt-1 font-extrabold">{course.title}</h2>
      <p className="mt-2 text-xs text-slate-400">
        {course.type} · {course.duration}
      </p>
      <div className="mt-5">
        <div className="mb-2 flex justify-between text-[10px] font-bold text-slate-400">
          <span>Progression</span>
          <span>{course.progress}%</span>
        </div>
        <Progress value={course.progress} />
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
        <Button className="px-3">
          Continuer <ArrowRight size={14} />
        </Button>
        <button
          onClick={() => onToggleDownload(course.id)}
          className={`rounded-xl border px-3 ${downloaded ? "border-mina bg-teal-50 text-mina dark:bg-mina/10" : "border-line text-slate-400 dark:border-white/10"}`}
          aria-label="Télécharger pour hors-ligne"
        >
          {downloaded ? <CheckCircle2 size={18} /> : <CloudDownload size={18} />}
        </button>
      </div>
    </Card>
  );
}

export function CoursesPage() {
  const [downloaded, setDownloaded] = useState<number[]>([3]);
  const [query, setQuery] = useState("");
  const shown = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subject.toLowerCase().includes(query.toLowerCase()),
  );
  const toggleDownload = (id: number) =>
    setDownloaded((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  return (
    <>
      <PageHeader
        eyebrow="Apprentissage"
        title="Bibliothèque de cours"
        description="Des contenus validés, légers et accessibles hors-ligne."
        action={
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un cours"
              className="h-10 rounded-xl border border-line bg-white pl-9 pr-3 text-xs outline-none focus:border-mina dark:border-white/10 dark:bg-panel"
            />
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {["Tous les niveaux", "L1", "L2", "L3", "Anatomie", "Physiologie"].map((x, i) => (
          <button
            key={x}
            className={`rounded-full px-4 py-2 text-xs font-bold ${i === 0 ? "bg-ink text-white dark:bg-white dark:text-ink" : "border border-line bg-white text-slate-500 dark:border-white/10 dark:bg-panel"}`}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            downloaded={downloaded.includes(c.id)}
            onToggleDownload={toggleDownload}
          />
        ))}
      </div>
    </>
  );
}
