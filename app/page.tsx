import Link from "next/link";
import Logo from "@/components/Logo";
import { site } from "@/lib/site";

const lignes = [
  { date: "02/09", libelle: "PRLV SEPA APPLI MUSIQUE", montant: "−7,99", fantome: true },
  { date: "04/09", libelle: "CARTE BOULANGERIE", montant: "−4,60", fantome: false },
  { date: "05/09", libelle: "PRLV SEPA STOCKAGE PHOTOS", montant: "−2,99", fantome: true },
  { date: "08/09", libelle: "CARTE SUPERMARCHÉ", montant: "−63,15", fantome: false },
  { date: "11/09", libelle: "PRLV SEPA OPTION ASSURANCE", montant: "−4,50", fantome: true },
];

const benefices = [
  {
    titre: "Tout est repéré",
    texte:
      "Les prélèvements qui reviennent chaque mois ou chaque année, sortis de ton relevé et classés par ce qu'ils te coûtent sur l'année.",
  },
  {
    titre: "La lettre est prête",
    texte:
      "Pour chaque abonnement, une lettre de résiliation à envoyer telle quelle. Tu n'as rien à rédiger.",
  },
  {
    titre: "Tu vois ce que tu récupères",
    texte:
      "Le total économisé sur l'année, mis à jour à chaque abonnement que tu arrêtes.",
  },
];

function BoutonCommencer() {
  return (
    <div>
      <Link href="/commencer" className="btn">
        Commencer, c'est gratuit
      </Link>
      <p className="mt-3 text-center text-sm text-gris">
        2 minutes · Ton relevé reste sur ton téléphone
      </p>
    </div>
  );
}

export default function Accueil() {
  return (
    <main className="mx-auto max-w-2xl px-5">
      <header className="pt-5 pb-8">
        <Logo />
      </header>

      {/* Promesse : la même phrase que dans les vidéos */}
      <section>
        <h1 className="font-titre text-[2.35rem] leading-[1.08] font-semibold tracking-tight sm:text-5xl">
          {site.promesse}
        </h1>
        <p className="mt-5 text-lg text-gris">
          Dépose ton relevé. Fantômes repère les prélèvements qui tournent en
          silence et te prépare la lettre pour les arrêter.
        </p>
        <div className="mt-7">
          <BoutonCommencer />
        </div>
      </section>

      {/* La douleur, chiffrée */}
      <section className="mt-14" aria-labelledby="titre-douleur">
        <h2 id="titre-douleur" className="font-titre text-2xl font-semibold">
          Petits, donc invisibles
        </h2>
        <div className="mt-5 rounded-xl border border-trait bg-carte p-4 font-mono text-[0.8rem] sm:text-sm">
          <p className="pb-2 text-gris">Relevé de septembre, extrait</p>
          <ul>
            {lignes.map((l) => (
              <li
                key={l.libelle}
                className={`releve flex items-center gap-3 py-2 ${l.fantome ? "text-vermillon" : ""}`}
              >
                <span className="shrink-0 text-gris">{l.date}</span>
                <span className="min-w-0 flex-1 truncate">{l.libelle}</span>
                <span className="chiffres shrink-0">{l.montant}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-lg">
            7,99 € par mois, ça ne se remarque pas.{" "}
            <strong className="chiffres">Près de 96 € par an</strong>, si. Et
            sur trois ans, <strong className="chiffres">près de 288 €</strong>{" "}
            pour un service que tu n'ouvres plus.
          </p>
          <p className="text-gris">
            Un Français sur trois paie un abonnement qu'il n'utilise pas.
            <span className="block text-sm">Étude Spliiit, octobre 2025.</span>
          </p>
        </div>
      </section>

      {/* Trois bénéfices */}
      <section className="mt-14" aria-labelledby="titre-benefices">
        <h2 id="titre-benefices" className="font-titre text-2xl font-semibold">
          Ce que Fantômes fait pour toi
        </h2>
        <ol className="mt-5 space-y-6">
          {benefices.map((b, i) => (
            <li key={b.titre} className="flex gap-4">
              <span
                className="font-titre chiffres flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-encre text-lg font-semibold"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-bold">{b.titre}</h3>
                <p className="mt-1 text-gris">{b.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-xl bg-encre px-5 py-8 text-papier">
        <p className="font-titre text-2xl font-semibold leading-snug">
          Tes fantômes ne partiront pas seuls.
        </p>
        <p className="mt-2 text-[#d9d2c5]">
          Trois questions, puis ton relevé : tu sais tout de suite ce qu'ils te
          coûtent.
        </p>
        <div className="mt-6">
          <Link href="/commencer" className="btn">
            Commencer, c'est gratuit
          </Link>
        </div>
      </section>
    </main>
  );
}
