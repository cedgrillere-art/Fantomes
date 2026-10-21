import { NextResponse } from "next/server";
import { lireAnalyse, validerCle } from "@/lib/serveur/analyses";
import { supabaseAdmin } from "@/lib/serveur/supabase";

export const runtime = "nodejs";

// Marque un abonnement comme résilié (ou l'inverse). Réservé aux analyses payées.
export async function POST(req: Request) {
  let corps: { cle?: unknown; id?: unknown; statut?: unknown };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const { cle, id, statut } = corps;
  if (
    !validerCle(cle) ||
    typeof id !== "string" ||
    !/^[0-9a-f-]{36}$/.test(id) ||
    (statut !== "actif" && statut !== "resilie")
  ) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const analyse = await lireAnalyse(cle);
  if (!analyse?.payee) return NextResponse.json({ erreur: "Accès refusé." }, { status: 403 });
  const { error } = await supabaseAdmin()
    .from("prelevements")
    .update({ statut, resilie_le: statut === "resilie" ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("analyse_id", analyse.id);
  if (error) return NextResponse.json({ erreur: "Mise à jour impossible." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
