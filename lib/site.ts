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
      : "https://fantomes-jet.vercel.app"),
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

// Supabase : adresse et clé PUBLIQUE (faites pour être visibles dans le navigateur,
// l'accès aux données est protégé par les règles RLS de la base).
// La clé SECRÈTE, elle, ne sera jamais ici : elle ira dans les variables Vercel.
export const supabasePublic = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://cfwtpldyeooqddhwqjhz.supabase.co",
  cle:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "sb_publishable_pJ_rPNhfX36JTDMvgP4ihQ_8rNLA4I6",
};

// Stripe : clé PUBLIABLE (faite pour le navigateur). La clé secrète reste sur le serveur.
// Clé du compte Stripe « New business » (environnement de test). Elle est publique par nature.
// Fixée ici pour ne pas dépendre d'un copier-coller ; à remplacer par la clé pk_live_ au passage en production.
export const stripePublic = {
  cle: "pk_test_51UMoYAHqkxXd4KFiHRMIGJ5gZG919sr2dLxZxPZJBLaBubsGkMEvLtkhvYdwgSPA0hvj8qPByhoue0Cwfn0NHGg900IYUXV4AT",
};
