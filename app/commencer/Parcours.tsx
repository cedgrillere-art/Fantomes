"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import Logo from "@/components/Logo";
import {
  questions,
  fantomesProbables,
  phrasesPerso,
  euros,
  PRIX_ABONNEMENT_COURANT,
  type Reponses,
} from "@/lib/questions";

const CLE_STOCKAGE = "fantomes:reponses";

function sauver(r: Reponses) {
  try {
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(r));
  } catch {
    /* stockage indisponible : on continue sans */
  }
}

export default function Parcours() {
  const [etape, setEtape] = useState(0); // 0, 1, 2 = questions ; 3 = résultat
  const [reponses, setReponses] = useState<Reponses>({});

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [etape]);

  function choisir(valeur: string) {
    const q = questions[etape];
    const suivantes = { ...reponses, [q.cle]: valeur };
    setReponses(suivantes);
    sauver(suivantes);
    if (etape === questions.length - 1) track("questions_terminees");
    setEtape(etape + 1);
  }

  if (etape >= questions.length) {
    return <Resultat reponses={reponses} onRecommencer={() => setEtape(0)} />;
  }

  const q = questions[etape];
  const progression = ((etape + 1) / questions.length) * 100;

  return (
    <main className="mx-auto flex min-h-[85dvh] max-w-xl flex-col px-5">
      <header className="flex items-center justify-between pt-5">
        <Logo />
        <span className="text-sm text-gris chiffres" aria-live="polite">
          {etape + 1} sur {questions.length}
        </span>
      </header>

      <div
        className="mt-5 h-2 w-full overflow-hidden rounded-full bg-trait"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progression)}
        aria-label="Progression"
      >
        <div
          className="h-full rounded-full bg-vermillon transition-[width] duration-300"
          style={{ width: `${progression}%` }}
        />
      </div>

      <section className="mt-10 flex-1" key={q.cle}>
        <h1 className="font-titre text-[1.85rem] leading-tight font-semibold">
          {q.titre}
        </h1>
        <p className="mt-3 text-gris">{q.aide}</p>

        <ul className="mt-7 space-y-3">
          {q.choix.map((c) => {
            const actif = reponses[q.cle] === c;
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => choisir(c)}
                  className={`choix flex min-h-14 w-full items-center rounded-xl border-2 px-5 text-left text-lg font-bold transition-colors ${
                    actif
                      ? "border-vermillon bg-carte"
                      : "border-trait bg-carte hover:border-encre"
                  }`}
                >
                  {c}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="py-6">
        {etape > 0 ? (
          <button
            type="button"
            onClick={() => setEtape(etape - 1)}
            className="min-h-12 px-1 text-gris underline underline-offset-4"
          >
            Question précédente
          </button>
        ) : (
          <Link href="/" className="inline-flex min-h-12 items-center px-1 text-gris underline underline-offset-4">
            Retour à l'accueil
          </Link>
        )}
      </div>
    </main>
  );
}

function Resultat({
  reponses,
  onRecommencer,
}: {
  reponses: Reponses;
  onRecommencer: () => void;
}) {
  const n = fantomesProbables(reponses);
  const parAn = n * PRIX_ABONNEMENT_COURANT * 12;
  const surTroisAns = parAn * 3;
  const phrases = phrasesPerso(reponses);

  return (
    <main className="mx-auto max-w-xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>

      <p className="text-sm font-bold uppercase tracking-wider text-vermillon">
        Ton estimation
      </p>
      <h1 className="mt-2 font-titre text-[2rem] leading-tight font-semibold">
        Tes fantômes te coûtent sans doute{" "}
        <span className="chiffres text-vermillon">{euros(parAn)}</span> par an.
      </h1>

      <div className="mt-6 space-y-2 text-lg">
        {phrases.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-trait bg-carte p-5">
        <p>
          Avec tes réponses, il est probable qu'
          {n > 1 ? `au moins ${n} abonnements tournent` : "au moins un abonnement tourne"}{" "}
          pour rien. Au prix d'un abonnement courant (
          <span className="chiffres">{euros(PRIX_ABONNEMENT_COURANT, 2)}</span> par mois),
          ça fait :
        </p>
        <dl className="mt-4 space-y-2">
          <div className="releve flex items-baseline justify-between pt-2">
            <dt className="text-gris">Par an</dt>
            <dd className="chiffres font-titre text-2xl font-semibold">{euros(parAn)}</dd>
          </div>
          <div className="releve flex items-baseline justify-between pt-2">
            <dt className="text-gris">Sur trois ans</dt>
            <dd className="chiffres font-titre text-2xl font-semibold text-vermillon">
              {euros(surTroisAns)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-gris">
          C'est une estimation. Ton relevé donnera le chiffre exact.
        </p>
      </div>

      <section className="mt-8">
        <h2 className="font-titre text-xl font-semibold">Ce que Fantômes change</h2>
        <ul className="mt-3 space-y-2">
          <li>La liste réelle de tes prélèvements réguliers, classés par coût annuel.</li>
          <li>Une lettre de résiliation prête pour chacun.</li>
          <li>Le total que tu récupères, mis à jour à chaque résiliation.</li>
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/analyse" className="btn" onClick={() => track("vers_analyse")}>
          Trouver mes vrais fantômes
        </Link>
        <p className="mt-3 text-center text-sm text-gris">
          Gratuit · Ton relevé reste sur ton téléphone
        </p>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onRecommencer}
          className="min-h-12 px-2 text-gris underline underline-offset-4"
        >
          Modifier mes réponses
        </button>
      </div>
    </main>
  );
}
