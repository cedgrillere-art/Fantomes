// Toutes les informations de l'éditeur sont ici, à un seul endroit.
// Reste à compléter avant la mise en vente : le médiateur de la consommation.

export const site = {
  nom: "Fantômes",
  promesse: "Débusque les abonnements qu'on paie sans s'en servir.",
  description:
    "Dépose ton relevé : Fantômes repère les prélèvements qui tournent en silence, les classe par coût annuel et te prépare la lettre pour les arrêter.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://fantomes-jet.vercel.app"),
};

export const editeur = {
  nom: "Cédric Grillere",
  statut: "Entrepreneur individuel (micro-entreprise)",
  siret: "752 021 543 00042",
  adresse: "6 rue Labouret, 92700 Colombes, France",
  email: "ced.grillere@gmail.com",
  directeurPublication: "Cédric Grillere",
  tva: "TVA non applicable, article 293 B du CGI",
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
