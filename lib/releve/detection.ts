import type { Fantome, Frequence, Operation } from "./types";
import { EXCLUSIONS, QUOTIDIEN, trouverService } from "./services";
import { sansAccents } from "./lecture";

const MOTS_TYPES =
  /\b(CARTE|CB|PAIEMENT PAR CARTE|PAIEMENT CB|FACTURE CARTE|PAIEMENT|PRELEVEMENT SEPA|PRELEVEMENT|PRLV SEPA|PRLV|ECHEANCE|ACHAT)\b/g;

/** Met un libellé sous une forme comparable d'un mois à l'autre. */
export function normaliser(libelle: string): string {
  return sansAccents(libelle)
    .toUpperCase()
    .replace(/\b\d{2}[\/.\-]\d{2}([\/.\-]\d{2,4})?\b/g, " ") // dates
    .replace(MOTS_TYPES, " ")
    .replace(/\bX{2,}\d+\b/g, " ") // numéros de carte masqués
    .replace(/\b[A-Z]*\d[A-Z\d]{3,}\b/g, " ") // références
    .replace(/\d{4,}/g, " ")
    .replace(/[*#_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cle(libNormalise: string): string {
  return libNormalise.split(" ").slice(0, 3).join(" ");
}

function joursEntre(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000;
}

function mediane(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const PAR_AN: Record<Frequence, number> = { hebdomadaire: 52, mensuel: 12, trimestriel: 4, annuel: 1 };

function frequenceDepuisEcart(jours: number): Frequence | null {
  if (jours >= 5 && jours <= 9) return "hebdomadaire";
  if (jours >= 25 && jours <= 35) return "mensuel";
  if (jours >= 80 && jours <= 100) return "trimestriel";
  if (jours >= 330 && jours <= 400) return "annuel";
  return null;
}

function arrondi(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Libellés remboursés (même libellé, même montant, en crédit). */
function rembourses(ops: Operation[]): Set<string> {
  const s = new Set<string>();
  for (const o of ops) {
    if (o.montant > 0) s.add(`${cle(normaliser(o.libelle))}|${o.montant.toFixed(2)}`);
  }
  return s;
}

/**
 * Repère les prélèvements réguliers.
 * Trois signaux : un service d'abonnement connu, un prélèvement SEPA,
 * ou le même montant qui revient sur plusieurs mois.
 */
export function detecter(operations: Operation[]): Fantome[] {
  const remb = rembourses(operations);
  const debits = operations.filter((o) => o.montant < 0);

  type Groupe = { nom: string; ops: Operation[]; service?: ReturnType<typeof trouverService>; sepa: boolean };
  const groupes = new Map<string, Groupe>();

  for (const o of debits) {
    const brut = sansAccents(o.libelle).toUpperCase();
    if (EXCLUSIONS.test(brut)) continue;
    const norm = normaliser(o.libelle);
    if (!norm) continue;
    const montant = Math.abs(o.montant);
    if (montant < 0.5) continue; // micro-autorisations (0,08 € etc.)
    if (remb.has(`${cle(norm)}|${montant.toFixed(2)}`)) continue;

    const service = trouverService(norm) ?? trouverService(brut);
    const sepa = /PRELEVEMENT|PRLV/.test(brut);
    // Pour un même service, des montants différents = des abonnements différents.
    const k = `${service ? service.nom : cle(norm)}|${service ? montant.toFixed(2) : ""}`;
    const g = groupes.get(k) ?? { nom: service?.nom ?? joliNom(norm), ops: [], service, sepa };
    g.ops.push(o);
    g.sepa = g.sepa || sepa;
    groupes.set(k, g);
  }

  const resultats: Fantome[] = [];
  for (const [k, g] of groupes) {
    const ops = g.ops.sort((a, b) => a.date.localeCompare(b.date));
    const montants = ops.map((o) => Math.abs(o.montant));
    const med = mediane(montants);
    const mois = new Set(ops.map((o) => o.date.slice(0, 7)));

    let frequence: Frequence | null = null;
    let raison: Fantome["raison"] | null = null;

    // Régularité observée sur plusieurs mois, montants proches (±15 %).
    const quotidien = !g.service && !g.sepa && g.ops.some((o) => QUOTIDIEN.test(normaliser(o.libelle)));
    if (mois.size >= 2 && !quotidien) {
      const proches = montants.every((m) => Math.abs(m - med) <= med * 0.15);
      const ecarts = ops.slice(1).map((o, i) => joursEntre(ops[i].date, o.date)).filter((j) => j > 3);
      const f = ecarts.length ? frequenceDepuisEcart(mediane(ecarts)) : null;
      if (proches && f) {
        frequence = f;
        raison = g.service ? "service-connu" : g.sepa ? "prelevement" : "regulier";
      }
    }

    if (!raison && g.service) {
      // Un service connu qui revient plusieurs fois dans le même mois, au même montant,
      // n'est pas un abonnement unique (ex. achats intégrés) : on garde une seule ligne.
      frequence = g.service.frequence ?? "mensuel";
      raison = "service-connu";
    }
    if (!raison && g.sepa) {
      frequence = "mensuel";
      raison = "prelevement";
    }
    if (!raison || !frequence) continue;

    const montant = arrondi(med);
    resultats.push({
      id: k,
      nom: g.nom,
      categorie: g.service?.categorie ?? "autre",
      montant,
      frequence,
      coutAnnuel: arrondi(montant * PAR_AN[frequence]),
      occurrences: ops.length,
      dernierPrelevement: ops[ops.length - 1].date,
      raison,
    });
  }

  return resultats.sort((a, b) => b.coutAnnuel - a.coutAnnuel);
}

function joliNom(norm: string): string {
  const mots = norm.split(" ").slice(0, 3).join(" ").toLowerCase();
  return mots.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}
