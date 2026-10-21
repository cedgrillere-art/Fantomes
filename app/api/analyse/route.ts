import { NextResponse } from "next/server";
import { creerAnalyse, validerFantomes } from "@/lib/serveur/analyses";

export const runtime = "nodejs";

// Enregistre la liste détectée (jamais le relevé) et renvoie une clé d'accès secrète.
export async function POST(req: Request) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const { fantomes, reponses } = (corps ?? {}) as { fantomes?: unknown; reponses?: unknown };
  const valides = validerFantomes(fantomes);
  if (!valides) return NextResponse.json({ erreur: "Liste invalide." }, { status: 400 });
  try {
    const cle = await creerAnalyse(valides, reponses);
    return NextResponse.json({ cle });
  } catch (e) {
    console.error("analyse", e);
    return NextResponse.json({ erreur: "Enregistrement impossible, réessaie." }, { status: 500 });
  }
}
