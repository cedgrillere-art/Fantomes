import type { Categorie, Frequence } from "./types";

export type ServiceConnu = {
  motif: RegExp;
  nom: string;
  categorie: Categorie;
  frequence?: Frequence; // par défaut : mensuel
};

/**
 * Services d'abonnement courants en France. Le motif est testé sur le libellé
 * normalisé (majuscules, sans accents).
 */
export const SERVICES: ServiceConnu[] = [
  // Vidéo
  { motif: /\bNETFLIX\b/, nom: "Netflix", categorie: "video" },
  { motif: /\bDISNEY\s?(PLUS|\+)?\b/, nom: "Disney+", categorie: "video" },
  { motif: /\b(PRIME ?VIDEO|AMAZON PRIME|AMZN ?PRIME|PRIME MEMBER)/, nom: "Amazon Prime", categorie: "video" },
  { motif: /\b(MY ?CANAL|CANAL ?\+|CANALPLUS|GROUPE CANAL)/, nom: "Canal+", categorie: "video" },
  { motif: /\bPARAMOUNT/, nom: "Paramount+", categorie: "video" },
  { motif: /\b(HBO ?MAX|MAX\.COM)\b/, nom: "Max", categorie: "video" },
  { motif: /\bCRUNCHYROLL\b/, nom: "Crunchyroll", categorie: "video" },
  { motif: /\bDAZN\b/, nom: "DAZN", categorie: "video" },
  { motif: /\bBEIN\b/, nom: "beIN Sports", categorie: "video" },
  { motif: /\bMOLOTOV\b/, nom: "Molotov", categorie: "video" },
  { motif: /\bYOUTUBE ?(PREMIUM|MUSIC)?\b/, nom: "YouTube Premium", categorie: "video" },
  // Musique, livres audio
  { motif: /\bSPOTIFY\b/, nom: "Spotify", categorie: "musique" },
  { motif: /\bDEEZER\b/, nom: "Deezer", categorie: "musique" },
  { motif: /\bQOBUZ\b/, nom: "Qobuz", categorie: "musique" },
  { motif: /\bTIDAL\b/, nom: "Tidal", categorie: "musique" },
  { motif: /\bAUDIBLE\b/, nom: "Audible", categorie: "musique" },
  { motif: /\bSUNO\b/, nom: "Suno", categorie: "musique" },
  // Magasins d'applis
  { motif: /\b(APPLE\.COM|APPLE COM BILL|ITUNES)/, nom: "Apple (App Store, iCloud…)", categorie: "applis" },
  { motif: /\bGOOGLE ?(PLAY|ONE|STORAGE)\b/, nom: "Google Play", categorie: "applis" },
  { motif: /\b(XBOX|MICROSOFT ?365|MSFT)\b/, nom: "Microsoft", categorie: "applis" },
  { motif: /\b(PLAYSTATION|SONY INTERACTIVE)/, nom: "PlayStation", categorie: "applis" },
  { motif: /\bNINTENDO\b/, nom: "Nintendo", categorie: "applis" },
  // Logiciels, IA, web
  { motif: /\b(OPENAI|CHATGPT)\b/, nom: "ChatGPT", categorie: "logiciel" },
  { motif: /\b(ANTHROPIC|CLAUDE\.AI)\b/, nom: "Claude", categorie: "logiciel" },
  { motif: /\bMIDJOURNEY\b/, nom: "Midjourney", categorie: "logiciel" },
  { motif: /\bKLING ?AI\b|\bKLINGAI\b/, nom: "Kling AI", categorie: "logiciel" },
  { motif: /\bADOBE\b/, nom: "Adobe", categorie: "logiciel" },
  { motif: /\bCANVA\b/, nom: "Canva", categorie: "logiciel" },
  { motif: /\bNOTION\b/, nom: "Notion", categorie: "logiciel" },
  { motif: /\bDROPBOX\b/, nom: "Dropbox", categorie: "logiciel" },
  { motif: /\bNETLIFY\b/, nom: "Netlify", categorie: "logiciel" },
  { motif: /\bVERCEL\b/, nom: "Vercel", categorie: "logiciel" },
  { motif: /\bGANDI\b/, nom: "Gandi", categorie: "logiciel", frequence: "annuel" },
  { motif: /\bOVH/, nom: "OVHcloud", categorie: "logiciel" },
  { motif: /\bIONOS\b/, nom: "IONOS", categorie: "logiciel" },
  { motif: /\bWHOP\b/, nom: "Whop", categorie: "logiciel" },
  { motif: /\bPATREON\b/, nom: "Patreon", categorie: "logiciel" },
  { motif: /\bLINKEDIN\b/, nom: "LinkedIn Premium", categorie: "logiciel" },
  { motif: /\b(NORDVPN|NORD VPN|EXPRESSVPN|SURFSHARK|PROTON)\b/, nom: "VPN", categorie: "logiciel" },
  { motif: /\bDUOLINGO\b/, nom: "Duolingo", categorie: "logiciel" },
  { motif: /\bBABBEL\b/, nom: "Babbel", categorie: "logiciel" },
  { motif: /\b(HEADSPACE|CALM\.COM)\b/, nom: "Appli de méditation", categorie: "logiciel" },
  { motif: /\b(TINDER|BUMBLE|MEETIC|HINGE|FRUITZ)\b/, nom: "Appli de rencontre", categorie: "logiciel" },
  { motif: /\bSTRAVA\b/, nom: "Strava", categorie: "sport" },
  // Télécoms
  { motif: /\bFREE ?(MOBILE|HAUT ?DEBIT|TELECOM)?\b/, nom: "Free", categorie: "telecom" },
  { motif: /\b(ORANGE|SOSH)\b/, nom: "Orange / Sosh", categorie: "telecom" },
  { motif: /\b(SFR|RED BY SFR)\b/, nom: "SFR", categorie: "telecom" },
  { motif: /\bBOUYGUES\b|\bB ?& ?YOU\b/, nom: "Bouygues Telecom", categorie: "telecom" },
  { motif: /\bPRIXTEL\b/, nom: "Prixtel", categorie: "telecom" },
  { motif: /\bLA POSTE MOBILE\b/, nom: "La Poste Mobile", categorie: "telecom" },
  // Assurances
  { motif: /\bLEMONADE\b/, nom: "Lemonade", categorie: "assurance" },
  { motif: /\bALAN\b/, nom: "Alan", categorie: "assurance" },
  { motif: /\bLUKO\b/, nom: "Luko", categorie: "assurance" },
  // Sport
  { motif: /\bBASIC ?FIT\b/, nom: "Basic-Fit", categorie: "sport" },
  { motif: /\bFITNESS ?PARK\b/, nom: "Fitness Park", categorie: "sport" },
  { motif: /\bNEONESS\b/, nom: "Neoness", categorie: "sport" },
  { motif: /\bKEEP ?COOL\b/, nom: "Keep Cool", categorie: "sport" },
  { motif: /\bORANGE BLEUE\b/, nom: "L'Orange Bleue", categorie: "sport" },
  // Presse
  { motif: /\bLE ?MONDE\b/, nom: "Le Monde", categorie: "presse" },
  { motif: /\bLE ?FIGARO\b/, nom: "Le Figaro", categorie: "presse" },
  { motif: /\bMEDIAPART\b/, nom: "Mediapart", categorie: "presse" },
  { motif: /\bLIBERATION\b/, nom: "Libération", categorie: "presse" },
  { motif: /\bL ?EQUIPE\b/, nom: "L'Équipe", categorie: "presse" },
  { motif: /\bCAFEYN\b/, nom: "Cafeyn", categorie: "presse" },
  // Livraison
  { motif: /\bUBER ?ONE\b/, nom: "Uber One", categorie: "livraison" },
  { motif: /\bDELIVEROO ?PLUS\b/, nom: "Deliveroo Plus", categorie: "livraison" },
  // Banque
  { motif: /\b(FRAIS|COTISATION|ABONNEMENT)\b.*\b(BLING|NICKEL|REVOLUT|N26|LYDIA|SUMERIA|CARTE|OFFRE|FORFAIT)\b|\b(BLING|NICKEL|REVOLUT|N26)\b.*\b(FRAIS|COTISATION|ABONNEMENT|PREMIUM|PLAN)\b/, nom: "Offre bancaire", categorie: "banque" },
];

/** Opérations qui ne sont jamais des abonnements. */
export const EXCLUSIONS =
  /\b(VIREMENT|VIR\b|VIR SEPA|RETRAIT|DAB|REMBOURSEMENT|REMB\b|AVANCE|CHEQUE|ANNULATION|SALAIRE|PAIE\b)/;

export function trouverService(libelleNormalise: string): ServiceConnu | undefined {
  return SERVICES.find((s) => s.motif.test(libelleNormalise));
}

/** Commerces du quotidien : jamais comptés comme « réguliers » même si un montant se répète. */
export const QUOTIDIEN =
  /\b(CARREFOUR|LECLERC|AUCHAN|LIDL|ALDI|INTERMARCHE|MONOPRIX|FRANPRIX|CASINO|SUPER U|HYPER U|U EXPRESS|PICARD|NETTO|LEADER PRICE|GRAND FRAIS|BIOCOOP|NATURALIA|BOULANGERIE|FOURNIL|PHARMA|PHARMACIE|TABAC|PMU|FDJ|SNCF|RATP|TOTAL|ESSO|SHELL|BP\b|AVIA|MC ?DONALD|MCDO|BURGER KING|KFC|STARBUCKS|UBER(?! ?ONE)|BOLT|RELAY|SELECTA)\b/;
