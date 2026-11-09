import { BookOpen, FileQuestion, Plus } from "lucide-react";
import { Button, Card } from "../../../../components/ui/Primitives";
import { PageHeader } from "../../../../components/dashboard/Common";

const CONTENT_TYPES: [string, string, string][] = [
  ["Cours", "842", "24 brouillons"],
  ["QCM", "5 240", "128 à valider"],
  ["Flashcards", "3 810", "96 nouvelles"],
  ["Cas cliniques", "126", "12 brouillons"],
];

export function ContentsSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Bibliothèque Mina"
        title={title}
        description={desc}
        action={
          <Button>
            <Plus size={15} />
            Nouveau contenu
          </Button>
        }
      />
      <div className="grid gap-5 md:grid-cols-4">
        {CONTENT_TYPES.map((x, i) => (
          <Card key={x[0]}>
            <div className="rounded-xl bg-mina/10 p-2.5 text-mina w-fit">
              {i === 1 ? <FileQuestion /> : <BookOpen />}
            </div>
            <p className="mt-5 text-2xl font-extrabold">{x[1]}</p>
            <p className="text-xs font-bold">{x[0]}</p>
            <p className="mt-3 text-[10px] text-slate-400">{x[2]}</p>
            <Button variant="secondary" className="mt-5 w-full">
              Gérer
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
