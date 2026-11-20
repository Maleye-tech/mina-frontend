import { PageHeader } from "../../../components/dashboard/Common";
import { LibraryBrowser } from "../../../components/library/LibraryBrowser";

export function CoursesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Apprentissage"
        title="Bibliothèque de cours"
        description="Des contenus validés, légers et accessibles hors-ligne."
      />
      <LibraryBrowser />
    </>
  );
}
