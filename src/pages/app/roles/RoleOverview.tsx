import { Activity, MessageCircle, MoreHorizontal, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "../../../components/ui/Primitives";
import { ChartCard } from "../../../components/dashboard/ChartCard";
import { PendingBanner } from "../../../components/dashboard/PendingBanner";
import { ActivityItem, StatCard } from "../../../components/dashboard/Common";
import type { Role } from "../../../types";

type NonStudentRole = Exclude<Role, "student">;

function overviewStats(role: NonStudentRole): [string, string, string][] {
  if (role === "ambassador")
    return [
      ["Demandes reçues", "18", "+4"],
      ["Conversations actives", "7", "+2"],
      ["Heures d’écoute", "24h", "+3h"],
      ["Étudiants orientés", "9", "+1"],
    ];
  if (role === "professional")
    return [
      ["RDV aujourd’hui", "6", "+2"],
      ["Demandes en attente", "12", "-3"],
      ["Consultations ce mois", "48", "+12 %"],
      ["Taux de présence", "92 %", "+4 pts"],
    ];
  if (role === "partner_admin")
    return [
      ["Étudiants inscrits", "1 842", "+126"],
      ["Actifs ce mois", "1 316", "71 %"],
      ["Réussite QCM", "76 %", "+8 pts"],
      ["Licences utilisées", "82 %", "+5 pts"],
    ];
  return [
    ["Utilisateurs actifs", "12 482", "+18 %"],
    ["MRR", "18,4M FCFA", "+12 %"],
    ["Conversion essai", "31 %", "+4 pts"],
    ["Rétention M3", "78 %", "+6 pts"],
  ];
}

const STAT_ICONS: ReactNode[] = [
  <Users key="u" size={20} />,
  <MessageCircle key="m" size={20} />,
  <Activity key="a" size={20} />,
  <TrendingUp key="t" size={20} />,
];

function chartTitle(role: NonStudentRole) {
  if (role === "partner_admin") return "Engagement étudiant";
  if (role === "super_admin") return "Croissance des utilisateurs";
  return "Activité des 6 derniers mois";
}

function RecentActivity({ role }: { role: NonStudentRole }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">Activité récente</h2>
        <MoreHorizontal size={18} className="text-slate-400" />
      </div>
      <div className="mt-4">
        <ActivityItem
          title={role === "ambassador" ? "Nouvelle demande anonyme" : "Nouvelle inscription validée"}
          meta="Il y a 12 minutes"
          status="Urgent"
        />
        <ActivityItem
          title={
            role === "professional" ? "RDV confirmé · Baobab 42" : "Rapport mensuel disponible"
          }
          meta="Il y a 48 minutes"
        />
        <ActivityItem title="Atelier gestion du stress" meta="Demain · 16:00" status="Planifié" />
        <ActivityItem title="Suivi terminé" meta="Hier · 18:30" status="Terminé" />
      </div>
    </Card>
  );
}

export function RoleOverview({ role }: { role: NonStudentRole }) {
  const stats = overviewStats(role);
  return (
    <>
      <PendingBanner />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s[0]} label={s[0]} value={s[1]} delta={s[2]} icon={STAT_ICONS[i]} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <ChartCard
          title={chartTitle(role)}
          care={role === "professional" || role === "ambassador"}
        />
        <RecentActivity role={role} />
      </div>
    </>
  );
}
