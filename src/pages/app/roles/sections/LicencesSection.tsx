import { UserCheck, WalletCards, Zap } from "lucide-react";
import { Button, Card } from "../../../../components/ui/Primitives";
import { DownloadButton, PageHeader, StatCard } from "../../../../components/dashboard/Common";

export function LicencesSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Accès subventionnés"
        title={title}
        description={desc}
        action={
          <div className="flex gap-2">
            <DownloadButton label="Importer CSV" />
            <Button>Inviter</Button>
          </div>
        }
      />
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Licences totales"
          value="2 000"
          delta="Convention 2025"
          icon={<WalletCards size={20} />}
        />
        <StatCard
          label="Licences attribuées"
          value="1 642"
          delta="82 %"
          icon={<UserCheck size={20} />}
        />
        <StatCard label="Codes disponibles" value="358" delta="18 %" icon={<Zap size={20} />} />
      </div>
      <Card className="mt-5">
        <h2 className="font-extrabold">Code d’accès institutionnel</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-xl border border-dashed border-mina bg-teal-50 p-4 text-center font-mono text-xl font-extrabold tracking-[.2em] text-mina dark:bg-mina/10">
            CROUS-TH-2025
          </div>
          <Button>Copier le code</Button>
        </div>
      </Card>
    </>
  );
}
