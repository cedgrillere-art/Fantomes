import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { IconeDocument } from "@/components/Icones";
import { euros } from "@/lib/questions";
import { lettreResiliation, conseilEnvoi } from "@/lib/lettres";
import type { Fantome } from "@/lib/releve/types";

export const metadata: Metadata = {
  title: "Exemple de résultat",
  description:
    "Voici à quoi ressemble ta liste Fantômes : les abonnements repérés dans un relevé, classés par coût annuel, avec la lettre pour les arrêter.",
};

// Relevé fictif : ces abonnements et ces montants sont inventés pour l'exemple.
const exemple: Fantome[] = [
  { id: "1", nom: "Salle de sport", categorie: "sport", montant: 29.9, frequence: "mensuel", coutAnnuel: 358.8, occurrences: 3, dernierPrelevement: "2026-09-05", raison: "prelevement" },
  { id: "2", nom: "Plateforme vidéo", categorie: "video", montant: 13.49, frequence: "mensuel", coutAnnuel: 161.88, occurrences: 3, dernierPrelevement: "2026-09-12", raison: "service-connu" },
  { id: "3", nom: "Appli de musique", categorie: "musique", montant: 10.99, frequence: "mensuel", coutAnnuel: 131.88, occurrences: 3, dernierPrelevement: "2026-09-02", raison: "service-connu" },
  { id: "4", nom: "Option assurance mobile", categorie: "assurance", montant: 6.99, frequence: "mensuel", coutAnnuel: 83.88, occurrences: 3, dernierPrelevement: "2026-09-10", raison: "prelevement" },
  { id: "5", nom: "Stockage photos", categorie: "applis", montant: 2.99, frequence: "mensuel", coutAnnuel: 35.88, occurrences: 3, dernierPrelevement: "2026-09-08", raison: "service-connu" },
  { id: "6", nom: "Antivirus", categorie: "logiciel", montant: 34.99, frequence: "annuel", coutAnnuel: 34.99, occurrences: 1, dernierPrelevement: "2026-03-14", raison: "service-connu" },
];

const FREQ: Record<Fantome["frequence"], string> = {
  hebdomadaire: "par semaine",
  mensuel: "par mois",
  trimestriel: "par trimestre",
  annuel: "par an",
};

export default function Exemple() {
  const total = exemple.reduce((s, f) => s + f.coutAnnuel, 0);
  const [premier, ...autres] = exemple;
  const lettre = lettreResiliation(premier, new Date("2026-10-23"));

  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-6">
        <Logo />
      </header>

      <p className="rounded-lg bg-encre px-4 py-2 text-sm font-bold text-papier">
        Exemple sur un relevé fictif
      </p>

      <h1 className="mt-5 font-titre text-[2rem] leading-tight font-semibold">
        {exemple.length} abonnements repérés, pour{" "}
        <span className="chiffres text-vermillon">{euros(total)}</span> par an.
      </h1>
      <p className="mt-3 text-gris">Classés du plus cher au moins cher, sur l'année.</p>

      <h2 className="mt-8 font-titre text-xl font-semibold">Chaque abonnement, avec sa lettre</h2>
      <div className="mt-3 rounded-xl border-2 border-encre bg-carte p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-bold">{premier.nom}</p>
            <p className="text-gris">
              {euros(premier.montant, 2)} {FREQ[premier.frequence]}
            </p>
          </div>
          <p className="chiffres shrink-0 text-right font-titre text-2xl font-semibold text-vermillon">
            {euros(premier.coutAnnuel)}
            <span className="block text-xs font-normal text-gris">par an</span>
          </p>
        </div>
        <p className="mt-3 text-sm text-gris">{conseilEnvoi(premier)}</p>
        <details className="group mt-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center rounded-xl bg-encre font-bold text-papier">
            <span className="group-open:hidden">Voir la lettre prête à envoyer</span>
            <span className="hidden group-open:inline">Masquer la lettre</span>
          </summary>
          <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-trait bg-papier p-4 font-texte text-[0.95rem] leading-relaxed">
            {lettre}
          </pre>
        </details>
      </div>

      <ul className="mt-4 rounded-xl border border-trait bg-carte px-4">
        {autres.map((f, i) => (
          <li key={f.id} className={`flex items-center gap-3 py-3 ${i > 0 ? "releve" : ""}`}>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{f.nom}</span>
              <span className="text-sm text-gris">
                {euros(f.montant, 2)} {FREQ[f.frequence]}
              </span>
            </span>
            <span className="chiffres shrink-0 text-right font-titre text-lg font-semibold">
              {euros(f.coutAnnuel)}
              <span className="block text-xs font-normal text-gris">par an</span>
            </span>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-xl bg-encre px-5 py-7 text-papier">
        <p className="font-titre text-2xl font-semibold leading-snug">Et dans ton relevé ?</p>
        <p className="mt-2 text-[#d9d2c5]">
          Gratuit, sans connecter ta banque. Ton relevé reste sur ton téléphone.
        </p>
        <div className="mt-6">
          <Link href="/analyse" className="btn">
            Trouver mes vrais fantômes
          </Link>
        </div>
        <Link
          href="/analyse#ou-trouver"
          className="mx-auto mt-3 flex min-h-12 w-fit items-center gap-2 px-2 text-[#d9d2c5] underline underline-offset-4"
        >
          <IconeDocument taille={20} />
          Où trouver mon relevé ?
        </Link>
      </section>
    </main>
  );
}
