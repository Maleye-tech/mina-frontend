import type { ReactNode } from "react";
import type { Role } from "../../../types";
import { Button } from "../../../components/ui/Primitives";
import { DownloadButton, PageHeader } from "../../../components/dashboard/Common";
import { roleTitles } from "./roleTitles";
import { RoleOverview } from "./RoleOverview";
import { ContentsSection } from "./sections/ContentsSection";
import { FallbackSection } from "./sections/FallbackSection";
import { FormationSection } from "./sections/FormationSection";
import { LicencesSection } from "./sections/LicencesSection";
import { PriorityQueueSection } from "./sections/PriorityQueueSection";
import { UsersSection } from "./sections/UsersSection";
import { WellbeingSection } from "./sections/WellbeingSection";

type NonStudentRole = Exclude<Role, "student">;

const PRIORITY_SLUGS = ["validations", "consultations", "demandes", "alertes"];

function roleEyebrow(role: NonStudentRole) {
  if (role === "super_admin") return "Administration Mina";
  if (role === "partner_admin") return "CROUS Thiès";
  return "Espace professionnel";
}

export function GenericRoleSection({ role, slug }: { role: NonStudentRole; slug: string }) {
  const [title, desc] = roleTitles[role][slug] || roleTitles[role][""];

  if (!slug)
    return (
      <>
        <PageHeader
          eyebrow={roleEyebrow(role)}
          title={title}
          description={desc}
          action={<DownloadButton label="Exporter le rapport" />}
        />
        <RoleOverview role={role} />
      </>
    );

  const sections: Record<string, ReactNode> = {
    utilisateurs: <UsersSection title={title} desc={desc} />,
    contenus: <ContentsSection title={title} desc={desc} />,
    licences: <LicencesSection title={title} desc={desc} />,
    "bien-etre": <WellbeingSection title={title} desc={desc} />,
    formation: <FormationSection title={title} desc={desc} />,
  };

  if (sections[slug]) return <>{sections[slug]}</>;
  if (PRIORITY_SLUGS.includes(slug))
    return <PriorityQueueSection slug={slug} title={title} desc={desc} />;
  return <FallbackSection title={title} desc={desc} />;
}
