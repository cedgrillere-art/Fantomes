/** Un morceau de texte positionné, tel qu'extrait d'une page PDF. */
export type MorceauTexte = { page: number; str: string; x: number; y: number };

/** Une opération bancaire lue dans le relevé. Montant négatif = débit. */
export type Operation = {
  date: string; // AAAA-MM-JJ
  libelle: string;
  montant: number;
};

export type Frequence = "hebdomadaire" | "mensuel" | "trimestriel" | "annuel";

export type Categorie =
  | "video"
  | "musique"
  | "applis"
  | "logiciel"
  | "telecom"
  | "assurance"
  | "sport"
  | "presse"
  | "banque"
  | "livraison"
  | "autre";

/** Un prélèvement régulier détecté : un « fantôme » potentiel. */
export type Fantome = {
  id: string;
  nom: string;
  categorie: Categorie;
  montant: number; // montant d'un prélèvement, en euros (positif)
  frequence: Frequence;
  coutAnnuel: number; // en euros
  occurrences: number;
  dernierPrelevement: string; // AAAA-MM-JJ
  raison: "service-connu" | "prelevement" | "regulier";
};
