import { Button, Card } from "../../../components/ui/Primitives";
import { PageHeader } from "../../../components/dashboard/Common";
import { useAuthStore } from "../../../store/authStore";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;
  const fields: [string, string][] = [
    ["Nom complet", user.name],
    ["Email", user.email],
    ["Université", "UCAD"],
    ["Niveau", "L1 Médecine"],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Paramètres"
        title="Mon profil"
        description="Personnalise ton expérience et tes préférences."
      />
      <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
        <Card>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-mina text-xl font-extrabold text-white">
            {user.name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>
          <h2 className="mt-4 text-center font-extrabold">{user.name}</h2>
          <p className="mt-1 text-center text-xs text-slate-400">L1 Médecine · UCAD</p>
          <Button variant="secondary" className="mt-6 w-full">
            Modifier la photo
          </Button>
        </Card>
        <Card>
          <h2 className="font-extrabold">Informations personnelles</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <label key={label} className="text-xs font-bold">
                {label}
                <input
                  defaultValue={value}
                  className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent px-3 outline-none focus:border-mina dark:border-white/10"
                />
              </label>
            ))}
          </div>
          <Button className="mt-6">Enregistrer les modifications</Button>
        </Card>
      </div>
    </>
  );
}
