import Link from "next/link";
import Logo from "@/components/Logo";
import { site } from "@/lib/site";
import {
  IconeLoupe,
  IconeLettre,
  IconePiece,
  IconeBanque,
  IconeTelephone,
  IconeTicket,
  IconeMain,
  IconeBalance,
  IconeOeil,
  Pastille,
} from "@/components/Icones";

const lignes = [
  { date: "02/09", libelle: "PRLV SEPA APPLI MUSIQUE", montant: "−7,99", fantome: true },
  { date: "04/09", libelle: "CARTE BOULANGERIE", montant: "−4,60", fantome: false },
  { date: "05/09", libelle: "PRLV SEPA STOCKAGE PHOTOS", montant: "−2,99", fantome: true },
  { date: "08/09", libelle: "CARTE SUPERMARCHÉ", montant: "−63,15", fantome: false },
  { date: "11/09", libelle: "PRLV SEPA OPTION ASSURANCE", montant: "−4,50", fantome: true },
];

const differences = [
  {
    icone: <IconeBanque />,
    titre: "Sans connecter ta banque",
    texte: "Pas d'identifiants à donner, pas d'accès permanent à ton compte. Tu déposes un relevé, c'est tout.",
  },
  {
    icone: <IconeTelephone />,
    titre: "Ton relevé reste chez toi",
    texte: "Il est lu directement sur ton téléphone, jamais envoyé ni conservé.",
  },
  {
    icone: <IconeMain />,
    titre: "Aucune offre à te placer",
    texte: "Pas de box, d'énergie ou d'assurance à te placer. Fantômes ne gagne rien si tu changes de fournisseur.",
  },
  {
    icone: <IconeTicket />,
    titre: "Un seul paiement",
    texte: "Pas d'appli à installer, pas de compte à créer, pas d'abonnement obligatoire.",
  },
];

const benefices = [
  {
    icone: <IconeLoupe />,
    titre: "Tout est repéré",
    texte:
      "Les prélèvements qui reviennent chaque mois ou chaque année, sortis de ton relevé et classés par ce qu'ils te coûtent sur l'année.",
  },
  {
    icone: <IconeLettre />,
    titre: "La lettre est prête",
    texte:
      "Pour chaque abonnement, une lettre de résiliation à envoyer telle quelle. Tu n'as rien à rédiger.",
  },
  {
    icone: <IconePiece />,
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
        2 minutes · Sans connecter ta banque
      </p>
      <Link
        href="/exemple"
        className="mx-auto mt-2 flex min-h-12 w-fit items-center gap-2 px-2 font-bold underline underline-offset-4"
      >
        <IconeOeil taille={20} />
        Voir un exemple de résultat
      </Link>
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
          Sans connecter ta banque : dépose ton relevé, Fantômes repère les
          prélèvements qui tournent en silence et te prépare la lettre pour les
          arrêter.
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
            <li key={b.titre} className="flex items-start gap-4">
              <Pastille ton={i === 2 ? "sauge" : "vermillon"}>{b.icone}</Pastille>
              <div>
                <h3 className="text-lg font-bold">{b.titre}</h3>
                <p className="mt-1 text-gris">{b.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Ce qui distingue Fantômes */}
      <section className="mt-14" aria-labelledby="titre-difference">
        <h2 id="titre-difference" className="font-titre text-2xl font-semibold">
          Pourquoi Fantômes est différent
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {differences.map((d) => (
            <li key={d.titre} className="flex items-start gap-3 rounded-xl border border-trait bg-carte p-4">
              <span className="mt-0.5 shrink-0 text-vermillon">{d.icone}</span>
              <div>
                <h3 className="font-bold">{d.titre}</h3>
                <p className="mt-1 text-[0.95rem] text-gris">{d.texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* La loi est de ton côté */}
      <section className="mt-14 flex items-start gap-4 rounded-xl border-2 border-sauge/40 bg-carte p-5" aria-labelledby="titre-loi">
        <Pastille ton="sauge">
          <IconeBalance />
        </Pastille>
        <div>
          <h2 id="titre-loi" className="font-titre text-xl font-semibold">
            La loi est de ton côté
          </h2>
          <p className="mt-1 text-gris">
            Depuis juin 2023, un abonnement souscrit en ligne doit pouvoir se
            résilier en ligne, en quelques clics. Pour les autres, la lettre
            prête à envoyer suffit.
          </p>
        </div>
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
