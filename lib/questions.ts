export type Reponses = {
  nombre?: string;
  relecture?: string;
  oubli?: string;
};

export const questions = [
  {
    cle: "nombre" as const,
    titre: "À ton avis, combien d'abonnements paies-tu chaque mois ?",
    aide: "Musique, vidéo, stockage, applis, presse, sport, options de banque ou d'assurance…",
    choix: ["1 à 3", "4 à 6", "7 à 10", "Plus de 10", "Aucune idée"],
  },
  {
    cle: "relecture" as const,
    titre: "Quand as-tu relu ton relevé ligne par ligne pour la dernière fois ?",
    aide: "Pas juste le solde : chaque ligne, une par une.",
    choix: ["Ce mois-ci", "Il y a quelques mois", "Il y a plus d'un an", "Jamais vraiment"],
  },
  {
    cle: "oubli" as const,
    titre: "As-tu déjà découvert un prélèvement que tu avais oublié ?",
    aide: "Un essai gratuit devenu payant, une option jamais utilisée, un service remplacé…",
    choix: ["Oui, plusieurs fois", "Oui, une fois", "Non, jamais", "Je ne saurais pas le dire"],
  },
];

/** Prix d'un abonnement courant, utilisé pour l'estimation (affiché à l'écran). */
export const PRIX_ABONNEMENT_COURANT = 9.99;

export function fantomesProbables(r: Reponses): number {
  let n = 1;
  if (r.relecture === "Il y a plus d'un an" || r.relecture === "Jamais vraiment") n++;
  if (r.oubli === "Oui, plusieurs fois") n++;
  if (r.nombre === "1 à 3") n = Math.min(n, 1);
  if (r.nombre === "Plus de 10" || r.nombre === "Aucune idée") n = Math.max(n, 2);
  return n;
}

export function phrasesPerso(r: Reponses): string[] {
  const p: string[] = [];
  if (r.nombre === "Aucune idée") {
    p.push("Tu ne sais pas combien d'abonnements tu paies. C'est exactement comme ça que les fantômes s'installent.");
  } else if (r.nombre) {
    p.push(`Tu penses payer ${r.nombre.toLowerCase()} abonnements.`);
  }
  switch (r.relecture) {
    case "Ce mois-ci":
      p.push("Tu as relu ton relevé ce mois-ci. Bien vu, mais les petits montants se cachent quand même entre deux courses.");
      break;
    case "Il y a quelques mois":
      p.push("Tu n'as pas relu ton relevé ligne par ligne depuis quelques mois.");
      break;
    case "Il y a plus d'un an":
      p.push("Tu n'as pas relu ton relevé ligne par ligne depuis plus d'un an.");
      break;
    case "Jamais vraiment":
      p.push("Tu n'as jamais vraiment relu ton relevé ligne par ligne.");
      break;
  }
  switch (r.oubli) {
    case "Oui, plusieurs fois":
      p.push("Et tu as déjà découvert plusieurs prélèvements oubliés.");
      break;
    case "Oui, une fois":
      p.push("Et tu as déjà découvert un prélèvement oublié.");
      break;
    case "Non, jamais":
      p.push("Tu n'as jamais découvert de prélèvement oublié, ce qui ne veut pas dire qu'il n'y en a aucun.");
      break;
    case "Je ne saurais pas le dire":
      p.push("Et tu ne saurais pas dire si un prélèvement t'a déjà échappé.");
      break;
  }
  return p;
}

export function euros(n: number, decimales = 0): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
