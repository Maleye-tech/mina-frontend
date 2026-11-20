import { PageHeader } from "../../../../components/dashboard/Common";
import { LibraryBrowser } from "../../../../components/library/LibraryBrowser";

export function ContentsSection({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <PageHeader eyebrow="Bibliothèque Mina" title={title} description={desc} />
      <LibraryBrowser />
    </>
  );
}
