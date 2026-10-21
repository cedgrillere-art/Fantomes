import type { Fantome } from "./releve/types";

const FREQ_TEXTE: Record<Fantome["frequence"], string> = {
  hebdomadaire: "chaque semaine",
  mensuel: "chaque mois",
  trimestriel: "chaque trimestre",
  annuel: "chaque année",
};

function euros(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function dateFr(iso: string): string {
  const [a, m, j] = iso.split("-");
  return `${j}/${m}/${a}`;
}

/** Conseil d'envoi, adapté au type de service. */
export function conseilEnvoi(f: Fantome): string {
  switch (f.categorie) {
    case "telecom":
      return "Envoie-la depuis ton espace client ou par lettre recommandée avec accusé de réception. Vérifie s'il y a du matériel (box, décodeur) à rendre.";
    case "assurance":
      return "Envoie-la par e-mail ou depuis ton espace client. Après un an de contrat, tu peux résilier à tout moment (loi Hamon).";
    case "banque":
      return "Ta banque ne se résilie pas comme un abonnement : demande plutôt à passer sur une offre gratuite, depuis l'appli ou par e-mail au service client.";
    case "applis":
      return "Les abonnements pris via un magasin d'applis se résilient depuis ton téléphone : Réglages, puis Abonnements. Garde la lettre si le service ne répond pas.";
    default:
      return "Commence par chercher « Résilier » ou « Annuler l'abonnement » dans ton compte : depuis 2023, la loi impose ce bouton pour tout abonnement pris en ligne. Sinon, envoie cette lettre par e-mail ou en recommandé.";
  }
}

/** Lettre de résiliation prête à envoyer. Les crochets sont à compléter. */
export function lettreResiliation(f: Fantome, aujourdhui = new Date()): string {
  const date = aujourdhui.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const objet =
    f.categorie === "banque"
      ? `Objet : Changement d'offre et arrêt des frais de ${f.nom}`
      : `Objet : Résiliation de mon abonnement ${f.nom}`;

  const corps =
    f.categorie === "banque"
      ? `Je constate le prélèvement de ${euros(f.montant)} ${FREQ_TEXTE[f.frequence]} au titre de mon offre. Je vous demande de basculer mon compte sur votre offre sans frais, à compter de la réception de ce message, et de cesser ces prélèvements.`
      : `Je vous informe de ma décision de résilier mon abonnement ${f.nom}, prélevé ${FREQ_TEXTE[f.frequence]} (${euros(f.montant)}${f.dernierPrelevement ? `, dernier prélèvement le ${dateFr(f.dernierPrelevement)}` : ""}).

Je vous remercie de mettre fin à ce contrat à la prochaine échéance, de cesser tout prélèvement à compter de cette date et de m'adresser une confirmation écrite de la résiliation.`;

  const rappel =
    f.categorie === "assurance"
      ? "\n\nConformément à l'article L. 113-15-2 du Code des assurances, la résiliation prend effet un mois après la réception de cette demande."
      : f.categorie === "banque"
        ? ""
        : "\n\nSi ce contrat a été souscrit en ligne, je vous rappelle que l'article L. 215-1-1 du Code de la consommation vous impose de permettre sa résiliation par voie électronique.";

  return `[Ton prénom et ton nom]
[Ton adresse]
[Ton e-mail ou ton numéro client ${f.nom}]

À l'attention du service client de ${f.nom}

Le ${date}

${objet}

Madame, Monsieur,

${corps}${rappel}

Je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.

[Ton prénom et ton nom]`;
}
