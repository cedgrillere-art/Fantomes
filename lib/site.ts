// Toutes les informations de l'éditeur sont ici, à un seul endroit.
// Remplace chaque valeur « [À COMPLÉTER : …] » avant la mise en vente.

export const site = {
  nom: "Fantômes",
  promesse: "Débusque les abonnements que tu paies sans t'en servir.",
  description:
    "Dépose ton relevé : Fantômes repère les prélèvements qui tournent en silence, les classe par coût annuel et te prépare la lettre pour les arrêter.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
};

export const editeur = {
  nom: "[À COMPLÉTER : ton nom ou ta raison sociale]",
  statut: "[À COMPLÉTER : ex. entrepreneur individuel (micro-entreprise)]",
  siret: "[À COMPLÉTER : numéro SIRET]",
  adresse: "[À COMPLÉTER : adresse postale]",
  email: "[À COMPLÉTER : adresse e-mail de contact]",
  directeurPublication: "[À COMPLÉTER : nom du directeur de la publication]",
  tva: "[À COMPLÉTER : n° de TVA intracommunautaire, ou « TVA non applicable, art. 293 B du CGI »]",
  mediateur:
    "[À COMPLÉTER : nom, site et adresse du médiateur de la consommation choisi]",
};

export const garantie = {
  jours: 30,
  delaiLancement: "48 heures ouvrées",
};
