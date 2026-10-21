"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import Logo from "@/components/Logo";
import { extraireTextePdf, ErreurPdf } from "@/lib/releve/pdf";
import { lireOperations, lireCsv } from "@/lib/releve/lecture";
import { detecter } from "@/lib/releve/detection";
import type { Fantome, Operation } from "@/lib/releve/types";
import { lettreResiliation, conseilEnvoi } from "@/lib/lettres";
import { euros, fantomesProbables, PRIX_ABONNEMENT_COURANT, type Reponses } from "@/lib/questions";

type Etat =
  | { etape: "depot" }
  | { etape: "lecture" }
  | { etape: "erreur"; message: string }
  | { etape: "resultat"; fantomes: Fantome[]; nbOperations: number };

const FREQ: Record<Fantome["frequence"], string> = {
  hebdomadaire: "par semaine",
  mensuel: "par mois",
  trimestriel: "par trimestre",
  annuel: "par an",
};

async function lireFichier(f: File): Promise<Operation[]> {
  const nom = f.name.toLowerCase();
  if (nom.endsWith(".csv") || f.type === "text/csv") {
    return lireCsv(await f.text());
  }
  if (nom.endsWith(".pdf") || f.type === "application/pdf") {
    return lireOperations(await extraireTextePdf(f));
  }
  throw new ErreurPdf("Ce format n'est pas pris en charge. Dépose un relevé en PDF ou un export CSV.");
}

export default function Analyse() {
  const [etat, setEtat] = useState<Etat>({ etape: "depot" });
  const champ = useRef<HTMLInputElement>(null);
  const dejaLues = useRef<Operation[]>([]); // pour ajouter des mois à une première analyse

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [etat.etape]);

  async function analyser(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return;
    if (fichiers.length > 12) {
      setEtat({ etape: "erreur", message: "Dépose 12 relevés au maximum à la fois." });
      return;
    }
    setEtat({ etape: "lecture" });
    try {
      const toutes: Operation[] = [...dejaLues.current];
      for (const f of Array.from(fichiers)) {
        if (f.size > 15 * 1024 * 1024) throw new ErreurPdf(`« ${f.name} » est trop lourd (15 Mo maximum).`);
        toutes.push(...(await lireFichier(f)));
      }
      if (toutes.length === 0) {
        setEtat({
          etape: "erreur",
          message:
            "Aucune opération n'a été trouvée dans ce fichier. S'il s'agit d'un scan ou d'une photo, il ne peut pas être lu : télécharge plutôt le relevé PDF depuis l'appli de ta banque, ou un export CSV.",
        });
        return;
      }
      // Dédoublonne si le même relevé est déposé deux fois.
      const vues = new Set<string>();
      const uniques = toutes.filter((o) => {
        const k = `${o.date}|${o.libelle}|${o.montant}`;
        if (vues.has(k)) return false;
        vues.add(k);
        return true;
      });
      dejaLues.current = uniques;
      const fantomes = detecter(uniques);
      try {
        sessionStorage.setItem("fantomes:resultat", JSON.stringify(fantomes));
      } catch {
        /* stockage indisponible */
      }
      track("releve_analyse", { fantomes: fantomes.length, fichiers: fichiers.length });
      setEtat({ etape: "resultat", fantomes, nbOperations: uniques.length });
    } catch (e) {
      setEtat({
        etape: "erreur",
        message:
          e instanceof ErreurPdf
            ? e.message
            : "La lecture du fichier a échoué. Vérifie ta connexion et réessaie ; si ça recommence, essaie avec un autre mois.",
      });
    } finally {
      if (champ.current) champ.current.value = "";
    }
  }

  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>

      <input
        ref={champ}
        type="file"
        accept=".pdf,.csv,application/pdf,text/csv"
        multiple
        className="sr-only"
        id="releve"
        onChange={(e) => analyser(e.target.files)}
      />

      {etat.etape === "depot" && <Depot />}
      {etat.etape === "lecture" && <Lecture />}
      {etat.etape === "erreur" && (
        <section>
          <h1 className="font-titre text-[1.85rem] leading-tight font-semibold">
            On n'a pas pu lire ce relevé.
          </h1>
          <p className="mt-4 text-lg text-gris">{etat.message}</p>
          <label htmlFor="releve" className="btn mt-8 cursor-pointer">
            Choisir un autre fichier
          </label>
        </section>
      )}
      {etat.etape === "resultat" && (
        <Resultat fantomes={etat.fantomes} nbOperations={etat.nbOperations} />
      )}
    </main>
  );
}

function Depot() {
  return (
    <section>
      <h1 className="font-titre text-[2rem] leading-tight font-semibold">Dépose ton relevé.</h1>
      <p className="mt-4 text-lg text-gris">
        Fantômes le lit et sort la liste de tes prélèvements réguliers, classés par ce qu'ils te
        coûtent sur l'année.
      </p>

      <label htmlFor="releve" className="btn mt-8 cursor-pointer">
        Choisir mon relevé
      </label>
      <p className="mt-3 text-center text-sm text-gris">PDF ou CSV · plusieurs mois possibles</p>

      <div className="mt-8 rounded-xl border border-trait bg-carte p-5">
        <h2 className="font-bold">Ton relevé reste sur ton téléphone</h2>
        <p className="mt-1 text-gris">
          Le fichier est lu directement ici, dans ton navigateur. Il n'est envoyé nulle part et
          n'est pas conservé.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h2 className="font-bold">Où trouver ton relevé ?</h2>
          <p className="mt-1 text-gris">
            Dans l'appli de ta banque, rubrique « Relevés » ou « Documents ». Télécharge le PDF du
            dernier mois.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Plus de mois, plus de fantômes</h2>
          <p className="mt-1 text-gris">
            Avec deux ou trois mois, Fantômes repère aussi les prélèvements qui reviennent sans
            porter un nom connu.
          </p>
        </div>
      </div>
    </section>
  );
}

function Lecture() {
  return (
    <section aria-live="polite" className="py-10 text-center">
      <div
        className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-trait border-t-vermillon"
        aria-hidden="true"
      />
      <h1 className="mt-6 font-titre text-2xl font-semibold">Lecture du relevé…</h1>
      <p className="mt-2 text-gris">Quelques secondes. Rien ne quitte ton téléphone.</p>
    </section>
  );
}

function lireEstimation(): number | null {
  try {
    const r = JSON.parse(sessionStorage.getItem("fantomes:reponses") ?? "null") as Reponses | null;
    if (!r) return null;
    return fantomesProbables(r) * PRIX_ABONNEMENT_COURANT * 12;
  } catch {
    return null;
  }
}

function Resultat({ fantomes, nbOperations }: { fantomes: Fantome[]; nbOperations: number }) {
  const [estimation, setEstimation] = useState<number | null>(null);
  useEffect(() => setEstimation(lireEstimation()), []);

  if (fantomes.length === 0) {
    return (
      <section>
        <h1 className="font-titre text-[1.85rem] leading-tight font-semibold">
          Aucun prélèvement régulier repéré.
        </h1>
        <p className="mt-4 text-lg text-gris">
          On a lu {nbOperations} opérations sans trouver d'abonnement. Bonne nouvelle, ou relevé
          trop court : ajoute un ou deux autres mois pour en être sûr.
        </p>
        <label htmlFor="releve" className="btn mt-8 cursor-pointer">
          Ajouter d'autres mois
        </label>
      </section>
    );
  }

  const total = fantomes.reduce((s, f) => s + f.coutAnnuel, 0);
  const [premier, ...autres] = fantomes;

  return (
    <section>
      <p className="text-sm font-bold uppercase tracking-wider text-vermillon">Ton relevé, lu</p>
      <h1 className="mt-2 font-titre text-[2rem] leading-tight font-semibold">
        {fantomes.length} {fantomes.length > 1 ? "abonnements repérés" : "abonnement repéré"}, pour{" "}
        <span className="chiffres text-vermillon">{euros(total)}</span> par an.
      </h1>
      <p className="mt-3 text-gris">
        Sur {nbOperations} opérations lues.
        {estimation !== null && (
          <> Tu avais estimé tes fantômes à {euros(estimation)} par an.</>
        )}
      </p>

      <h2 className="mt-10 font-titre text-xl font-semibold">Le plus cher, débloqué pour toi</h2>
      <CarteOuverte f={premier} />

      {autres.length > 0 && (
        <>
          <h2 className="mt-10 font-titre text-xl font-semibold">
            {autres.length === 1 ? "L'autre abonnement" : `Les ${autres.length} autres`}
          </h2>
          <ul className="mt-3 rounded-xl border border-trait bg-carte px-4">
            {autres.map((f, i) => (
              <li key={f.id} className={`flex items-center gap-3 py-3 ${i > 0 ? "releve" : ""}`}>
                <Cadenas />
                <span className="min-w-0 flex-1">
                  <span className="block select-none text-encre/80" aria-hidden="true">
                    {"■".repeat(Math.min(10, Math.max(4, f.nom.length)))}
                  </span>
                  <span className="sr-only">Abonnement verrouillé</span>
                  <span className="text-sm text-gris">
                    {euros(f.montant)} {FREQ[f.frequence]}
                  </span>
                </span>
                <span className="chiffres shrink-0 font-titre text-lg font-semibold">
                  {euros(f.coutAnnuel)}
                  <span className="block text-right text-xs font-normal text-gris">par an</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-gris">
            Leurs noms et leurs lettres de résiliation sont prêts. Ils se débloquent avec l'audit
            complet.
          </p>

          <div className="mt-8" id="offre">
            <Link href="/analyse/offre" className="btn" onClick={() => track("vers_paywall")}>
              Débloquer toute ma liste
            </Link>
          </div>
        </>
      )}

      <div className="mt-6 text-center">
        <label htmlFor="releve" className="inline-flex min-h-12 cursor-pointer items-center px-2 text-gris underline underline-offset-4">
          Ajouter d'autres mois
        </label>
      </div>
    </section>
  );
}

function CarteOuverte({ f }: { f: Fantome }) {
  const [ouverte, setOuverte] = useState(false);
  const [copie, setCopie] = useState(false);
  const lettre = lettreResiliation(f);

  async function copier() {
    try {
      await navigator.clipboard.writeText(lettre);
      setCopie(true);
      track("lettre_copiee");
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setOuverte(true);
    }
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-encre bg-carte p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold">{f.nom}</p>
          <p className="text-gris">
            {euros(f.montant)} {FREQ[f.frequence]}
          </p>
        </div>
        <p className="chiffres shrink-0 text-right font-titre text-2xl font-semibold text-vermillon">
          {euros(f.coutAnnuel)}
          <span className="block text-xs font-normal text-gris">par an</span>
        </p>
      </div>
      <p className="mt-4 text-sm text-gris">{conseilEnvoi(f)}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setOuverte(!ouverte)}
          className="min-h-12 rounded-xl border-2 border-trait font-bold"
          aria-expanded={ouverte}
        >
          {ouverte ? "Masquer la lettre" : "Voir la lettre"}
        </button>
        <button type="button" onClick={copier} className="min-h-12 rounded-xl bg-encre font-bold text-papier">
          {copie ? "Copiée" : "Copier la lettre"}
        </button>
      </div>
      {ouverte && (
        <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-trait bg-papier p-4 font-texte text-[0.95rem] leading-relaxed">
          {lettre}
        </pre>
      )}
    </div>
  );
}

function Cadenas() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" className="shrink-0 text-gris">
      <rect x="2" y="9" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M5 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
