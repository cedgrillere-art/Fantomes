import { NextResponse } from "next/server";
import { lireAnalyse, lirePrelevements, validerCle, validerFantomes } from "@/lib/serveur/analyses";
import { supabaseAdmin } from "@/lib/serveur/supabase";

export const runtime = "nodejs";

// Veille : ajoute les nouveaux prélèvements d'un relevé récent à une liste payée.
export async function POST(req: Request) {
  let corps: { cle?: unknown; fantomes?: unknown };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  if (!validerCle(corps.cle)) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  const valides = validerFantomes(corps.fantomes);
  if (!valides) return NextResponse.json({ erreur: "Liste invalide." }, { status: 400 });

  const analyse = await lireAnalyse(corps.cle);
  if (!analyse?.payee || analyse.formule !== "veille") {
    return NextResponse.json({ erreur: "Réservé à la Veille." }, { status: 403 });
  }

  const existants = await lirePrelevements(analyse.id);
  const deja = new Set(existants.map((p) => `${p.libelle}|${p.montant_centimes}`));
  const nouveaux = valides.filter((p) => !deja.has(`${p.libelle}|${p.montant_centimes}`));
  if (nouveaux.length) {
    const { error } = await supabaseAdmin()
      .from("prelevements")
      .insert(nouveaux.map((p) => ({ ...p, analyse_id: analyse.id })));
    if (error) return NextResponse.json({ erreur: "Ajout impossible." }, { status: 500 });
  }
  return NextResponse.json({ ajoutes: nouveaux.length });
}
