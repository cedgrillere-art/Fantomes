import type { MorceauTexte, Operation } from "./types";

type Ligne = { page: number; y: number; morceaux: { x: number; str: string }[] };

const RE_DATE = /^(\d{2})[\/.\-](\d{2})(?:[\/.\-](\d{2,4}))?$/;
const RE_DATE_DEBUT = /^(\d{2})[\/.\-](\d{2})(?:[\/.\-](\d{2,4}))?\b/;
const RE_MONTANT = /^([+\-−])?\s?(\d{1,3}(?:[  .]\d{3})*|\d+),(\d{2})\s?(?:EUR|€)?\s?([+\-−])?$/i;

export function sansAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normaliserTete(s: string): string {
  return sansAccents(s).toLowerCase().trim();
}

/** Regroupe les morceaux de texte en lignes (même page, même hauteur). */
export function regrouperEnLignes(morceaux: MorceauTexte[]): Ligne[] {
  const tries = [...morceaux].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  const lignes: Ligne[] = [];
  for (const m of tries) {
    const derniere = lignes[lignes.length - 1];
    if (derniere && derniere.page === m.page && Math.abs(derniere.y - m.y) <= 3) {
      derniere.morceaux.push({ x: m.x, str: m.str.trim() });
    } else {
      lignes.push({ page: m.page, y: m.y, morceaux: [{ x: m.x, str: m.str.trim() }] });
    }
  }
  for (const l of lignes) l.morceaux.sort((a, b) => a.x - b.x);
  return lignes;
}

function lireMontant(str: string): { valeur: number; signe: 1 | -1 | 0 } | null {
  const m = RE_MONTANT.exec(str.trim());
  if (!m) return null;
  const entier = m[2].replace(/[  .]/g, "");
  const valeur = Number(`${entier}.${m[3]}`);
  const s = m[1] ?? m[4];
  const signe = s === "+" ? 1 : s === "-" || s === "−" ? -1 : 0;
  return { valeur, signe };
}

function anneeParDefaut(lignes: Ligne[]): number {
  for (const l of lignes) {
    for (const mo of l.morceaux) {
      const m = /\b\d{2}[\/.\-]\d{2}[\/.\-](\d{4})\b/.exec(mo.str);
      if (m) return Number(m[1]);
    }
  }
  return new Date().getFullYear();
}

function versIso(j: string, mo: string, a: string | undefined, defaut: number): string | null {
  let annee = a ? Number(a) : defaut;
  if (annee < 100) annee += 2000;
  const jour = Number(j);
  const mois = Number(mo);
  if (mois < 1 || mois > 12 || jour < 1 || jour > 31) return null;
  return `${annee}-${String(mois).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

/**
 * Lit les opérations d'un relevé à partir de ses lignes de texte.
 * Approche générique : une opération commence par une date et contient un
 * montant ; le libellé peut continuer sur la ou les lignes suivantes.
 */
export function lireOperations(morceaux: MorceauTexte[]): Operation[] {
  const lignes = regrouperEnLignes(morceaux);
  const annee = anneeParDefaut(lignes);
  const operations: Operation[] = [];

  // Position des colonnes Débit / Crédit, si le relevé en a.
  let xDebit: number | null = null;
  let xCredit: number | null = null;

  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i];
    const tetes = l.morceaux.map((m) => normaliserTete(m.str));
    const iDebit = tetes.findIndex((t) => /^debits?$|^debit \(|^sorties?$/.test(t));
    const iCredit = tetes.findIndex((t) => /^credits?$|^credit \(|^entrees?$/.test(t));
    if (iDebit >= 0 && iCredit >= 0) {
      xDebit = l.morceaux[iDebit].x;
      xCredit = l.morceaux[iCredit].x;
      continue;
    }

    const premier = l.morceaux[0]?.str ?? "";
    const date = RE_DATE.exec(premier) ?? RE_DATE_DEBUT.exec(premier);
    if (!date) continue;

    // Montants de la ligne (on prend le dernier montant trouvé avant un éventuel solde).
    const montants = l.morceaux
      .map((m) => ({ m, lu: lireMontant(m.str) }))
      .filter((x): x is { m: { x: number; str: string }; lu: { valeur: number; signe: 1 | -1 | 0 } } => x.lu !== null);
    if (montants.length === 0) continue;
    const choisi = montants[0];

    let signe = choisi.lu.signe;
    if (signe === 0 && xDebit !== null && xCredit !== null) {
      signe = Math.abs(choisi.m.x - xDebit) <= Math.abs(choisi.m.x - xCredit) ? -1 : 1;
    }
    if (signe === 0) signe = -1;

    // Libellé : le texte de la ligne, sans dates ni montants…
    const morceauxLibelle = l.morceaux
      .slice(1)
      .filter((m) => !lireMontant(m.str) && !RE_DATE.test(m.str))
      .map((m) => m.str);
    // … plus les lignes de continuation (sans date ni montant), jusqu'à 2.
    for (let k = 1; k <= 2 && i + k < lignes.length; k++) {
      const suite = lignes[i + k];
      if (suite.page !== l.page || l.y - suite.y > 40) break;
      const debut = suite.morceaux[0]?.str ?? "";
      if (RE_DATE.test(debut) || RE_DATE_DEBUT.test(debut)) break;
      if (suite.morceaux.some((m) => lireMontant(m.str))) break;
      const texte = suite.morceaux.map((m) => m.str).join(" ");
      if (texte.length > 120) break;
      morceauxLibelle.push(texte);
    }

    const iso = versIso(date[1], date[2], date[3], annee);
    if (!iso) continue;
    const libelle = morceauxLibelle.join(" ").replace(/\s+/g, " ").trim();
    if (!libelle) continue;
    operations.push({ date: iso, libelle, montant: signe * choisi.lu.valeur });
  }
  return operations;
}

/** Lit un export CSV de banque (séparateur ; ou ,). */
export function lireCsv(texte: string): Operation[] {
  const lignes = texte.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lignes.length < 2) return [];
  const sep = (lignes[0].match(/;/g)?.length ?? 0) >= (lignes[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const decouper = (l: string) => {
    const out: string[] = [];
    let cur = "";
    let guill = false;
    for (const c of l) {
      if (c === '"') guill = !guill;
      else if (c === sep && !guill) {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  // Cherche la ligne d'en-tête dans les 15 premières lignes.
  let iEntete = -1;
  let cols: string[] = [];
  for (let i = 0; i < Math.min(15, lignes.length); i++) {
    const c = decouper(lignes[i]).map(normaliserTete);
    if (c.some((x) => x.startsWith("date")) && c.some((x) => /libell|descr|operation|intitul|detail/.test(x))) {
      iEntete = i;
      cols = c;
      break;
    }
  }
  if (iEntete < 0) return [];
  const iDate = cols.findIndex((c) => c.startsWith("date"));
  const iLib = cols.findIndex((c) => /libell|descr|operation|intitul|detail/.test(c));
  const iMontant = cols.findIndex((c) => /^montant|^amount/.test(c));
  const iDebit = cols.findIndex((c) => /^debit/.test(c));
  const iCredit = cols.findIndex((c) => /^credit/.test(c));

  const nombre = (s: string | undefined) => {
    if (!s) return NaN;
    const n = s.replace(/[€\s ]/g, "").replace(/EUR/i, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    return n ? Number(n) : NaN;
  };

  const ops: Operation[] = [];
  for (const l of lignes.slice(iEntete + 1)) {
    const c = decouper(l);
    const d = /(\d{2})[\/.\-](\d{2})[\/.\-](\d{2,4})|(\d{4})-(\d{2})-(\d{2})/.exec(c[iDate] ?? "");
    if (!d) continue;
    const iso = d[4] ? `${d[4]}-${d[5]}-${d[6]}` : versIso(d[1], d[2], d[3], new Date().getFullYear());
    if (!iso) continue;
    let montant = NaN;
    if (iMontant >= 0) montant = nombre(c[iMontant]);
    if (Number.isNaN(montant) && iDebit >= 0) {
      const deb = nombre(c[iDebit]);
      const cre = iCredit >= 0 ? nombre(c[iCredit]) : NaN;
      if (!Number.isNaN(deb) && deb !== 0) montant = -Math.abs(deb);
      else if (!Number.isNaN(cre)) montant = Math.abs(cre);
    }
    if (Number.isNaN(montant)) continue;
    const libelle = (c[iLib] ?? "").replace(/\s+/g, " ").trim();
    if (!libelle) continue;
    ops.push({ date: iso, libelle, montant });
  }
  return ops;
}
