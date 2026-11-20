import type { ReactNode } from "react";
import type { Role } from "../../../types";
import { PageHeader } from "../../../components/dashboard/Common";
import { roleTitles } from "./roleTitles";
import { RoleOverview } from "./RoleOverview";
import { ContentsSection } from "./sections/ContentsSection";
import { FallbackSection } from "./sections/FallbackSection";
import { FormationSection } from "./sections/FormationSection";
import { LicencesSection } from "./sections/LicencesSection";
import { PriorityQueueSection } from "./sections/PriorityQueueSection";
import { QcmImportsSection } from "./sections/QcmImportsSection";
import { QcmQuestionsSection } from "./sections/QcmQuestionsSection";
import { UsersSection } from "./sections/UsersSection";
import { WellbeingSection } from "./sections/WellbeingSection";
import { OnboardingQuestionsSection } from "./sections/OnboardingQuestionsSection";

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
        <PageHeader eyebrow={roleEyebrow(role)} title={title} description={desc} />
        <RoleOverview role={role} />
      </>
    );

  const sections: Record<string, ReactNode> = {
    utilisateurs: <UsersSection title={title} desc={desc} />,
    contenus: <ContentsSection title={title} desc={desc} />,
    "imports-qcm": <QcmImportsSection title={title} desc={desc} />,
    "questions-qcm": <QcmQuestionsSection title={title} desc={desc} />,
    licences: <LicencesSection title={title} desc={desc} />,
    "bien-etre": <WellbeingSection title={title} desc={desc} />,
    formation: <FormationSection title={title} desc={desc} />,
    parametres: <OnboardingQuestionsSection title={title} desc={desc} />,
  };

  if (sections[slug]) return <>{sections[slug]}</>;
  if (PRIORITY_SLUGS.includes(slug))
    return <PriorityQueueSection slug={slug} title={title} desc={desc} />;
  return <FallbackSection title={title} desc={desc} />;
}
