import type { ComponentType } from "react";
import { CasesPage } from "./CasesPage";
import { CoachPage } from "./CoachPage";
import { CoursesPage } from "./CoursesPage";
import { FlashcardsPage } from "./FlashcardsPage";
import { ProfilePage } from "./ProfilePage";
import { ProgressPage } from "./ProgressPage";
import { QcmPage } from "./QcmPage";
import { StudentHome } from "./StudentHome";
import { SubscriptionPage } from "./SubscriptionPage";
import { CarePage } from "./care/CarePage";

const SECTIONS: Record<string, ComponentType> = {
  cours: CoursesPage,
  qcm: QcmPage,
  flashcards: FlashcardsPage,
  cas: CasesPage,
  coach: CoachPage,
  progression: ProgressPage,
  care: CarePage,
  abonnement: SubscriptionPage,
  profil: ProfilePage,
};

export function StudentSection({ slug }: { slug: string }) {
  if (!slug) return <StudentHome />;
  const Section = SECTIONS[slug];
  return Section ? <Section /> : <ProfilePage />;
}
