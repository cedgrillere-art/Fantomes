import { extraireTextePdf, ErreurPdf } from "./pdf";
import { lireOperations, lireCsv } from "./lecture";
import type { Operation } from "./types";

export { ErreurPdf };

/** Lit un relevé PDF ou CSV directement dans le navigateur. */
export async function lireFichier(f: File): Promise<Operation[]> {
  if (f.size > 15 * 1024 * 1024) throw new ErreurPdf(`« ${f.name} » est trop lourd (15 Mo maximum).`);
  const nom = f.name.toLowerCase();
  if (nom.endsWith(".csv") || f.type === "text/csv") return lireCsv(await f.text());
  if (nom.endsWith(".pdf") || f.type === "application/pdf") return lireOperations(await extraireTextePdf(f));
  throw new ErreurPdf("Ce format n'est pas pris en charge. Dépose un relevé en PDF ou un export CSV.");
}

export function dedoublonner(ops: Operation[]): Operation[] {
  const vues = new Set<string>();
  return ops.filter((o) => {
    const k = `${o.date}|${o.libelle}|${o.montant}`;
    if (vues.has(k)) return false;
    vues.add(k);
    return true;
  });
}
