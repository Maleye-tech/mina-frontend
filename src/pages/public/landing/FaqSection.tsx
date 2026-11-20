import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionTitle } from "../../../components/landing/SectionTitle";

const faqs: [string, string][] = [
  [
    "Mina fonctionne-t-il sans Internet ?",
    "Oui. Télécharge tes cours, fiches et flashcards en Wi-Fi puis étudie partout. Tes progrès se synchronisent au retour de la connexion.",
  ],
  [
    "À qui s’adresse Mina ?",
    "Aux étudiants en médecine, pharmacie, odontologie et filières de santé, de la première année à l’internat.",
  ],
  [
    "Mina Care est-il vraiment confidentiel ?",
    "Oui. La pseudonymisation est activée par défaut et les échanges sont conçus pour accueillir un chiffrement de bout en bout.",
  ],
  [
    "Combien coûte l’abonnement ?",
    "3 000 FCFA par mois ou 15 000 FCFA par an, après 3 jours d’essai gratuit sans engagement.",
  ],
  [
    "Comment payer ?",
    "Par Wave, Orange Money ou carte bancaire. Le paiement est traité par notre partenaire de confiance.",
  ],
  [
    "Les contenus sont-ils adaptés au Sénégal ?",
    "Oui. Les matières, cas cliniques et recommandations sont contextualisés pour l’Afrique de l’Ouest.",
  ],
  [
    "Qui sont les ambassadeurs ?",
    "Des étudiants pairs formés à l’écoute, à la prévention et à l’orientation vers un professionnel.",
  ],
  [
    "Puis-je annuler mon abonnement ?",
    "Oui, à tout moment depuis ton espace Abonnement. Ton accès reste actif jusqu’à la fin de la période payée.",
  ],
  [
    "Les universités peuvent-elles financer des accès ?",
    "Oui. Les établissements, CROUS et ONG peuvent attribuer des licences subventionnées par code ou import CSV.",
  ],
  [
    "Mina remplace-t-il un médecin ?",
    "Non. Mina Care informe, écoute et oriente, mais ne remplace jamais un diagnostic ni une prise en charge médicale.",
  ],
];

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
