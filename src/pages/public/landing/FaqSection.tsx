import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionTitle } from "../../../components/landing/SectionTitle";
import { faqs } from "../../../data/mocks";

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);
  return (
    <section id="faq" className="px-5 py-24">
      <SectionTitle eyebrow="Questions fréquentes" title="Tout ce que tu veux savoir" />
      <div className="mx-auto max-w-3xl divide-y divide-line rounded-[24px] border border-line bg-white px-6 shadow-card dark:divide-white/8 dark:border-white/8 dark:bg-panel">
        {faqs.map((f, i) => (
          <div key={f[0]}>
            <button
              onClick={() => setOpenFaq(i === openFaq ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold"
              aria-expanded={openFaq === i}
            >
              {f[0]}
              <ChevronDown
                size={18}
                className={`shrink-0 transition ${openFaq === i ? "rotate-180 text-mina" : ""}`}
              />
            </button>
            {openFaq === i && (
              <p className="pb-5 text-sm leading-6 text-slate-500 dark:text-slate-400">{f[1]}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
