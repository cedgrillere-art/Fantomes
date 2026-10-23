import { IconeDocument } from "@/components/Icones";

// Où télécharger son relevé, banque par banque. Les noms de rubrique peuvent
// changer d'une version d'appli à l'autre : on reste sur les intitulés courants.
const banques: { nom: string; chemin: string }[] = [
  { nom: "BNP Paribas", chemin: "Appli Mes Comptes : menu « Documents », puis « Relevés de compte »." },
  { nom: "Crédit Agricole", chemin: "Appli Ma Banque : rubrique « e-Documents »." },
  { nom: "Société Générale", chemin: "Ouvre ton compte, puis « Relevés et documents »." },
  { nom: "LCL", chemin: "Rubrique « e-Documents », puis « Relevés de compte »." },
  { nom: "Caisse d'Épargne, Banque Populaire", chemin: "Rubrique « e-Documents », puis « Relevés »." },
  { nom: "Crédit Mutuel, CIC", chemin: "Rubrique « e-Documents » ou « Mes documents »." },
  { nom: "La Banque Postale", chemin: "Rubrique « Mes documents », puis « e-relevés »." },
  { nom: "BoursoBank", chemin: "Ouvre ton compte, puis « Relevés »." },
  { nom: "Revolut", chemin: "Ouvre ton compte, touche « … », puis « Relevés » : choisis PDF ou CSV." },
  { nom: "N26", chemin: "Ouvre ton compte, puis « Relevés de compte »." },
  { nom: "Bling, Nickel et néobanques", chemin: "Dans l'appli, cherche « Relevés » ou « Documents » dans ton profil ou ton compte." },
];

export default function GuideBanques() {
  return (
    <section id="ou-trouver" className="scroll-mt-6 rounded-xl border border-trait bg-carte p-5">
      <h2 className="flex items-center gap-2 font-bold">
        <IconeDocument className="text-vermillon" />
        Où trouver ton relevé ?
      </h2>
      <p className="mt-1 text-gris">
        Dans l'appli de ta banque, télécharge le relevé PDF du dernier mois. Touche ta banque pour
        le chemin.
      </p>
      <ul className="mt-3 divide-y divide-trait">
        {banques.map((b) => (
          <li key={b.nom}>
            <details className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-bold">
                {b.nom}
                <span className="text-xl text-gris transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="pb-3 text-gris">{b.chemin}</p>
            </details>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-gris">
        Introuvable dans l'appli ? Sur le site web de ta banque, la rubrique est souvent plus visible.
        Le nom exact peut varier selon la version.
      </p>
    </section>
  );
}
