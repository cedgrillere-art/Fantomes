import type { MorceauTexte } from "./types";

// La bibliothèque de lecture PDF est chargée seulement quand on dépose un fichier,
// pour ne pas ralentir la page d'accueil. Le fichier, lui, n'est envoyé nulle part.
const VERSION = "6.2.108";
const BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${VERSION}/legacy/build`; // version « legacy » : compatible avec les téléphones plus anciens

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: Uint8Array }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: Array<{ str?: string; transform?: number[] }> }>;
      }>;
    }>;
  };
};

let charge: Promise<PdfJs> | null = null;

function chargerPdfJs(): Promise<PdfJs> {
  if (!charge) {
    charge = import(/* webpackIgnore: true */ `${BASE}/pdf.min.mjs`).then((mod: PdfJs) => {
      mod.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.mjs`;
      return mod;
    });
  }
  return charge;
}

export class ErreurPdf extends Error {}

export async function extraireTextePdf(fichier: File): Promise<MorceauTexte[]> {
  const pdfjs = await chargerPdfJs();
  const data = new Uint8Array(await fichier.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data }).promise;
  } catch {
    throw new ErreurPdf("Ce fichier PDF ne peut pas être ouvert. Il est peut-être protégé par un mot de passe.");
  }
  const morceaux: MorceauTexte[] = [];
  const pages = Math.min(doc.numPages, 60);
  for (let p = 1; p <= pages; p++) {
    const page = await doc.getPage(p);
    const contenu = await page.getTextContent();
    for (const it of contenu.items) {
      if (!it.str || !it.str.trim() || !it.transform) continue;
      morceaux.push({ page: p, str: it.str, x: it.transform[4], y: it.transform[5] });
    }
  }
  return morceaux;
}
